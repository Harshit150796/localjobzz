import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import RatingBadge from '../RatingBadge';

interface ChatHeaderProps {
  name: string;
  avatar: string;
  jobTitle: string;
  userId: string;
  rating: number | null;
  reviewCount: number;
  onBack?: () => void;
  showBackButton?: boolean;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  name,
  avatar,
  jobTitle,
  userId,
  rating,
  reviewCount,
  onBack,
  showBackButton = false,
}) => {
  return (
    <div className="px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        
        {/* Avatar */}
        <Link 
          to={`/user/${userId}`}
          className="relative w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0
                     bg-gradient-to-br from-orange-500 to-red-500 shadow-md
                     hover:shadow-lg transition-shadow duration-200 group"
        >
          <span className="text-white font-semibold text-sm group-hover:scale-110 transition-transform">
            {avatar}
          </span>
        </Link>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link 
              to={`/user/${userId}`}
              className="font-semibold text-foreground truncate hover:text-orange-600 transition-colors"
            >
              {name}
            </Link>
            {rating && (
              <RatingBadge 
                rating={rating} 
                reviewCount={reviewCount}
                size="sm"
              />
            )}
          </div>
          <p className="text-sm text-orange-600 truncate font-medium">
            {jobTitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
