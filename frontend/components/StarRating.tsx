interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  amazonUrl: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, reviewCount, amazonUrl, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textSizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-xl',
  };

  return (
    <a 
      href={`${amazonUrl}#customerReviews`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
    >
      <span className={`flex items-center ${sizeClasses[size]}`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <i 
            key={star} 
            className={`${
              star <= Math.floor(rating)
                ? 'ri-star-fill text-yellow-400'
                : star <= rating
                ? 'ri-star-half-fill text-yellow-400'
                : 'ri-star-line text-youtube-dark-text-secondary'
            }`}
          ></i>
        ))}
      </span>
      <span className={`text-white font-semibold ${textSizeClasses[size]}`}>{rating}</span>
      {reviewCount && (
        <span className="text-xs text-secondary">({reviewCount.toLocaleString()})</span>
      )}
    </a>
  );
}

