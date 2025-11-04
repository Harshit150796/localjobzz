import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyOTPRequest {
  email: string;
  otpCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, otpCode }: VerifyOTPRequest = await req.json();

    console.log('Verifying OTP for:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find pending registration
    const { data: pending, error: fetchError } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .is('verified_at', null)
      .single();

    if (fetchError || !pending) {
      console.error('Pending registration not found or already verified');
      
      // Increment attempts if registration exists
      if (pending) {
        await supabase
          .from('pending_registrations')
          .update({ attempts: pending.attempts + 1 })
          .eq('email', email);
      }

      return new Response(
        JSON.stringify({ error: 'Invalid or expired verification code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check if OTP matches
    if (pending.otp_code !== otpCode) {
      console.error('OTP mismatch');
      
      await supabase
        .from('pending_registrations')
        .update({ attempts: pending.attempts + 1 })
        .eq('email', email);

      return new Response(
        JSON.stringify({ error: 'Invalid verification code. Please try again.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check expiration
    if (new Date() > new Date(pending.expires_at)) {
      console.error('OTP expired');
      return new Response(
        JSON.stringify({ error: 'Verification code has expired. Please request a new code.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('OTP verified, creating Supabase Auth account...');

    // Create Supabase Auth account NOW (after verification)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: pending.email,
      password: pending.password_hash,
      email_confirm: true, // Mark as verified immediately
      user_metadata: {
        name: pending.name,
        phone: pending.phone
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      
      // Check if user already exists
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        // Mark as verified anyway since the email is verified
        await supabase
          .from('pending_registrations')
          .update({ verified_at: new Date().toISOString() })
          .eq('email', email);
          
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Email verified! You can now login.',
            alreadyExists: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
      
      throw authError;
    }

    console.log('Auth account created successfully:', authData.user.id);

    // Mark as verified
    await supabase
      .from('pending_registrations')
      .update({ verified_at: new Date().toISOString() })
      .eq('email', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email verified! Account created successfully.',
        userId: authData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in verify-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Verification failed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
