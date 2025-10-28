import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readOnly?: boolean;
}

const StarIcon = ({ filled, onMouseEnter, onClick, isReadOnly }: { filled: boolean; onMouseEnter?: () => void; onClick?: () => void; isReadOnly: boolean; }) => (
    <svg 
        className={`w-6 h-6 ${isReadOnly ? '' : 'cursor-pointer'} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
        fill="currentColor" 
        viewBox="0 0 20 20" 
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={onMouseEnter}
        onClick={onClick}
    >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
    </svg>
);


const StarRating: React.FC<StarRatingProps> = ({ rating, onRatingChange, readOnly = false }) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <div 
          key={star}
          onMouseEnter={readOnly ? undefined : () => setHoverRating(star)}
          onMouseLeave={readOnly ? undefined : () => setHoverRating(0)}
        >
          <StarIcon
            isReadOnly={readOnly}
            filled={readOnly ? star <= rating : star <= (hoverRating || rating)}
            onClick={readOnly ? undefined : () => onRatingChange?.(star)}
          />
        </div>
      ))}
    </div>
  );
};

export default StarRating;
