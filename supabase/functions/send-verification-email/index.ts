import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET");

const verificationEmailHTML = (email: string, token: string, siteUrl: string, name: string, magicLink?: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LocalJobzz - Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); border-radius: 8px 8px 0 0;">
              <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: bold;">LocalJobzz</h1>
              <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.95;">India's Daily Wage Job Platform</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 24px; font-weight: 600;">
                Welcome to LocalJobzz, ${name}! 🎉
              </h2>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Thank you for joining India's fastest-growing daily wage job platform! We're excited to help you connect with job opportunities in your city.
              </p>
              
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                To get started, please verify your email address:
              </p>
              
              ${magicLink ? `
              <!-- Magic Link Button -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${magicLink}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
                      ✨ Verify Email Instantly
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                Or use this 6-digit verification code:
              </p>
              ` : `
              <p style="margin: 0 0 20px; color: #333333; font-size: 16px; line-height: 1.6;">
                Please enter this verification code:
              </p>
              `}
              
              <!-- Verification Code Box -->
              <table role="presentation" style="width: 100%; border-collapse: collapse; margin: 30px 0;">
                <tr>
                  <td align="center" style="padding: 20px; background-color: #f8f9fa; border: 2px dashed #e5e7eb; border-radius: 8px;">
                    <span style="font-size: 36px; font-weight: bold; color: #ff6b35; letter-spacing: 12px; font-family: 'Courier New', monospace;">
                      ${token}
                    </span>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 20px 0; color: #666666; font-size: 14px; line-height: 1.5; text-align: center;">
                This ${magicLink ? 'link and code will' : 'code will'} expire in <strong>15 minutes</strong>.
              </p>
              
              <!-- Quick Start Guide -->
              <div style="background-color: #f8f9fa; border-radius: 8px; padding: 24px; margin: 30px 0;">
                <h3 style="color: #1a1a1a; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">🚀 Get Started in 3 Steps:</h3>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: inline-block; width: 32px; height: 32px; background-color: #ff6b35; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 12px;">1</div>
                  <strong style="color: #1a1a1a;">Browse Jobs:</strong>
                  <span style="color: #666666;"> Explore thousands of daily wage jobs in your city</span>
                </div>
                
                <div style="margin-bottom: 16px;">
                  <div style="display: inline-block; width: 32px; height: 32px; background-color: #ff6b35; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 12px;">2</div>
                  <strong style="color: #1a1a1a;">Post a Job:</strong>
                  <span style="color: #666666;"> Need workers? Post a job in under 2 minutes</span>
                </div>
                
                <div>
                  <div style="display: inline-block; width: 32px; height: 32px; background-color: #ff6b35; color: white; border-radius: 50%; text-align: center; line-height: 32px; font-weight: 700; margin-right: 12px;">3</div>
                  <strong style="color: #1a1a1a;">AI Assistant:</strong>
                  <span style="color: #666666;"> Use our AI to find perfect job matches instantly</span>
                </div>
              </div>
              
              <!-- Pro Tip -->
              <div style="background-color: #fff3e0; border-left: 4px solid #ff6b35; padding: 16px 20px; margin: 30px 0; border-radius: 4px;">
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 1.5;">
                  <strong style="color: #ff6b35;">💡 Pro Tip:</strong> Complete your profile to get better job matches and build trust with employers!
                </p>
              </div>
              
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
          
          <!-- Help Section -->
          <tr>
            <td style="text-align: center; padding: 20px 30px; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">
                Need help getting started?
              </p>
              <p style="margin: 0;">
                <a href="https://localjobzz.com/help" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Visit Help Center</a>
                <span style="color: #cccccc; margin: 0 8px;">|</span>
                <a href="mailto:connect@localjobzz.com" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Email Support</a>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center; background-color: #f8f9fa; border-radius: 0 0 8px 8px;">
              <p style="margin: 0 0 12px; color: #666666; font-size: 14px;">
                You're receiving this email because you signed up at LocalJobzz.com
              </p>
              <p style="margin: 0 0 16px; color: #999999; font-size: 12px;">
                LocalJobzz - Connecting Daily Wage Workers with Local Jobs<br>
                India
              </p>
              <p style="margin: 0;">
                <a href="https://localjobzz.com/privacy" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
                <span style="color: #cccccc;">|</span>
                <a href="https://localjobzz.com/terms" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Terms of Service</a>
              </p>
              <p style="margin: 12px 0 0; color: #999999; font-size: 12px;">
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
            redirect_to || "https://localjobzz.lovable.app",
            undefined // No magic link in webhook flow (only OTP)
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
      
      const { email, token, token_hash, redirect_to, email_action_type, user_id, magicLink, name } = await req.json();

      if (!email || !token) {
        throw new Error("Missing required fields");
      }

      // Retry logic for better deliverability
      let emailResponse;
      let lastError;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(`Sending email attempt ${attempt}/${maxRetries} to ${email}`);
          
          emailResponse = await resend.emails.send({
            from: "LocalJobzz <noreply@localjobzz.com>",
            to: [email],
            subject: "Welcome to LocalJobzz - Verify Your Email 🎉",
            html: verificationEmailHTML(
              email,
              token,
              redirect_to || "https://localjobzz.lovable.app",
              name || "there",
              magicLink // Include magic link if provided
            ),
          });
          
          console.log("Email sent successfully:", emailResponse);
          break; // Success, exit retry loop
        } catch (error: any) {
          lastError = error;
          console.error(`Email send attempt ${attempt} failed:`, error);
          
          // Check if it's a rate limit error
          if (error.statusCode === 429 && attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
            console.log(`Rate limited, waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else if (attempt === maxRetries) {
            throw lastError; // Final attempt failed
          }
        }
      }

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
