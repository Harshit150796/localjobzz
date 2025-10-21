import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  daily_salary: string;
  urgency: string;
  description: string;
}

const jobAlertEmailHTML = (userName: string, jobs: Job[], city: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Daily Job Alerts</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #ff6b35 0%, #ff8f5c 100%); padding: 30px 20px; text-align: center;">
      <h1 style="color: #ffffff; font-size: 28px; margin: 0; font-weight: 700;">🔔 Daily Job Alert</h1>
      <p style="color: #ffffff; font-size: 14px; margin: 10px 0 0 0; opacity: 0.95;">New jobs matching your preferences</p>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px 20px;">
      <p style="color: #1a1a1a; font-size: 18px; margin: 0 0 8px 0; font-weight: 600;">Good morning, ${userName}! ☀️</p>
      <p style="color: #666666; font-size: 15px; margin: 0 0 24px 0;">
        We found <strong style="color: #ff6b35;">${jobs.length} new ${jobs.length === 1 ? 'job' : 'jobs'}</strong> in ${city} that match your preferences.
      </p>
      
      <!-- Job Listings -->
      ${jobs.map((job, index) => `
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 16px; border-left: 4px solid ${job.urgency === 'urgent' ? '#ff0000' : '#ff6b35'};">
          <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
            <h3 style="color: #1a1a1a; font-size: 18px; margin: 0; font-weight: 600;">${job.title}</h3>
            ${job.urgency === 'urgent' ? '<span style="background-color: #ff0000; color: white; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600;">URGENT</span>' : ''}
          </div>
          
          <div style="margin-bottom: 12px;">
            <span style="background-color: #e3f2fd; color: #1976d2; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-right: 8px;">${job.category || 'General'}</span>
            <span style="color: #666666; font-size: 14px;">📍 ${job.location}</span>
          </div>
          
          <p style="color: #333333; font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">
            ${job.description.length > 150 ? job.description.substring(0, 150) + '...' : job.description}
          </p>
          
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #ff6b35; font-size: 18px; font-weight: 700;">₹${job.daily_salary}</span>
            <a href="https://localjobzz.com?jobId=${job.id}" style="background-color: #ff6b35; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
              View Details →
            </a>
          </div>
        </div>
      `).join('')}
      
      ${jobs.length >= 10 ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://localjobzz.com" style="color: #ff6b35; text-decoration: none; font-weight: 600; font-size: 16px;">
            View All Jobs in ${city} →
          </a>
        </div>
      ` : ''}
      
      <!-- Manage Preferences -->
      <div style="background-color: #fff3e0; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center;">
        <p style="color: #666666; font-size: 14px; margin: 0 0 12px 0;">
          Want to change your job alert preferences?
        </p>
        <a href="https://localjobzz.com/profile" style="color: #ff6b35; text-decoration: none; font-weight: 600;">
          Manage Preferences →
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0;">
      <p style="color: #666666; font-size: 14px; margin: 0 0 12px 0;">
        You're receiving this because you subscribed to job alerts at LocalJobzz.com
      </p>
      <p style="margin: 0;">
        <a href="https://localjobzz.com/profile" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Manage Preferences</a>
        <span style="color: #cccccc;">|</span>
        <a href="https://localjobzz.com/unsubscribe" style="color: #999999; text-decoration: none; font-size: 12px; margin: 0 8px;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>
`;

const handler = async (req: Request): Promise<Response> => {
  console.log("send-job-alerts function invoked");

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get users with job alerts enabled
    const { data: preferences, error: prefError } = await supabase
      .from("user_email_preferences")
      .select("*, profiles!inner(user_id, name, email)")
      .eq("receive_job_alerts", true);

    if (prefError) {
      console.error("Error fetching preferences:", prefError);
      throw prefError;
    }

    console.log(`Found ${preferences?.length || 0} users with job alerts enabled`);

    let totalSent = 0;
    let totalErrors = 0;

    // Calculate time 24 hours ago
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    for (const pref of preferences || []) {
      try {
        const profile = pref.profiles as any;
        
        if (!profile?.email || !pref.alert_cities || pref.alert_cities.length === 0) {
          console.log(`Skipping user ${profile?.user_id}: No email or cities configured`);
          continue;
        }

        // Query jobs matching user's preferences (created in last 24 hours)
        let jobQuery = supabase
          .from("jobs")
          .select("*")
          .eq("status", "active")
          .gte("created_at", yesterday.toISOString())
          .in("location", pref.alert_cities)
          .limit(10);

        // Add category filter if specified
        if (pref.alert_categories && pref.alert_categories.length > 0) {
          jobQuery = jobQuery.in("category", pref.alert_categories);
        }

        const { data: matchingJobs, error: jobError } = await jobQuery;

        if (jobError) {
          console.error("Error fetching jobs:", jobError);
          continue;
        }

        // Skip if no matching jobs
        if (!matchingJobs || matchingJobs.length === 0) {
          console.log(`No matching jobs for user ${profile.user_id}`);
          continue;
        }

        console.log(`Found ${matchingJobs.length} matching jobs for ${profile.email}`);

        // Send email
        const cityList = pref.alert_cities.join(", ");
        const emailResponse = await resend.emails.send({
          from: "LocalJobzz <connect@localjobzz.com>",
          to: [profile.email],
          subject: `🔔 ${matchingJobs.length} New ${matchingJobs.length === 1 ? 'Job' : 'Jobs'} in ${pref.alert_cities[0]} - LocalJobzz Alert`,
          html: jobAlertEmailHTML(profile.name, matchingJobs, cityList),
        });

        console.log(`Email sent to ${profile.email}:`, emailResponse);

        // Log email
        await supabase.from("email_logs").insert({
          user_id: profile.user_id,
          email_type: "job_alert",
          recipient_email: profile.email,
          subject: `${matchingJobs.length} New Jobs in ${cityList}`,
          status: "sent",
          resend_email_id: emailResponse.data?.id,
          sent_at: new Date().toISOString(),
        });

        totalSent++;
      } catch (userError: any) {
        console.error(`Error processing user:`, userError);
        totalErrors++;

        // Log error
        await supabase.from("email_logs").insert({
          email_type: "job_alert",
          recipient_email: (pref.profiles as any)?.email || "unknown",
          subject: "Job Alert",
          status: "failed",
          error_message: userError.message,
        });
      }
    }

    console.log(`Job alerts complete: ${totalSent} sent, ${totalErrors} errors`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        sent: totalSent, 
        errors: totalErrors,
        totalUsers: preferences?.length || 0
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-job-alerts function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
