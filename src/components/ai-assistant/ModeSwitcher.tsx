import { Mic, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModeSwitcherProps {
  mode: 'text' | 'voice';
  onModeChange: (mode: 'text' | 'voice') => void;
}

export const ModeSwitcher = ({ mode, onModeChange }: ModeSwitcherProps) => {
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative flex gap-1 p-1 rounded-full bg-background/80 backdrop-blur-xl border border-border shadow-lg">
        {/* Sliding background indicator */}
        <div 
          className={cn(
            "absolute top-1 left-1 h-[calc(100%-8px)] rounded-full transition-all duration-300 ease-out",
            "bg-gradient-to-br from-ai-primary to-ai-secondary shadow-lg",
            mode === 'text' ? 'w-[calc(50%-4px)]' : 'w-[calc(50%-4px)] translate-x-[calc(100%+8px)]'
          )}
        />

        {/* Text mode button */}
        <button
          onClick={() => onModeChange('text')}
          className={cn(
            "relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors duration-200",
            mode === 'text' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="font-medium text-sm">Text</span>
        </button>

        {/* Voice mode button */}
        <button
          onClick={() => onModeChange('voice')}
          className={cn(
            "relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-colors duration-200",
            mode === 'voice' ? 'text-white' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Mic className="w-4 h-4" />
          <span className="font-medium text-sm">Voice</span>
        </button>
      </div>
    </div>
  );
};
