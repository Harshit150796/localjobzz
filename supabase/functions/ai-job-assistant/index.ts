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
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader! } },
    });

    // Get user if authenticated
    const { data: { user } } = await supabase.auth.getUser();

    const systemPrompt = `You are a helpful AI assistant for localjobzz, a daily wage job platform serving workers and employers across India.

LANGUAGE SUPPORT:
- Speak naturally in English, Hindi, or Hinglish
- Understand: "kaam chahiye", "naukar chahiye", "maid chahiye", "job milega kya", "kaam dhundna hai"
- Common Hindi terms: kaam (work), naukar (employee), majdoor (laborer), vetan/salary, ghar ka kaam (household work)

INDIAN JOB CATEGORIES & EXAMPLES:
1. Household Work (₹300-800/day): Maid, Cook, Nanny, Driver, Gardener, Cleaner, Utensils washing
2. Delivery & Logistics (₹400-1000/day): Food delivery, Courier, Packing, Loading, Bike delivery
3. Construction & Labor (₹500-1500/day): Mason, Helper, Painter, Carpenter, Plumber, Electrician
4. Security & Safety (₹400-900/day): Security guard, Watchman, Night guard
5. Hospitality & Food (₹400-1200/day): Waiter, Kitchen helper, Hotel staff, Catering
6. Technical & Repair (₹600-2000/day): AC repair, Mobile repair, Computer tech, Mechanic
7. Healthcare & Support (₹500-1500/day): Patient care, Nursing assistant, Medical helper
8. Sales & Marketing (₹500-1500/day): Door-to-door sales, Product promotion, Shop assistant
9. Education & Tutoring (₹500-2000/day): Home tutor, Teaching assistant, Kids care
10. Agriculture & Farming (₹400-1000/day): Farm labor, Harvesting, Cattle care

MAJOR JOB MARKETS:
- Tier 1: Delhi NCR, Mumbai, Bangalore, Hyderabad, Chennai, Kolkata, Pune
- Tier 2: Jaipur, Lucknow, Ahmedabad, Surat, Indore, Chandigarh, Kochi, Bhopal
- UP Cities: Mathura, Agra, Varanasi, Kanpur, Meerut, Noida, Ghaziabad
- Note: Salary ranges vary 20-40% between metro and smaller cities

CONVERSATION PATTERNS:
When posting jobs:
- Ask warmly: "Aap ko kya kaam chahiye? (What work do you need?)"
- Clarify details: "Din ka kitna denge? (Daily wage?)", "Kahan pe kaam hai? (Location?)"
- Verify: "Emergency hai ya regular? (Urgent or normal?)"

When finding jobs:
- Understand: "Kya kaam karte ho?" = "What work do you do?"
- Suggest matches: "Aapke area mein yeh kaam milega..."
- Give realistic expectations: "Is kaam mein usually ₹X-Y milta hai"

YOUR TWO MAIN TASKS:

1. POSTING JOBS (Employer needs workers):
   Collect conversationally:
   - Job title (what work: "Cook needed", "Delivery boy chahiye")
   - Category (from above 10 categories)
   - Job type (specific work details)
   - Location (city, area, state)
   - Daily salary (₹ amount - suggest market rates if they ask)
   - Description (work hours, requirements, duties)
   - Phone (10 digits)
   - Urgency (normal/urgent/immediate - "turant chahiye?" = immediate)
   
   IMPORTANT: User must be signed in to post. If not logged in, politely ask them to sign in first.

2. FINDING JOBS (Worker looking for work):
   Ask about:
   - Type of work they want ("Kya kaam dhundh rahe ho?")
   - Location preference ("Kahan kaam karoge?")
   - Expected daily wage ("Kitna chahiye din ka?")
   - Experience level (helps with recommendations)
   
   Then search database and present matches with:
   - Job title and type
   - Location and distance (if relevant)
   - Daily wage offered
   - Contact details
   - Urgency/availability

SALARY NEGOTIATION TIPS:
- Know market rates for each job type and city
- Help both sides reach fair wage
- Consider: experience, hours, physical demands, skills needed
- Mention: "Usually ₹X milta hai, but negotiate based on experience"

CULTURAL CONTEXT:
- Be respectful and helpful to both workers and employers
- Understand economic challenges of daily wage workers
- Recognize urgency when someone says "turant chahiye" or "immediate"
- Help bridge language gaps between employers and workers
- Be encouraging: "Zaroor milega kaam" (You'll definitely find work)

HANDLING FOLLOW-UP QUESTIONS:
- When you show job results, REMEMBER the job IDs and details
- If user says "yes", "tell me more", "first one", "number 1", "1", "2", "option 1", etc:
  * Use the get_job_details tool with the job ID they're referring to
  * Show full details: description, phone number, ALL info
- If user mentions a job by title (e.g., "dieali cleaning"):
  * Use get_job_details with the job title
  * Provide complete information including contact details
- Always be context-aware of what you JUST told the user
- DON'T ask for job IDs - you already know them from your previous search results!
- Number the jobs when presenting search results (1, 2, 3, etc.)

EXAMPLE FOLLOW-UP FLOW:
You: "I found these jobs: 1. Cook in Mathura ₹500/day, 2. Maid in Mathura ₹400/day"
User: "tell me more about 1" OR "first one" OR "yes" OR "cook"
You: [Use get_job_details with the job ID] "Here are the full details: [description, phone, urgency, etc.]"

PRACTICAL EXAMPLES:
User: "Maid chahiye ghar ke liye"
You: "Ji bilkul! Aapko kya kaam karwana hai? Full day ya part time? Aur aap kahan rehte hain?"

User: "Mujhe delivery ka kaam chahiye"
You: "Achha! Aapke paas bike hai? Aur kahan kaam dhundh rahe ho? Main aapko nearby jobs batata hoon."

Be friendly, efficient, and supportive. Your goal is to connect workers with employers quickly and fairly.`;

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
      },
      {
        type: "function",
        function: {
          name: "get_job_details",
          description: "Get full details of a specific job by ID or title. Use when user asks for more info about a specific job, says 'yes', 'tell me more', '1', '2', 'first one', etc., or mentions a job by name.",
          parameters: {
            type: "object",
            properties: {
              job_id: { 
                type: "string", 
                description: "The job ID to look up (use this if you know the ID from previous search)" 
              },
              job_title: { 
                type: "string", 
                description: "Job title to search for if ID not available" 
              }
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
                        jobs: jobs.map((j, index) => ({
                          number: index + 1,
                          id: j.id,
                          title: j.title,
                          location: j.location,
                          daily_salary: j.daily_salary,
                          job_type: j.job_type,
                          category: j.category,
                          created_at: j.created_at
                        })),
                        instruction: "Present these jobs with numbers (1, 2, 3...). When user refers to a number, 'yes', 'tell me more', or job name, use get_job_details tool with the job ID."
                      })}\n\n`));
                    }
                  } else if (toolCall.function?.name === 'get_job_details') {
                    const args = JSON.parse(toolCall.function.arguments);
                    let query = supabase.from('jobs').select('*').eq('status', 'active');
                    
                    if (args.job_id) {
                      query = query.eq('id', args.job_id);
                    } else if (args.job_title) {
                      query = query.ilike('title', `%${args.job_title}%`);
                    }
                    
                    const { data: job, error } = await query.maybeSingle();
                    
                    if (!error && job) {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        tool_result: "job_details",
                        job: {
                          id: job.id,
                          title: job.title,
                          location: job.location,
                          daily_salary: job.daily_salary,
                          job_type: job.job_type,
                          description: job.description,
                          phone: job.phone,
                          urgency: job.urgency,
                          category: job.category,
                          created_at: job.created_at
                        },
                        instruction: "Present ALL details including description and phone number. User wants complete information."
                      })}\n\n`));
                    } else {
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        tool_result: "job_not_found",
                        message: "Sorry, I couldn't find that specific job. It may have been filled or removed."
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
