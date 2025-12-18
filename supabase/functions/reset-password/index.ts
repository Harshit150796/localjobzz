import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResetPasswordRequest {
  email: string;
  resetToken: string;
  newPassword: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, resetToken, newPassword }: ResetPasswordRequest = await req.json();
    console.log('Resetting password for:', email);

    if (!email || !resetToken || !newPassword) {
      return new Response(
        JSON.stringify({ error: 'Email, reset token, and new password are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Validate password length
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters long' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the verified reset request with matching token
    const { data: resetRequest, error: fetchError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('reset_token', resetToken)
      .not('verified_at', 'is', null)
      .is('used_at', null)
      .single();

    if (fetchError || !resetRequest) {
      console.error('Valid reset request not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired reset session. Please start over.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if reset token is still valid (15 minutes after verification)
    const verifiedAt = new Date(resetRequest.verified_at);
    const fifteenMinutesLater = new Date(verifiedAt.getTime() + 15 * 60 * 1000);
    
    if (new Date() > fifteenMinutesLater) {
      console.log('Reset session expired');
      return new Response(
        JSON.stringify({ error: 'Reset session expired. Please start over.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Find the user in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      throw authError;
    }

    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      console.error('User not found in auth');
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Update the user's password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.error('Error updating password:', updateError);
      throw updateError;
    }

    // Mark the reset request as used
    await supabaseAdmin
      .from('password_reset_requests')
      .update({ used_at: new Date().toISOString() })
      .eq('id', resetRequest.id);

    console.log('Password reset successful for user:', user.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset successfully. You can now login with your new password.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in reset-password:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to reset password' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
