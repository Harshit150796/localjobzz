import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  value?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'yellow' | 'orange';
}

const RatingStars: React.FC<RatingStarsProps> = ({ 
  value = 0, 
  onChange, 
  readonly = false,
  size = 'md',
  color = 'yellow'
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const displayRating = hoverRating || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`transition-all ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
        >
          <Star 
            className={`${sizeClasses[size]} transition-colors ${
              star <= displayRating 
                ? color === 'orange' 
                  ? 'fill-orange-400 text-orange-400' 
                  : 'fill-yellow-400 text-yellow-400'
                : color === 'orange'
                  ? 'fill-none text-orange-400'
                  : 'fill-none text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default RatingStars;
