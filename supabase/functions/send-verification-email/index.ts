import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const verificationEmailHTML = (email: string, token: string, siteUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">Verify Your LocalJobzz Account 📧</h1>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Hi there! 👋
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                Welcome to <strong>LocalJobzz</strong>! We're excited to have you join our community of local job seekers and posters.
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.5;">
                To complete your registration, please enter the verification code below on our website:
              </p>
              
              <!-- Verification Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 8px;">
                    <span style="font-size: 32px; font-weight: bold; color: #f97316; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${token}
                    </span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5;">
                This code will expire in <strong>60 minutes</strong>.
              </p>
              
              <!-- CTA Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${siteUrl}/verify-email?email=${encodeURIComponent(email)}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f97316 0%, #ef4444 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Go to Verification Page
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td style="padding: 20px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 1.5;">
                      🔒 <strong>Security Tip:</strong> Never share this code with anyone. LocalJobzz will never ask for your verification code.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0 0; color: #666666; font-size: 14px; line-height: 1.5;">
                If you didn't create an account with LocalJobzz, you can safely ignore this email.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f9fafb; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 10px; color: #666666; font-size: 14px;">
                Thanks for joining LocalJobzz! 🎉
              </p>
              <p style="margin: 0; color: #999999; font-size: 12px;">
                © 2024 LocalJobzz. All rights reserved.
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
      
      // Parse the secret to handle different formats
      // Supabase sends secrets like "v1,whsec_BASE64DATA"
      // but standardwebhooks library expects just "whsec_BASE64DATA"
      let secretToUse = hookSecret;
      if (hookSecret.startsWith('v1,')) {
        secretToUse = hookSecret.substring(3); // Remove "v1," prefix
      }
      
      const wh = new Webhook(secretToUse);

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
      from: "LocalJobzz <noreply@localjobzz.com>",
          to: [user.email],
          subject: "Verify Your LocalJobzz Account 📧",
          html: verificationEmailHTML(
            user.email,
            token,
            redirect_to || "https://localjobzz.lovable.app"
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
        from: "LocalJobzz <noreply@localjobzz.com>",
        to: [email],
        subject: "Verify Your LocalJobzz Account 📧",
        html: verificationEmailHTML(
          email,
          token,
          redirect_to || "https://localjobzz.lovable.app"
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
