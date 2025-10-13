import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Extract token from URL query parameters
  const url = new URL(req.url);
  const token = url.searchParams.get('token');
  
  if (!token) {
    console.error('No authentication token provided');
    return new Response('Unauthorized: No token provided', { status: 401 });
  }

  // Initialize Supabase client and verify token
  const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

  // Verify the JWT token and get user
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  
  if (authError || !user) {
    console.error('Authentication failed:', authError);
    return new Response('Unauthorized: Invalid token', { status: 401 });
  }

  console.log('Authenticated user:', user.id, user.email);

  const { headers } = req;
  const upgradeHeader = headers.get("upgrade") || "";

  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket connection", { status: 400 });
  }

  const { socket, response } = Deno.upgradeWebSocket(req);
  
  let openAISocket: WebSocket | null = null;
  let sessionId: string | null = null;

  socket.onopen = () => {
    console.log("Client WebSocket connected");
    
    // Connect to OpenAI Realtime API using WebSocket subprotocol authentication
    const openAIUrl = 'wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17';
    
    try {
      openAISocket = new WebSocket(openAIUrl, [
        'realtime',
        `openai-insecure-api-key.${OPENAI_API_KEY}`,
        'openai-beta.realtime-v1',
      ]);
    } catch (error) {
      console.error("Failed to create OpenAI WebSocket:", error);
      socket.send(JSON.stringify({ type: 'error', message: 'Failed to connect to AI assistant' }));
      socket.close();
      return;
    }

    openAISocket.onopen = () => {
      console.log("Connected to OpenAI Realtime API");
    };

    openAISocket.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("OpenAI event:", data.type);

        // Send session.update after session.created
        if (data.type === 'session.created') {
          sessionId = data.session.id;
          console.log("Session created:", sessionId);
          
          const sessionUpdate = {
            type: 'session.update',
            session: {
              modalities: ['text', 'audio'],
              instructions: `You are a helpful AI voice assistant for LocalJobzz, a local job marketplace in India. You're talking to ${user.email}.
            
Your role is to have natural, conversational interactions to help users:
1. POST JOBS - Collect all details conversationally, then confirm before posting
2. FIND WORK - Help users search for jobs based on their needs

POSTING A JOB - Collect these details naturally:
- Job title (what role? e.g., "Cook", "Driver", "Security Guard")
- Job type (full-time, part-time, or contract?)
- Daily salary (how much per day? Accept: "500", "500-600", "₹500")
- Location (which city/area?)
- Description (what will they do?)
- Phone number (contact number)
- Urgency (is it urgent or normal?)

Common job categories in India: Cook, Driver, Security Guard, Housekeeping, Delivery, Construction Worker, Electrician, Plumber, Carpenter, Painter

IMPORTANT: Before posting, ALWAYS summarize all details and ask "Should I post this job?" Wait for confirmation.

SEARCHING JOBS - Ask for:
- What type of work? (job type)
- Where? (location)
- Expected salary range?
Then describe the results conversationally.

Be warm, friendly, and speak naturally like a helpful friend. Handle interruptions gracefully. If the user changes their mind, adapt smoothly.`,
              voice: 'alloy',
              input_audio_format: 'pcm16',
              output_audio_format: 'pcm16',
              input_audio_transcription: {
                model: 'whisper-1'
              },
              turn_detection: {
                type: 'server_vad',
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 1000
              },
              tools: [
                {
                  type: 'function',
                  name: 'create_job_post',
                  description: 'Create a job posting with all the collected details. Tell the user you are posting their job.',
                  parameters: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      job_type: { type: 'string' },
                      location: { type: 'string' },
                      daily_salary: { type: 'number' },
                      description: { type: 'string' },
                      phone: { type: 'string' },
                      urgency: { type: 'string', enum: ['normal', 'urgent', 'immediate'] }
                    },
                    required: ['title', 'job_type', 'location', 'daily_salary', 'description', 'phone']
                  }
                },
                {
                  type: 'function',
                  name: 'search_jobs',
                  description: 'Search for jobs matching user preferences. Tell the user you are searching for jobs.',
                  parameters: {
                    type: 'object',
                    properties: {
                      job_type: { type: 'string' },
                      location: { type: 'string' },
                      min_salary: { type: 'number' },
                      max_salary: { type: 'number' }
                    }
                  }
                }
              ],
              tool_choice: 'auto',
              temperature: 0.8,
            }
          };
          
          openAISocket?.send(JSON.stringify(sessionUpdate));
          console.log("Sent session.update");
        }

        // Handle function calls
        if (data.type === 'response.function_call_arguments.done') {
          console.log("Function call:", data.name, data.arguments);
          
          const args = JSON.parse(data.arguments);
          let result = { error: 'Unknown function' };

          if (data.name === 'create_job_post') {
            const { data: jobData, error } = await supabase
              .from('jobs')
              .insert({
                user_id: user.id, // Use authenticated user's ID
                title: args.title,
                job_type: args.job_type,
                location: args.location,
                daily_salary: args.daily_salary,
                description: args.description,
                phone: args.phone,
                urgency: args.urgency || 'normal',
                status: 'active'
              })
              .select()
              .single();

            if (error) {
              console.error('Error creating job:', error);
              result = { 
                error: 'Failed to create job. Please try again.',
                details: error.message 
              };
            } else {
              console.log('Job created successfully:', jobData);
              result = { 
                success: true, 
                job_id: jobData.id,
                message: `Job posted successfully! Job ID: ${jobData.id}. Users can now see it on LocalJobzz.`
              };
            }
          } else if (data.name === 'search_jobs') {
            let query = supabase
              .from('jobs')
              .select('*')
              .eq('status', 'active')
              .order('created_at', { ascending: false });

            if (args.job_type) {
              query = query.ilike('job_type', `%${args.job_type}%`);
            }
            if (args.location) {
              query = query.ilike('location', `%${args.location}%`);
            }
            if (args.min_salary) {
              query = query.gte('daily_salary', args.min_salary);
            }
            if (args.max_salary) {
              query = query.lte('daily_salary', args.max_salary);
            }

            const { data: jobs, error } = await query.limit(5);
            
            if (error) {
              console.error('Error searching jobs:', error);
              result = { 
                error: 'Failed to search jobs. Please try again.',
                details: error.message 
              };
            } else {
              console.log('Jobs found:', jobs?.length || 0);
              if (jobs && jobs.length > 0) {
                result = { 
                  success: true, 
                  jobs: jobs,
                  message: `Found ${jobs.length} job(s). Let me tell you about them.`
                };
              } else {
                result = { 
                  success: true, 
                  jobs: [],
                  message: 'No jobs found matching your criteria. Try a different location or job type.'
                };
              }
            }
          }

          // Send function result back to OpenAI
          openAISocket?.send(JSON.stringify({
            type: 'conversation.item.create',
            item: {
              type: 'function_call_output',
              call_id: data.call_id,
              output: JSON.stringify(result)
            }
          }));

          // Trigger response generation
          openAISocket?.send(JSON.stringify({ type: 'response.create' }));
        }

        // Forward all events to client
        socket.send(event.data);
      } catch (error) {
        console.error("Error processing OpenAI message:", error);
      }
    };

    openAISocket.onerror = (error) => {
      console.error("OpenAI WebSocket error:", error);
      socket.send(JSON.stringify({ type: 'error', message: 'OpenAI connection error' }));
    };

    openAISocket.onclose = () => {
      console.log("OpenAI WebSocket closed");
      socket.close();
    };
  };

  socket.onmessage = (event) => {
    // Forward client messages to OpenAI
    if (openAISocket?.readyState === WebSocket.OPEN) {
      openAISocket.send(event.data);
    }
  };

  socket.onclose = () => {
    console.log("Client WebSocket closed");
    openAISocket?.close();
  };

  socket.onerror = (error) => {
    console.error("Client WebSocket error:", error);
    openAISocket?.close();
  };

  return response;
});
