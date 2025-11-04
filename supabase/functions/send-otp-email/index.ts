import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const otpEmailHTML = (name: string, otpCode: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Verify Your Email - LocalJobzz</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 40px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">LocalJobzz</h1>
      <p style="color: #ffffff; margin-top: 10px; font-size: 16px;">Welcome, ${name}! 🎉</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 40px;">
      <h2 style="color: #1a1a1a; margin-bottom: 20px; font-size: 24px;">Verify Your Email</h2>
      <p style="color: #333333; line-height: 1.6; margin-bottom: 30px; font-size: 16px;">
        Thank you for joining LocalJobzz! Please enter this verification code to complete your registration:
      </p>
      
      <!-- OTP Box -->
      <div style="background-color: #f8f9fa; border: 2px dashed #ff6b35; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0;">
        <div style="font-size: 48px; font-weight: bold; color: #ff6b35; letter-spacing: 16px; font-family: 'Courier New', monospace;">
          ${otpCode}
        </div>
      </div>
      
      <p style="color: #666666; font-size: 14px; text-align: center; margin-top: 20px;">
        This code expires in <strong>15 minutes</strong>
      </p>
      
      <!-- Security Notice -->
      <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 30px; border-radius: 4px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          🔒 <strong>Security:</strong> Never share this code with anyone. LocalJobzz will never ask for your verification code.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px; text-align: center;">
      <p style="color: #999999; font-size: 12px; margin: 0;">
        © 2024 LocalJobzz. All rights reserved.
      </p>
      <p style="color: #999999; font-size: 12px; margin-top: 8px;">
        If you didn't request this code, please ignore this email.
      </p>
    </div>
  </div>
</body>
</html>
`;

interface SendOTPEmailRequest {
  email: string;
  name: string;
  otpCode: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, otpCode }: SendOTPEmailRequest = await req.json();

    console.log('Sending OTP email to:', email);

    const { data, error } = await resend.emails.send({
      from: "LocalJobzz <noreply@localjobzz.com>",
      to: [email],
      subject: "Your LocalJobzz Verification Code 🔐",
      html: otpEmailHTML(name, otpCode),
    });

    if (error) {
      console.error('Resend error:', error);
      throw error;
    }

    console.log('OTP email sent successfully:', data?.id);

    return new Response(
      JSON.stringify({ success: true, emailId: data?.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in send-otp-email:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send email' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
};

serve(handler);
