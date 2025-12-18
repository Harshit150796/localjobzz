import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to hash OTP
async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

interface VerifyResetOTPRequest {
  email: string;
  otpCode: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otpCode }: VerifyResetOTPRequest = await req.json();
    console.log('Verifying password reset OTP for:', email);

    if (!email || !otpCode) {
      return new Response(
        JSON.stringify({ error: 'Email and OTP code are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the most recent reset request for this email
    const { data: resetRequest, error: fetchError } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .is('verified_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (fetchError || !resetRequest) {
      console.error('Reset request not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'No pending password reset request found. Please request a new reset code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if OTP has expired
    const now = new Date();
    const expiresAt = new Date(resetRequest.expires_at);
    
    if (now > expiresAt) {
      console.log('OTP expired');
      return new Response(
        JSON.stringify({ error: 'Reset code has expired. Please request a new one.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check attempts (max 5)
    if (resetRequest.attempts >= 5) {
      console.log('Too many attempts');
      return new Response(
        JSON.stringify({ error: 'Too many failed attempts. Please request a new reset code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Verify the OTP
    const providedHash = await hashValue(otpCode);
    
    if (providedHash !== resetRequest.otp_hash) {
      // Increment attempts
      const newAttempts = resetRequest.attempts + 1;
      await supabaseAdmin
        .from('password_reset_requests')
        .update({ attempts: newAttempts })
        .eq('id', resetRequest.id);

      const remaining = 5 - newAttempts;
      console.log(`Invalid OTP, ${remaining} attempts remaining`);
      
      return new Response(
        JSON.stringify({ 
          error: `Invalid reset code. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Generate a reset token for the next step
    const resetToken = crypto.randomUUID();

    // Mark as verified and store reset token
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({ 
        verified_at: new Date().toISOString(),
        reset_token: resetToken
      })
      .eq('id', resetRequest.id);

    if (updateError) {
      console.error('Error updating reset request:', updateError);
      throw updateError;
    }

    console.log('Password reset OTP verified successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Code verified successfully',
        resetToken: resetToken
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in verify-password-reset-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Verification failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
