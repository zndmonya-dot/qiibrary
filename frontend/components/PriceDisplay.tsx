'use client';

import { formatPrice } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  salePrice?: number | null;
  discountRate?: number | null;
  size?: 'sm' | 'md' | 'lg';
}

export default function PriceDisplay({ price, salePrice, discountRate, size = 'md' }: PriceDisplayProps) {

  const priceClasses = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const strikeClasses = {
    sm: 'text-xs',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const badgeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2 py-0.5',
    lg: 'text-base px-3 py-1',
  };

  if (salePrice && discountRate) {
    return (
      <div className="flex items-center gap-3">
        <span className={`text-youtube-red font-bold ${priceClasses[size]}`}>
          {formatPrice(salePrice)}
        </span>
        <span className={`line-through text-secondary ${strikeClasses[size]}`}>
          {formatPrice(price)}
        </span>
        <span className={`bg-youtube-red text-white rounded font-semibold ${badgeClasses[size]}`}>
          -{discountRate}%
        </span>
      </div>
    );
  }

  return (
    <span className={`text-white font-bold ${priceClasses[size]}`}>
      {formatPrice(price)}
    </span>
  );
}

