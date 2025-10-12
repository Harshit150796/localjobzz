import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export const MessageBubble = ({ role, content, isStreaming }: MessageBubbleProps) => {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg',
          isUser
            ? 'bg-primary'
            : 'bg-gradient-to-br from-ai-primary via-ai-secondary to-ai-accent'
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-white" />
        )}
      </div>

      {/* Message content */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3 max-w-[80%] shadow-md',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-sm'
            : 'bg-background/60 backdrop-blur-sm border border-border/50 rounded-tl-sm'
        )}
      >
        <p className="text-sm whitespace-pre-wrap leading-relaxed">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-current animate-pulse" />
          )}
        </p>
      </div>
    </div>
  );
};
