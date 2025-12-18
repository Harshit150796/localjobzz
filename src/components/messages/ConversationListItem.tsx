import React from 'react';
import { Link } from 'react-router-dom';
import RatingBadge from '../RatingBadge';

interface ConversationListItemProps {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    rating: number | null;
    reviewCount: number;
  };
  jobTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  isSelected: boolean;
  isPending?: boolean;
  onClick: () => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  otherUser,
  jobTitle,
  lastMessage,
  lastMessageTime,
  unread,
  isSelected,
  isPending,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 cursor-pointer transition-all duration-200 group
        ${isSelected 
          ? 'bg-muted border-l-4 border-l-slate-700' 
          : 'hover:bg-muted/50 border-l-4 border-l-transparent'
        }
        ${isPending ? 'bg-muted/70' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className={`
          relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
          bg-gradient-to-br from-orange-500 to-red-500
          shadow-md group-hover:shadow-lg transition-shadow duration-200
          ${isSelected ? 'ring-2 ring-slate-600 ring-offset-2' : ''}
        `}>
          <span className="text-white font-semibold text-sm">
            {otherUser.avatar}
          </span>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <Link 
              to={`/user/${otherUser.id}`}
              className="text-sm font-semibold text-foreground truncate hover:text-orange-600 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {otherUser.name}
            </Link>
            <span className={`text-xs flex-shrink-0 ml-2 ${isPending ? 'text-orange-600 font-medium' : 'text-muted-foreground'}`}>
              {isPending ? 'New' : lastMessageTime}
            </span>
          </div>
          
          {otherUser.rating && (
            <div className="mb-1">
              <RatingBadge 
                rating={otherUser.rating} 
                reviewCount={otherUser.reviewCount}
                size="sm"
              />
            </div>
          )}
          
          <p className="text-xs text-orange-600 font-medium mb-1 truncate">
            {jobTitle}
          </p>
          
          <p className={`text-sm truncate ${isPending ? 'text-muted-foreground italic' : 'text-muted-foreground'}`}>
            {isPending ? 'Start typing to send a message...' : lastMessage}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
