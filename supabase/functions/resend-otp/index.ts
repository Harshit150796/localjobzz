import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import * as bcrypt from "https://deno.land/x/bcrypt@v0.4.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ResendOTPRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResendOTPRequest = await req.json();

    console.log('Resending OTP for:', email);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get pending registration
    const { data: pending, error } = await supabase
      .from('pending_registrations')
      .select('*')
      .eq('email', email)
      .is('verified_at', null)
      .single();

    if (error || !pending) {
      console.error('No pending registration found');
      return new Response(
        JSON.stringify({ error: 'No pending registration found for this email' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Check 30-second cooldown
    if (pending.last_resend_at) {
      const timeSinceLastResend = Date.now() - new Date(pending.last_resend_at).getTime();
      if (timeSinceLastResend < 30000) {
        const waitTime = Math.ceil((30000 - timeSinceLastResend) / 1000);
        return new Response(
          JSON.stringify({ error: `Please wait ${waitTime} seconds before resending.` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    // Check hourly resend limit (3 per hour)
    const oneHourAgo = new Date(Date.now() - 3600000);
    if (pending.created_at && new Date(pending.created_at) > oneHourAgo && pending.resend_count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Maximum resend limit reached (3 per hour). Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(newOTP);
    
    // Set new expiration (5 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 5);

    console.log('Generated new OTP for', email);

    // Update OTP with new hash, reset attempts, increment resend count
    await supabase
      .from('pending_registrations')
      .update({
        otp_code: newOTP, // Keep for send-otp-email
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0, // Reset attempts
        resend_count: (pending.resend_count || 0) + 1,
        last_resend_at: new Date().toISOString()
      })
      .eq('email', email);

    console.log('Sending new OTP email...');

    // Send new OTP email
    await supabase.functions.invoke('send-otp-email', {
      body: { email, name: pending.name, otpCode: newOTP }
    });

    const remainingResends = 3 - (pending.resend_count || 0) - 1;

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'New verification code sent. Valid for 5 minutes.',
        expiresAt: expiresAt.toISOString(),
        remainingResends: Math.max(0, remainingResends)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in resend-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to resend code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
