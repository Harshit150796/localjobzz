import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Send, Bot, User, Mic, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { VoiceChat } from '@/components/VoiceChat';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AIAssistant = () => {
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I can help you post a job or find work. What would you like to do today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
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
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-job-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
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

      // Add empty assistant message that we'll update
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
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">AI Job Assistant</h1>
          <p className="text-muted-foreground">Tell me what you need, and I'll help you post or find jobs</p>
          
          <div className="flex gap-2 justify-center mt-4">
            <Button
              variant={mode === 'text' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('text')}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Text Chat
            </Button>
            <Button
              variant={mode === 'voice' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMode('voice')}
              className="gap-2"
            >
              <Mic className="w-4 h-4" />
              Voice Chat
            </Button>
          </div>
        </div>

        {mode === 'voice' ? (
          <div className="bg-card border border-border rounded-lg shadow-lg flex flex-col h-[600px]">
            <div className="flex-1 flex items-center justify-center">
              <VoiceChat onTranscript={(text) => {
                setMessages(prev => [...prev, { 
                  role: text.startsWith('User:') ? 'user' : 'assistant', 
                  content: text.replace(/^(User:|AI:)\s*/, '')
                }]);
              }} />
            </div>
            {messages.length > 1 && (
              <div className="border-t border-border p-4 max-h-40 overflow-y-auto">
                <p className="text-xs text-muted-foreground mb-2">Conversation transcript:</p>
                <div className="space-y-1">
                  {messages.slice(1).map((msg, idx) => (
                    <p key={idx} className="text-xs">
                      <span className="font-medium">{msg.role === 'user' ? 'You' : 'AI'}:</span> {msg.content.slice(0, 100)}
                      {msg.content.length > 100 && '...'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg shadow-lg flex flex-col h-[600px]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-primary' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-5 h-5 text-primary-foreground" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-3 max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
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
        )}

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">Quick actions:</p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button variant="outline" size="sm" onClick={() => navigate('/post-ad')}>
              Post Job Manually
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/')}>
              Browse All Jobs
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
              My Profile
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AIAssistant;
