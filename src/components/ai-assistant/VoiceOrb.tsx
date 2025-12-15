import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoiceOrbProps {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  onClick: () => void;
}

export const VoiceOrb = ({ isConnected, isListening, isSpeaking, onClick }: VoiceOrbProps) => {
  return (
    <div className="relative flex items-center justify-center">
      {/* Outer ripple rings - smaller on mobile */}
      {isConnected && (
        <>
          <div className="absolute w-24 h-24 md:w-52 md:h-52 rounded-full bg-ai-primary/20 animate-pulse-ring" 
               style={{ animationDelay: '0s' }} />
          <div className="absolute w-24 h-24 md:w-52 md:h-52 rounded-full bg-ai-secondary/20 animate-pulse-ring" 
               style={{ animationDelay: '0.5s' }} />
          <div className="absolute w-24 h-24 md:w-52 md:h-52 rounded-full bg-ai-accent/20 animate-pulse-ring" 
               style={{ animationDelay: '1s' }} />
        </>
      )}

      {/* Main orb button - smaller on mobile (80px vs 208px) */}
      <button
        onClick={onClick}
        className={cn(
          "relative w-20 h-20 md:w-52 md:h-52 rounded-full transition-all duration-300",
          "flex items-center justify-center group",
          "focus:outline-none focus:ring-4 focus:ring-ai-glow",
          !isConnected && "bg-gradient-to-br from-ai-primary via-ai-secondary to-ai-accent bg-[length:200%_200%] animate-gradient-shift hover:scale-105 active:scale-95",
          isConnected && !isSpeaking && "bg-gradient-to-br from-destructive to-destructive/80 hover:scale-105 active:scale-95",
          isSpeaking && "bg-gradient-to-br from-ai-primary via-ai-secondary to-ai-accent bg-[length:200%_200%] animate-gradient-shift scale-105 md:scale-110"
        )}
        style={{
          boxShadow: isConnected
            ? '0 0 30px hsl(var(--ai-glow)), 0 10px 20px -10px hsl(var(--ai-primary) / 0.4)'
            : '0 0 40px hsl(var(--ai-glow)), 0 15px 30px -15px hsl(var(--ai-primary) / 0.5)'
        }}
      >
        {/* Icon - smaller on mobile */}
        <div className="relative z-10">
          {!isConnected ? (
            <Mic className="w-8 h-8 md:w-20 md:h-20 text-white drop-shadow-lg" />
          ) : (
            <MicOff className="w-8 h-8 md:w-20 md:h-20 text-white drop-shadow-lg" />
          )}
        </div>

        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  );
};
