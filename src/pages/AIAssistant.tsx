import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot } from 'lucide-react';
import { toast } from 'sonner';
import { VoiceInterface } from '@/components/ai-assistant/VoiceInterface';
import { ModeSwitcher } from '@/components/ai-assistant/ModeSwitcher';
import { MessageBubble } from '@/components/ai-assistant/MessageBubble';
import { TranscriptOverlay } from '@/components/ai-assistant/TranscriptOverlay';
import { StatusIndicator } from '@/components/ai-assistant/StatusIndicator';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [mode, setMode] = useState<'text' | 'voice'>('voice');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your voice assistant. You can tell me to post a job or help you find work. Just start speaking!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('https://fztiznsyknofxoplyirz.supabase.co/functions/v1/ai-job-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dGl6bnN5a25vZnhvcGx5aXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MDM3OTUsImV4cCI6MjA3NDE3OTc5NX0.Vz_qhPD2YkH1vnirQka1SkFPYq0VkzUTgoj9KC7fZcY',
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          toast.error('AI is busy, please try again in a moment');
        } else if (response.status === 402) {
          toast.error('AI service requires credits. Please contact support.');
        } else {
          toast.error('Failed to connect to AI assistant');
        }
        setIsLoading(false);
        return;
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

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

            if (parsed.error) {
              toast.error(parsed.error);
              continue;
            }

            if (parsed.tool_result === 'job_created') {
              assistantMessage += '\n\n✅ Great! Your job has been posted successfully. You can view it in your profile or browse all jobs.';
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = assistantMessage;
                return newMsgs;
              });
              toast.success('Job posted successfully!');
            } else if (parsed.tool_result === 'jobs_found' && parsed.jobs) {
              const jobsList = parsed.jobs.map((job: any, idx: number) => 
                `\n${idx + 1}. **${job.title}** - ${job.location}\n   ₹${job.daily_salary}/day • ${job.job_type}`
              ).join('\n');
              assistantMessage += `\n\nI found these jobs for you:${jobsList}\n\nWould you like to see more details?`;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = assistantMessage;
                return newMsgs;
              });
            } else if (parsed.choices?.[0]?.delta?.content) {
              const content = parsed.choices[0].delta.content;
              assistantMessage += content;
              setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[newMsgs.length - 1].content = assistantMessage;
                return newMsgs;
              });
            }
          } catch (e) {
            console.error('Parse error:', e);
          }
        }
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Stream error:', error);
      toast.error('Failed to connect to AI');
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    streamChat(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-ai-primary/5 to-ai-secondary/5 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(262,83%,58%,0.1),transparent_50%)] -z-10 animate-pulse" 
           style={{ animationDuration: '4s' }} />

      {/* Floating header */}
      <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl bg-background/60 border-b border-border/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-primary to-ai-secondary flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">AI Assistant</h1>
              <p className="text-xs text-muted-foreground">Talk to me about jobs - I'm here to help!</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            Back
          </Button>
        </div>
      </header>

      {/* Mode switcher */}
      <ModeSwitcher mode={mode} onModeChange={setMode} />

      {/* Status indicator */}
      <StatusIndicator status={isLoading ? 'thinking' : 'idle'} />

      {/* Main content */}
      <main className="container mx-auto px-4 pt-32 pb-8 min-h-screen flex flex-col items-center justify-center">
        {mode === 'voice' ? (
          <div className="flex-1 flex items-center justify-center w-full">
            <div className="flex flex-col items-center gap-8">
              <VoiceInterface
                onTranscript={(text) => {
                  setMessages(prev => [...prev, { 
                    role: text.startsWith('User:') ? 'user' : 'assistant', 
                    content: text.replace(/^(User:|AI:)\s*/, '')
                  }]);
                }}
              />
              <p className="text-center text-sm text-muted-foreground max-w-md">
                Tap to start talking! Say "I want to post a job" or "Find me work in Bangalore"
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-3xl flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto pb-32 space-y-4">
              {messages.map((message, idx) => (
                <MessageBubble
                  key={idx}
                  role={message.role}
                  content={message.content}
                  isStreaming={idx === messages.length - 1 && isLoading}
                />
              ))}
              {isLoading && messages[messages.length - 1]?.content === '' && (
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-ai-primary to-ai-secondary flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-background/60 backdrop-blur-sm border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                    <Loader2 className="w-5 h-5 animate-spin text-ai-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4 z-30">
              <div className="backdrop-blur-xl bg-background/80 border border-border/50 rounded-2xl shadow-2xl p-3">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={isLoading}
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="bg-gradient-to-br from-ai-primary to-ai-secondary hover:opacity-90 shadow-lg"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Transcript overlay for voice mode */}
      {mode === 'voice' && (
        <TranscriptOverlay messages={messages.slice(1)} isVisible={messages.length > 1} />
      )}
    </div>
  );
};

export default AIAssistant;
