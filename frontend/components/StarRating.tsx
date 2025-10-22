interface StarRatingProps {
  rating: number;
  reviewCount?: number;
  bookUrl?: string;  // 将来的に楽天ブックスURLなどを受け付ける
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ rating, reviewCount, bookUrl, size = 'md' }: StarRatingProps) {
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

  const content = (
    <span className="flex items-center gap-2">
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
    </span>
  );

  // レビューURLがある場合はリンク、ない場合は通常の表示
  if (bookUrl) {
    return (
      <a 
        href={`${bookUrl}#review`}
        target="_blank"
        rel="noopener noreferrer"
        className="hover-opacity-80 cursor-pointer"
      >
        {content}
      </a>
    );
  }

  return content;
}

