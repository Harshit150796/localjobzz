import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PromotionalEmailRequest {
  subject: string;
  content: string;
  targetSegment?: "all" | "employers" | "workers" | "city-specific";
  filterCities?: string[];
  testMode?: boolean;
  testEmail?: string;
}

const promotionalEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LocalJobzz Update</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">LocalJobzz</h1>
      <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.95;">India's Daily Wage Job Platform</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 20px;">
      ${content}
    </div>
    
    <!-- CTA Section -->
    <div style="text-align: center; padding: 0 20px 40px 20px;">
      <a href="https://localjobzz.com" style="display: inline-block; background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(255, 107, 53, 0.3);">
        Visit LocalJobzz
      </a>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 12px 0;">
        You're receiving this promotional email from LocalJobzz.com
      </p>
      <p style="color: #999999; font-size: 12px; margin: 0 0 16px 0;">
        LocalJobzz - Connecting Daily Wage Workers with Local Jobs<br>
        India
      </p>
      <p style="margin: 0;">
        <a href="https://localjobzz.com/profile" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Manage Preferences</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://localjobzz.com/unsubscribe" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Unsubscribe</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://localjobzz.com/privacy" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Privacy Policy</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-promotional-email function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subject,
      content,
      targetSegment = "all",
      filterCities = [],
      testMode = false,
      testEmail,
    }: PromotionalEmailRequest = await req.json();

    console.log(`Sending promotional email: ${subject} to segment: ${targetSegment}`);

    if (!subject || !content) {
      throw new Error("Subject and content are required");
    }

    // Test mode - send to single email
    if (testMode) {
      if (!testEmail) {
        throw new Error("Test email is required in test mode");
      }

      const emailResponse = await resend.emails.send({
        from: "LocalJobzz <connect@localjobzz.com>",
        to: [testEmail],
        subject: `[TEST] ${subject}`,
        html: promotionalEmailTemplate(content),
      });

      console.log("Test email sent:", emailResponse);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Test email sent successfully",
          emailId: emailResponse.data?.id,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Production mode - send to users based on preferences
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get users who opted in for promotional emails
    let query = supabase
      .from("user_email_preferences")
      .select("*, profiles!inner(user_id, name, email, location)")
      .eq("receive_promotional", true);

    // Apply city filter if specified
    if (targetSegment === "city-specific" && filterCities.length > 0) {
      query = query.in("alert_cities", filterCities);
    }

    const { data: preferences, error: prefError } = await query;

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      throw prefError;
    }

    console.log(`Found ${preferences?.length || 0} users to send promotional email`);

    let totalSent = 0;
    let totalErrors = 0;
    const batchSize = 50; // Send in batches to avoid rate limits

    // Process in batches
    for (let i = 0; i < (preferences?.length || 0); i += batchSize) {
      const batch = preferences?.slice(i, i + batchSize) || [];

      await Promise.all(
        batch.map(async (pref) => {
          try {
            const profile = pref.profiles as any;

            if (!profile?.email) {
              console.log(`Skipping user: No email`);
              return;
            }

            // Send email
            const emailResponse = await resend.emails.send({
              from: "LocalJobzz <connect@localjobzz.com>",
              to: [profile.email],
              subject: subject,
              html: promotionalEmailTemplate(content),
            });

            console.log(`Email sent to ${profile.email}`);

            // Log email
            await supabase.from("email_logs").insert({
              user_id: profile.user_id,
              email_type: "promotional",
              recipient_email: profile.email,
              subject: subject,
              status: "sent",
              resend_email_id: emailResponse.data?.id,
              sent_at: new Date().toISOString(),
            });

            totalSent++;
          } catch (userError: any) {
            console.error(`Error sending to user:`, userError);
            totalErrors++;

            // Log error
            await supabase.from("email_logs").insert({
              email_type: "promotional",
              recipient_email: (pref.profiles as any)?.email || "unknown",
              subject: subject,
              status: "failed",
              error_message: userError.message,
            });
          }
        })
      );

      // Rate limiting - wait 1 second between batches
      if (i + batchSize < (preferences?.length || 0)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    console.log(`Promotional email complete: ${totalSent} sent, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: totalSent,
        errors: totalErrors,
        totalUsers: preferences?.length || 0,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-promotional-email function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
