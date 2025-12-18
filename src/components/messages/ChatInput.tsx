import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "Type your message...",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className={`
      flex items-center gap-2 p-1.5 bg-muted/50 rounded-full
      border-2 transition-all duration-200
      ${isFocused ? 'border-orange-400 bg-card shadow-lg shadow-orange-500/10' : 'border-transparent'}
    `}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2.5 bg-transparent text-foreground placeholder:text-muted-foreground
                   focus:outline-none text-sm md:text-base"
      />
      <button
        onClick={onSend}
        disabled={disabled || !value.trim()}
        className={`
          p-3 rounded-full transition-all duration-200
          flex items-center justify-center
          ${value.trim() 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95' 
            : 'bg-muted text-muted-foreground cursor-not-allowed'
          }
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        `}
        aria-label="Send message"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
};

export default ChatInput;
