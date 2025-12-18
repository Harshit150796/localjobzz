import React from 'react';

interface ChatBubbleProps {
  content: string;
  timestamp: string;
  isMe: boolean;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({
  content,
  timestamp,
  isMe,
  isLastInGroup = true,
}) => {
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}>
      <div className="flex flex-col max-w-[75%] md:max-w-[65%]">
        {/* Message Bubble */}
        <div
          className={`
            relative px-4 py-2.5 shadow-sm
            ${isMe 
              ? `bg-gradient-to-br from-orange-500 to-orange-600 text-white
                 rounded-2xl rounded-br-md` 
              : `bg-card border border-border text-foreground
                 rounded-2xl rounded-bl-md`
            }
          `}
        >
          <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
            {content}
          </p>
        </div>
        
        {/* Timestamp - Outside bubble */}
        {isLastInGroup && (
          <span className={`
            text-[10px] text-muted-foreground mt-1 px-1
            ${isMe ? 'text-right' : 'text-left'}
          `}>
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
