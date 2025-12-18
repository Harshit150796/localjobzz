import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

// Generate password reset email HTML
function passwordResetEmailHTML(name: string, otpCode: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - LocalJobzz</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8f9fa;">
  <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="background-color: #f8f9fa;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="max-width: 500px; margin: 0 auto;">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
              <h1 style="color: #ffffff; font-size: 28px; margin: 0 0 8px 0; font-weight: 700;">🔑 Password Reset</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">New reset code</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              
              <p style="color: #1f2937; font-size: 17px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                Here's your new password reset code:
              </p>
              
              <!-- OTP Code Box -->
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); padding: 24px; border-radius: 12px; text-align: center; border: 2px dashed #f97316;">
                    <p style="color: #92400e; font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; font-weight: 600;">Your Reset Code</p>
                    <p style="font-size: 40px; font-weight: 800; color: #ea580c; letter-spacing: 8px; margin: 0; font-family: 'Courier New', monospace;">${otpCode}</p>
                  </td>
                </tr>
              </table>
              
              <!-- Timer Warning -->
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #fef2f2; padding: 16px; border-radius: 8px; text-align: center; border-left: 4px solid #ef4444;">
                    <p style="color: #991b1b; font-size: 14px; margin: 0;">
                      ⏱️ This code expires in <strong>5 minutes</strong>
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Having trouble? Contact us at <a href="mailto:support@localjobzz.com" style="color: #f97316; text-decoration: none;">support@localjobzz.com</a>
              </p>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="color: #9ca3af; font-size: 13px; margin: 0 0 8px 0;">
                © 2025 LocalJobzz. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

interface ResendResetOTPRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResendResetOTPRequest = await req.json();
    console.log('Resending password reset OTP for:', email);

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Find the most recent pending reset request
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
      return new Response(
        JSON.stringify({ error: 'No pending reset request found. Please start over.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check cooldown (30 seconds)
    if (resetRequest.last_resend_at) {
      const lastResend = new Date(resetRequest.last_resend_at);
      const cooldownEnd = new Date(lastResend.getTime() + 30 * 1000);
      
      if (new Date() < cooldownEnd) {
        const waitSeconds = Math.ceil((cooldownEnd.getTime() - Date.now()) / 1000);
        return new Response(
          JSON.stringify({ error: `Please wait ${waitSeconds} seconds before requesting another code` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
    }

    // Check resend limit (max 3 per hour)
    if (resetRequest.resend_count >= 3) {
      return new Response(
        JSON.stringify({ error: 'Maximum resend limit reached. Please try again later.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('email', email.toLowerCase())
      .single();

    const userName = profile?.name || email.split('@')[0];

    // Generate new OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashValue(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Update the reset request
    const { error: updateError } = await supabaseAdmin
      .from('password_reset_requests')
      .update({
        otp_code: otpCode,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        resend_count: resetRequest.resend_count + 1,
        last_resend_at: new Date().toISOString()
      })
      .eq('id', resetRequest.id);

    if (updateError) {
      console.error('Error updating reset request:', updateError);
      throw updateError;
    }

    // Send the email
    await resend.emails.send({
      from: 'LocalJobzz <noreply@localjobzz.com>',
      to: [email],
      subject: '🔑 Your New Password Reset Code - LocalJobzz',
      html: passwordResetEmailHTML(userName, otpCode),
    });

    console.log('Password reset OTP resent successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'New reset code sent',
        remainingResends: 3 - (resetRequest.resend_count + 1),
        expiresIn: 300
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in resend-password-reset-otp:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to resend code' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
