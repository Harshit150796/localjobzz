import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyTokenRequest {
  token: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token }: VerifyTokenRequest = await req.json();
    console.log('Verifying magic token...');

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Find the token in database
    const { data: tokenData, error: fetchError } = await supabaseAdmin
      .from('magic_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (fetchError || !tokenData) {
      console.error('Token not found:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if token has expired
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    
    if (now > expiresAt) {
      console.error('Token expired');
      return new Response(
        JSON.stringify({ error: 'Token has expired. Please request a new verification link.' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Check if token has already been verified
    if (tokenData.verified_at) {
      console.log('Token already verified');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email already verified',
          alreadyVerified: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Mark token as verified
    const { error: updateError } = await supabaseAdmin
      .from('magic_tokens')
      .update({ verified_at: new Date().toISOString() })
      .eq('token', token);

    if (updateError) {
      console.error('Error updating token:', updateError);
      throw updateError;
    }

    // Verify the user's email in Supabase Auth
    const { error: verifyError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenData.user_id,
      { email_confirmed_at: new Date().toISOString() }
    );

    if (verifyError) {
      console.error('Error verifying user email:', verifyError);
      throw verifyError;
    }

    console.log('Token verified successfully for user:', tokenData.user_id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified successfully',
        userId: tokenData.user_id,
        email: tokenData.email
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in verify-magic-token:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});