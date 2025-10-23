import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  name: string;
}

const welcomeEmailHTML = (name: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LocalJobzz</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 32px; margin: 0; font-weight: 700;">LocalJobzz</h1>
      <p style="color: #ffffff; font-size: 16px; margin: 10px 0 0 0; opacity: 0.95;">India's Daily Wage Job Platform</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 20px;">
      <h2 style="color: #1a1a1a; font-size: 24px; margin: 0 0 20px 0; font-weight: 600;">Welcome to LocalJobzz, ${name}! 🎉</h2>
      
      <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
        Thank you for joining India's fastest-growing daily wage job platform! We're excited to help you connect with job opportunities in your city.
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
        <p style="margin: 0; color: #666666; font-size: 14px;">
          <strong style="color: #ff6b35;">💡 Pro Tip:</strong> Complete your profile to get better job matches and build trust with employers!
        </p>
      </div>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="https://localjobzz.com" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
          Start Exploring Jobs
        </a>
      </div>
      
      <!-- Help Section -->
      <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e0e0e0; margin-top: 40px;">
        <p style="color: #666666; font-size: 14px; margin: 0 0 8px 0;">
          Need help getting started?
        </p>
        <p style="margin: 0;">
          <a href="https://localjobzz.com/help" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Visit Help Center</a>
          <span style="color: #cccccc; margin: 0 8px;">|</span>
          <a href="mailto:connect@localjobzz.com" style="color: #ff6b35; text-decoration: none; font-weight: 600;">Email Support</a>
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 12px 0;">
        You're receiving this email because you signed up at LocalJobzz.com
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
  console.log("send-welcome-email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, name }: WelcomeEmailRequest = await req.json();
    console.log(`Sending welcome email to ${email} for user ${userId}`);

    if (!email || !name) {
      throw new Error("Email and name are required");
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "LocalJobzz <noreply@localjobzz.com>",
      to: [email],
      subject: "Welcome to LocalJobzz - Your Daily Wage Job Partner! 🎉",
      html: welcomeEmailHTML(name),
    });

    console.log("Email sent successfully via Resend:", emailResponse);

    // Log email to database
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { error: logError } = await supabase.from("email_logs").insert({
      user_id: userId,
      email_type: "welcome",
      recipient_email: email,
      subject: "Welcome to LocalJobzz - Your Daily Wage Job Partner! 🎉",
      status: "sent",
      resend_email_id: emailResponse.data?.id,
      sent_at: new Date().toISOString(),
    });

    if (logError) {
      console.error("Error logging email:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.data?.id }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);

    // Try to log the error
    try {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      await supabase.from("email_logs").insert({
        email_type: "welcome",
        recipient_email: "unknown",
        subject: "Welcome to LocalJobzz - Your Daily Wage Job Partner! 🎉",
        status: "failed",
        error_message: error.message,
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
