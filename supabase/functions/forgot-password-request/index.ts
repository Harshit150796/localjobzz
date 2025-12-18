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
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0;">Reset your password securely</p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
              
              <p style="color: #1f2937; font-size: 17px; line-height: 1.6; margin: 0 0 16px 0;">
                Hi <strong>${name}</strong>,
              </p>
              
              <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                You requested to reset your password for your LocalJobzz account. Use this code to verify your identity:
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
              
              <!-- Security Notice -->
              <table role="presentation" cellspacing="0" cellpadding="0" width="100%" style="margin: 0 0 24px 0;">
                <tr>
                  <td style="background-color: #fef9c3; padding: 16px; border-radius: 8px; border-left: 4px solid #eab308;">
                    <p style="color: #854d0e; font-size: 14px; margin: 0;">
                      🔒 <strong>Security:</strong> If you didn't request this reset, you can safely ignore this email. Your password will remain unchanged.
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
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                This is an automated message, please do not reply.
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

interface ForgotPasswordRequest {
  email: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ForgotPasswordRequest = await req.json();
    console.log('Password reset request for:', email);

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

    // Check if user exists in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users:', authError);
      throw authError;
    }

    const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      // Don't reveal if email exists or not for security
      console.log('User not found, returning success anyway for security');
      return new Response(
        JSON.stringify({ success: true, message: 'If an account exists, a reset code will be sent.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get user profile for name
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('name')
      .eq('user_id', user.id)
      .single();

    const userName = profile?.name || email.split('@')[0];

    // Check for existing recent reset request (rate limiting)
    const { data: existingRequest } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('used_at', null)
      .gte('created_at', new Date(Date.now() - 60000).toISOString()) // Within last minute
      .single();

    if (existingRequest) {
      return new Response(
        JSON.stringify({ error: 'Please wait at least 1 minute before requesting another reset code' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await hashValue(otpCode);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store the reset request
    const { error: insertError } = await supabaseAdmin
      .from('password_reset_requests')
      .insert({
        email: email.toLowerCase(),
        otp_code: otpCode,
        otp_hash: otpHash,
        expires_at: expiresAt.toISOString(),
        attempts: 0,
        resend_count: 0
      });

    if (insertError) {
      console.error('Error storing reset request:', insertError);
      throw insertError;
    }

    // Send the email
    const emailResponse = await resend.emails.send({
      from: 'LocalJobzz <noreply@localjobzz.com>',
      to: [email],
      subject: '🔑 Reset Your LocalJobzz Password',
      html: passwordResetEmailHTML(userName, otpCode),
    });

    console.log('Password reset email sent:', emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset code sent to your email',
        expiresIn: 300 // 5 minutes in seconds
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error: any) {
    console.error('Error in forgot-password-request:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to process request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
