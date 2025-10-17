'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Book, BookStats } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';
import { t, getLocale } from '@/lib/locale';
import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import PriceDisplay from './PriceDisplay';

interface BookCardProps {
  rank: number;
  book: Book;
  stats: BookStats;
}

export default function BookCard({ rank, book, stats }: BookCardProps) {
  const [locale, setLocaleState] = useState<'ja' | 'en'>('ja');

  useEffect(() => {
    setLocaleState(getLocale());
    
    // 言語変更イベントをリッスン
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);
  // ランクに応じた色を決定
  const getRankStyle = () => {
    if (rank === 1) return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'; // 金
    if (rank === 2) return 'text-gray-300 drop-shadow-[0_0_8px_rgba(209,213,219,0.5)]'; // 銀
    if (rank === 3) return 'text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'; // 銅
    return 'text-youtube-red';
  };

  const getRankIcon = () => {
    if (rank <= 3) return 'ri-medal-line';
    return null;
  };

  return (
    <div className="card-youtube flex gap-4 border border-transparent hover:border-youtube-dark-text-secondary/20">
      {/* ランク表示 */}
      <div className="flex-shrink-0 w-12 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {getRankIcon() && (
            <i className={`${getRankIcon()} text-2xl ${getRankStyle()}`}></i>
          )}
          <span className={`text-3xl font-bold ${getRankStyle()}`}>
            {rank}
          </span>
        </div>
      </div>
      
      {/* 書籍画像（大きく・中央配置） */}
      <div className="flex-shrink-0 flex items-center justify-center">
        <Link href={`/books/${book.asin}`} prefetch={true} className="block transition-opacity duration-200 hover:opacity-90">
              {book.image_url ? (
                <div className="relative w-[160px] h-[240px]">
                  <Image
                    src={book.image_url}
                    alt={book.title}
                    width={160}
                    height={240}
                    className="rounded shadow-lg"
                    loading={rank > 10 ? "lazy" : "eager"}
                    priority={rank <= 5}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<div class="w-[160px] h-[240px] bg-youtube-dark-hover rounded flex items-center justify-center"><i class="ri-book-line text-5xl text-youtube-dark-text-secondary"></i></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-[160px] h-[240px] bg-youtube-dark-hover rounded flex items-center justify-center">
              <i className="ri-book-line text-5xl text-youtube-dark-text-secondary"></i>
            </div>
          )}
        </Link>
      </div>
      
          {/* 書籍情報（左側） */}
          <div className="flex-1 min-w-0 max-w-md">
            <Link href={`/books/${book.asin}`} prefetch={true} className="hover:text-youtube-red transition-colors duration-200 inline-block">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                {book.title}
              </h3>
            </Link>
        
        <div className="space-y-1 text-sm text-secondary mb-3">
          {book.author && (
            <p className="flex items-center gap-1">
              <i className="ri-user-line"></i>
              <span>{book.author}</span>
            </p>
          )}
          {book.publisher && (
            <p className="flex items-center gap-1">
              <i className="ri-building-line"></i>
              <span>{book.publisher}</span>
            </p>
          )}
          {book.publication_date && (
            <p className="flex items-center gap-1">
              <i className="ri-calendar-line"></i>
              <span>{formatPublicationDate(book.publication_date, locale)}</span>
            </p>
          )}
          
          {/* 星評価（クリック可能） */}
          {book.rating && (
            <StarRating
              rating={book.rating}
              reviewCount={book.review_count || undefined}
              amazonUrl={book.amazon_url}
              size="sm"
            />
          )}
          
          {/* 価格・セール情報 */}
          {book.price && (
            <div className="flex items-center gap-2">
              <i className="ri-price-tag-3-line"></i>
              <PriceDisplay
                price={book.price}
                salePrice={book.sale_price}
                discountRate={book.discount_rate}
                size="sm"
              />
            </div>
          )}
        </div>
        
        {/* 統計情報 */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-youtube-dark-bg/50 px-3 py-1.5 rounded-full border border-youtube-dark-surface/50">
            <i className="ri-eye-line text-blue-400"></i>
            <span className="text-sm font-medium text-white">{formatNumber(stats.total_views)}</span>
            <span className="text-xs text-secondary">{t('views')}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-youtube-dark-bg/50 px-3 py-1.5 rounded-full border border-youtube-dark-surface/50">
            <i className="ri-youtube-line text-youtube-red"></i>
            <span className="text-sm font-medium text-white">{stats.mention_count}</span>
            <span className="text-xs text-secondary">{t('videosCount')}</span>
          </div>
        </div>
      </div>
      
      {/* 書籍概要とアクションボタン（右側） */}
      {book.description && (
        <div className="flex-1 min-w-0 pl-4 border-l-2 border-youtube-dark-surface flex flex-col justify-between">
          {/* 概要 */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-semibold text-youtube-dark-text mb-3 flex items-center gap-1.5">
              <i className="ri-amazon-line text-youtube-red"></i>
              {locale === 'ja' ? 'Amazon商品説明' : 'Amazon Product Description'}
            </h4>
            <p className="text-sm text-secondary line-clamp-5 leading-relaxed">
              {book.description}
            </p>
          </div>
          
          {/* アクションボタン（右下） */}
          <div className="flex gap-2 mt-4 justify-end">
            <Link
              href={`/books/${book.asin}`}
              prefetch={true}
              className="inline-flex items-center gap-1 border-2 border-youtube-red text-youtube-red hover:bg-youtube-red hover:text-white px-4 py-2 rounded text-sm font-medium transition-all duration-200"
            >
              <i className="ri-play-circle-line text-lg"></i>
              {t('watchVideos')}
            </Link>
            <a
              href={book.affiliate_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-youtube inline-flex items-center gap-1 text-sm"
            >
              <i className="ri-shopping-cart-line text-lg"></i>
              {t('buyOnAmazon')}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

