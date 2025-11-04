import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

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

    // Generate new OTP
    const newOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    console.log('Generated new OTP:', newOTP);

    // Update OTP
    await supabase
      .from('pending_registrations')
      .update({
        otp_code: newOTP,
        expires_at: expiresAt.toISOString(),
        attempts: 0
      })
      .eq('email', email);

    console.log('Sending new OTP email...');

    // Send new OTP email
    await supabase.functions.invoke('send-otp-email', {
      body: { email, name: pending.name, otpCode: newOTP }
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'New verification code sent',
        expiresAt: expiresAt.toISOString()
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
