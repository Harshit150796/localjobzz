import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateMagicLinkRequest {
  email: string;
  userId: string;
  name?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId, name }: GenerateMagicLinkRequest = await req.json();
    console.log('Generating magic link for:', email, 'Name:', name || 'Not provided');

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

    // Generate secure random token for magic link (32-byte hex)
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const magicToken = Array.from(tokenArray, byte => byte.toString(16).padStart(2, '0')).join('');

    // Generate 6-digit OTP code for fallback
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP code:', otpCode);

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Store both tokens in database
    const { error: insertError } = await supabaseAdmin
      .from('magic_tokens')
      .insert({
        user_id: userId,
        token: magicToken,
        otp_code: otpCode,
        email,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting magic token:', insertError);
      throw insertError;
    }

    console.log('Magic token and OTP stored successfully');

    // Generate magic link
    const magicLink = `https://localjobzz.com/verify?token=${magicToken}`;
    console.log('Magic link generated:', magicLink);

    // Send consolidated email with magic link, OTP, and welcome content
    // Add timeout protection to prevent exceeding 5-second limit
    console.log('Invoking send-verification-email with magic link and OTP...');
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4-second timeout
    
    try {
      const { data: emailData, error: emailError } = await supabaseAdmin.functions.invoke('send-verification-email', {
        body: {
          email,
          token: otpCode, // Send 6-digit OTP for display in email
          magicLink, // Magic link for instant verification
          name: name || 'there', // User's name for personalization
          redirect_to: 'https://localjobzz.com',
          user_id: userId,
        }
      });

      clearTimeout(timeout);

      if (emailError) {
        console.error('Error sending verification email:', emailError);
        throw emailError;
      }
    } catch (error) {
      clearTimeout(timeout);
      throw error;
    }

    console.log('Consolidated verification email sent successfully to:', email, 'Response:', emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Magic link sent successfully',
        expiresAt: expiresAt.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('Error in generate-magic-link:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});