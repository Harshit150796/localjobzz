import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusIndicatorProps {
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  className?: string;
}

export const StatusIndicator = ({ status, className }: StatusIndicatorProps) => {
  if (status === 'idle') return null;

  return (
    <div className={cn(
      "fixed top-24 left-1/2 -translate-x-1/2 z-50",
      "px-6 py-3 rounded-full backdrop-blur-xl border shadow-2xl",
      "animate-in fade-in slide-in-from-top-4 duration-300",
      status === 'listening' && "bg-destructive/10 border-destructive/20",
      status === 'thinking' && "bg-ai-primary/10 border-ai-primary/20",
      status === 'speaking' && "bg-ai-secondary/10 border-ai-secondary/20",
      className
    )}>
      <div className="flex items-center gap-3">
        {status === 'thinking' && (
          <Loader2 className="w-4 h-4 text-ai-primary animate-spin" />
        )}
        {status === 'listening' && (
          <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
        )}
        {status === 'speaking' && (
          <div className="flex gap-1">
            <div className="w-1 h-3 bg-ai-secondary rounded-full animate-wave" style={{ animationDelay: '0s' }} />
            <div className="w-1 h-3 bg-ai-secondary rounded-full animate-wave" style={{ animationDelay: '0.1s' }} />
            <div className="w-1 h-3 bg-ai-secondary rounded-full animate-wave" style={{ animationDelay: '0.2s' }} />
          </div>
        )}
        <span className={cn(
          "text-sm font-medium",
          status === 'listening' && "text-destructive",
          status === 'thinking' && "text-ai-primary",
          status === 'speaking' && "text-ai-secondary"
        )}>
          {status === 'listening' && 'Listening...'}
          {status === 'thinking' && 'Thinking...'}
          {status === 'speaking' && 'Speaking...'}
        </span>
      </div>
    </div>
  );
};
