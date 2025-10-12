import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
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
    
    // Connect to OpenAI Realtime API
    const openAIUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
    openAISocket = new WebSocket(openAIUrl, {
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "OpenAI-Beta": "realtime=v1"
      }
    });

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
              instructions: `You are a helpful AI assistant for localjobzz, a daily job platform in India. 
Your role is to help users in two ways:

1. POSTING JOBS: If user wants to post a job, collect these details conversationally:
   - Job title (what work needs to be done)
   - Job category (Household Work, Delivery, Construction, etc.)
   - Location (city, state in India)
   - Daily salary in ₹
   - Job description
   - Phone number
   - Urgency (normal, urgent, immediate)

2. FINDING JOBS: If user is looking for work, ask about:
   - What type of work they want
   - Preferred location
   - Expected salary range
   Then search the jobs database and recommend matches.

Be conversational, friendly, and efficient. Speak in English but understand Hindi/Hinglish.
Once you have all required information, use the appropriate tool to help the user.`,
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
            const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
            const { data: jobData, error } = await supabase
              .from('jobs')
              .insert({
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

            result = error ? { error: error.message } : { success: true, job_id: jobData.id };
          } else if (data.name === 'search_jobs') {
            const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
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
            result = error ? { error: error.message } : { jobs: jobs || [] };
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
