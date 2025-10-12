import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const systemPrompt = `You are a helpful AI assistant for localjobzz, a daily job platform in India.
Your role is to help users in two ways:

1. POSTING JOBS: If user wants to post a job, collect these details conversationally:
   - Job title (what work needs to be done)
   - Job category (choose from: Household Work, Delivery & Logistics, Construction & Labor, Security & Safety, Hospitality & Food, Technical & Repair, Healthcare & Support, Sales & Marketing, Education & Tutoring, Agriculture & Farming)
   - Location (city, state in India)
   - Daily salary in ₹
   - Job description (be specific about work details)
   - Phone number (10 digits)
   - Urgency (normal, urgent, or immediate)

2. FINDING JOBS: If user is looking for work, ask about:
   - What type of work they want
   - Preferred location
   - Expected salary range
   Then search the jobs database and recommend matches.

Be conversational, friendly, and efficient. Speak in English but understand Hindi/Hinglish.
Once you have all required information, use the appropriate tool.
For job posting, make sure user is logged in before using create_job_post tool.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "create_job_post",
          description: "Create a new job posting with collected details. User must be authenticated.",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string", description: "Job title" },
              category: { type: "string", description: "Job category" },
              job_type: { type: "string", description: "Type of work" },
              location: { type: "string", description: "Location (city, state)" },
              daily_salary: { type: "string", description: "Daily salary in ₹" },
              description: { type: "string", description: "Detailed job description" },
              phone: { type: "string", description: "Contact phone number" },
              urgency: { type: "string", enum: ["normal", "urgent", "immediate"] }
            },
            required: ["title", "category", "job_type", "location", "daily_salary", "description", "phone", "urgency"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "search_jobs",
          description: "Search for jobs based on criteria",
          parameters: {
            type: "object",
            properties: {
              job_type: { type: "string", description: "Type of work to search for" },
              location: { type: "string", description: "Location to search in" },
              min_salary: { type: "string", description: "Minimum daily salary" },
              max_salary: { type: "string", description: "Maximum daily salary" }
            }
          }
        }
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        tools,
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "AI is busy, please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI service requires credits. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Stream the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (let line of lines) {
              if (line.startsWith(':') || !line.trim()) continue;
              if (!line.startsWith('data: ')) continue;

              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;

              try {
                const parsed = JSON.parse(data);
                
                // Check for tool calls
                if (parsed.choices?.[0]?.delta?.tool_calls) {
                  const toolCall = parsed.choices[0].delta.tool_calls[0];
                  
                  if (toolCall.function?.name === 'create_job_post') {
                    if (!user) {
                      controller.enqueue(new TextEncoder().encode('data: {"error": "Please sign in to post a job"}\n\n'));
                      continue;
                    }
                    
                    const args = JSON.parse(toolCall.function.arguments);
                    const { error } = await supabase.from('jobs').insert({
                      user_id: user.id,
                      title: args.title,
                      category: args.category,
                      job_type: args.job_type,
                      location: args.location,
                      daily_salary: args.daily_salary,
                      description: args.description,
                      phone: args.phone,
                      urgency: args.urgency,
                      status: 'active'
                    });

                    if (error) {
                      console.error('Job creation error:', error);
                      controller.enqueue(new TextEncoder().encode('data: {"error": "Failed to create job"}\n\n'));
                    } else {
                      controller.enqueue(new TextEncoder().encode('data: {"tool_result": "job_created"}\n\n'));
                    }
                  } else if (toolCall.function?.name === 'search_jobs') {
                    const args = JSON.parse(toolCall.function.arguments);
                    let query = supabase.from('jobs').select('*').eq('status', 'active');
                    
                    if (args.job_type) {
                      query = query.ilike('job_type', `%${args.job_type}%`);
                    }
                    if (args.location) {
                      query = query.ilike('location', `%${args.location}%`);
                    }
                    
                    const { data: jobs, error } = await query.limit(5);
                    
                    if (!error && jobs) {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        tool_result: "jobs_found",
                        jobs: jobs.map(j => ({
                          id: j.id,
                          title: j.title,
                          location: j.location,
                          daily_salary: j.daily_salary,
                          job_type: j.job_type,
                          created_at: j.created_at
                        }))
                      })}\n\n`));
                    }
                  }
                } else {
                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                }
              } catch (e) {
                console.error('Parse error:', e);
              }
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
