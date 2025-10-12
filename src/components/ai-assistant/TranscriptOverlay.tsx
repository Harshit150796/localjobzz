import { useEffect, useRef } from 'react';
import { User, Bot } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface TranscriptOverlayProps {
  messages: Message[];
  isVisible: boolean;
}

export const TranscriptOverlay = ({ messages, isVisible }: TranscriptOverlayProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isVisible || messages.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div 
        ref={scrollRef}
        className="max-h-48 overflow-y-auto backdrop-blur-xl bg-background/60 border border-border/50 rounded-2xl shadow-2xl p-4 space-y-2"
      >
        {messages.map((msg, idx) => (
          <div key={idx} className="flex items-start gap-2 text-sm">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
              msg.role === 'user' 
                ? 'bg-primary' 
                : 'bg-gradient-to-br from-ai-primary to-ai-secondary'
            }`}>
              {msg.role === 'user' ? (
                <User className="w-3 h-3 text-primary-foreground" />
              ) : (
                <Bot className="w-3 h-3 text-white" />
              )}
            </div>
            <div className="flex-1 pt-0.5">
              <span className="font-medium text-foreground/80">
                {msg.role === 'user' ? 'You' : 'AI'}:
              </span>{' '}
              <span className="text-foreground/60">{msg.content}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
