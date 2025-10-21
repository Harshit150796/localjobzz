import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const verificationEmailHTML = (token: string, tokenHash: string, redirectTo: string, emailActionType: string, supabaseUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your LocalJobzz Account</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">LocalJobzz</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">Verify Your Account</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">📧 Verify Your Email Address</h2>
      
      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
        Welcome to LocalJobzz! Please verify your email address to activate your account and start exploring daily wage jobs in your city.
      </p>
      
      <!-- Verification Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${emailActionType}&redirect_to=${redirectTo}" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
          Verify Email Address
        </a>
      </div>
      
      <!-- Manual OTP Section -->
      <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 30px 0; text-align: center;">
        <p style="color: #666666; font-size: 14px; margin: 0 0 16px 0;">
          Or enter this verification code manually:
        </p>
        <div style="background-color: #ffffff; border: 2px dashed #ff6b35; border-radius: 8px; padding: 20px; margin: 0 auto; max-width: 200px;">
          <code style="font-size: 28px; font-weight: 700; color: #ff6b35; letter-spacing: 4px; font-family: 'Courier New', monospace;">
            ${token}
          </code>
        </div>
      </div>
      
      <!-- Security Notice -->
      <div style="background-color: #fff3e0; border-left: 4px solid #ff6b35; padding: 16px 20px; margin: 30px 0; border-radius: 4px;">
        <p style="margin: 0; color: #666666; font-size: 14px;">
          <strong style="color: #ff6b35;">🔒 Security Notice:</strong> This verification link expires in 1 hour. If you didn't create an account at LocalJobzz, you can safely ignore this email.
        </p>
      </div>
      
      <!-- Help Section -->
      <div style="text-align: center; padding: 20px 0; margin-top: 30px;">
        <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">
          Having trouble verifying your account?
        </p>
        <p style="margin: 0;">
          <a href="https://localjobzz.com/help" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Get Help</a>
          <span style="color: #cccccc; margin: 0 8px;">|</span>
          <a href="mailto:connect@localjobzz.com" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Contact Support</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 12px 0;">
        This is an automated message from LocalJobzz.com
      </p>
      <p style="color: #999999; font-size: 12px; margin: 0 0 16px 0;">
        LocalJobzz - Connecting Daily Wage Workers with Local Jobs<br>
        India
      </p>
      <p style="margin: 0;">
        <a href="https://localjobzz.com/privacy" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://localjobzz.com/terms" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms of Service</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-verification-email function invoked");

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Verify webhook signature if secret is configured
    if (hookSecret) {
      const payload = await req.text();
      const headers = Object.fromEntries(req.headers);
      const wh = new Webhook(hookSecret);

      try {
        const {
          user,
          email_data: { token, token_hash, redirect_to, email_action_type },
        } = wh.verify(payload, headers) as {
          user: { email: string; id: string };
          email_data: {
            token: string;
            token_hash: string;
            redirect_to: string;
            email_action_type: string;
            site_url: string;
          };
        };

        console.log(`Sending verification email to ${user.email}`);

        // Send verification email via Resend
        const emailResponse = await resend.emails.send({
          from: "LocalJobzz <connect@localjobzz.com>",
          to: [user.email],
          subject: "Verify Your LocalJobzz Account 📧",
          html: verificationEmailHTML(
            token,
            token_hash,
            redirect_to,
            email_action_type,
            Deno.env.get("SUPABASE_URL") ?? ""
          ),
        });

        console.log("Verification email sent successfully:", emailResponse);

        // Log email
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        await supabase.from("email_logs").insert({
          user_id: user.id,
          email_type: "verification",
          recipient_email: user.email,
          subject: "Verify Your LocalJobzz Account",
          status: "sent",
          resend_email_id: emailResponse.data?.id,
          sent_at: new Date().toISOString(),
        });

        return new Response(
          JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      } catch (error: any) {
        console.error("Webhook verification failed:", error);
        return new Response(
          JSON.stringify({
            error: {
              http_code: 401,
              message: "Webhook verification failed",
            },
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // No webhook secret configured - accept direct calls (for testing)
      console.warn("WARNING: SEND_EMAIL_HOOK_SECRET not configured - webhook verification disabled");
      
      const { email, token, token_hash, redirect_to, email_action_type, user_id } = await req.json();

      if (!email || !token || !token_hash) {
        throw new Error("Missing required fields");
      }

      const emailResponse = await resend.emails.send({
        from: "LocalJobzz <connect@localjobzz.com>",
        to: [email],
        subject: "Verify Your LocalJobzz Account 📧",
        html: verificationEmailHTML(
          token,
          token_hash,
          redirect_to || "https://localjobzz.com",
          email_action_type || "signup",
          Deno.env.get("SUPABASE_URL") ?? ""
        ),
      });

      console.log("Verification email sent (no webhook):", emailResponse);

      return new Response(
        JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

serve(handler);
