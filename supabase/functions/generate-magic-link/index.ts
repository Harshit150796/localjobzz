import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateMagicLinkRequest {
  email: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, userId }: GenerateMagicLinkRequest = await req.json();
    console.log('Generating magic link for:', email);

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

    // Generate secure random token
    const tokenArray = new Uint8Array(32);
    crypto.getRandomValues(tokenArray);
    const token = Array.from(tokenArray, byte => byte.toString(16).padStart(2, '0')).join('');

    // Set expiration to 15 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    // Store token in database
    const { error: insertError } = await supabaseAdmin
      .from('magic_tokens')
      .insert({
        user_id: userId,
        token,
        email,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error('Error inserting magic token:', insertError);
      throw insertError;
    }

    // Generate magic link
    const magicLink = `https://localjobzz.com/verify?token=${token}`;
    console.log('Magic link generated:', magicLink);

    // Send email with magic link via the send-verification-email function
    const { error: emailError } = await supabaseAdmin.functions.invoke('send-verification-email', {
      body: {
        email,
        token, // OTP code (kept for fallback)
        magicLink, // New magic link
      }
    });

    if (emailError) {
      console.error('Error sending verification email:', emailError);
      throw emailError;
    }

    console.log('Magic link email sent successfully to:', email);

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