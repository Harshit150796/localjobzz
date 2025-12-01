import React from 'react';
import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

const RatingBadge: React.FC<RatingBadgeProps> = ({ 
  rating, 
  reviewCount,
  size = 'sm' 
}) => {
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-900 px-2 py-0.5 rounded-full border border-yellow-200">
      <Star className={`${iconSize} fill-yellow-400 text-yellow-400`} />
      <span className={`${textSize} font-semibold`}>
        {rating.toFixed(1)}
      </span>
      {reviewCount !== undefined && (
        <span className={`${textSize} text-yellow-700`}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingBadge;
