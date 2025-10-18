'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Book, BookStats } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';
import StarRating from './StarRating';
import PriceDisplay from './PriceDisplay';
import { analytics } from '@/lib/analytics';

interface BookCardProps {
  rank: number;
  book: Book;
  stats: BookStats;
}

export default function BookCard({ rank, book, stats }: BookCardProps) {
  // ランクに応じた色を決定
  const getRankStyle = () => {
    if (rank === 1) return 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]'; // 金
    if (rank === 2) return 'text-gray-400 drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]'; // 銀
    if (rank === 3) return 'text-orange-500 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'; // 銅
    return 'text-qiita-green';
  };

  const getRankIcon = () => {
    if (rank <= 3) return 'ri-medal-line';
    return null;
  };

  return (
    <div className="card-primary flex gap-4 border border-qiita-border hover:border-qiita-green/30">
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
        <Link 
          href={`/books/${book.isbn}`} 
          prefetch={true} 
          className="block transition-opacity duration-200 hover:opacity-90"
          onClick={() => analytics.clickBook(book.isbn || '', book.title, rank)}
        >
              {(book.thumbnail_url || book.image_url) ? (
                <div className="relative w-[160px] h-[240px]">
                  <Image
                    src={book.thumbnail_url || book.image_url || ''}
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
                    target.parentElement.innerHTML = '<div class="w-[160px] h-[240px] bg-qiita-surface rounded flex items-center justify-center"><i class="ri-book-line text-5xl text-qiita-text-light"></i></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-[160px] h-[240px] bg-qiita-surface dark:bg-dark-surface-light rounded flex items-center justify-center">
              <i className="ri-book-line text-5xl text-qiita-text-light dark:text-dark-text-light"></i>
            </div>
          )}
        </Link>
      </div>
      
          {/* 書籍情報（左側） */}
          <div className="flex-1 min-w-0 max-w-md">
            <Link 
              href={`/books/${book.isbn}`} 
              prefetch={true} 
              className="hover:text-qiita-green dark:hover:text-dark-green transition-colors duration-200 inline-block text-qiita-text-dark dark:text-white"
              onClick={() => analytics.clickBook(book.isbn || '', book.title, rank)}
            >
              <h3 className="text-lg font-bold mb-2 line-clamp-2">
                {book.title}
              </h3>
            </Link>
        
        <div className="space-y-1 text-sm text-qiita-text-dark dark:text-dark-text mb-3 font-medium">
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
              <span>{formatPublicationDate(book.publication_date)}</span>
            </p>
          )}
          
          {/* 星評価（クリック可能） */}
          {book.rating && (
            <StarRating
              rating={book.rating}
              reviewCount={book.review_count || undefined}
              bookUrl={book.affiliate_url}
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
          {stats.total_views > 0 ? (
            // YouTube動画がある場合: 再生数と動画数
            <>
              <div className="flex items-center gap-1.5 bg-white dark:bg-dark-surface-light px-3 py-1.5 rounded-full border border-qiita-border dark:border-dark-border shadow-sm">
                <i className="ri-eye-line text-blue-500"></i>
                <span className="text-sm font-semibold text-qiita-text-dark dark:text-white">{formatNumber(stats.total_views)}</span>
                <span className="text-xs text-qiita-text dark:text-dark-text font-medium">回</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-dark-surface-light px-3 py-1.5 rounded-full border border-qiita-border dark:border-dark-border shadow-sm">
                <i className="ri-youtube-line text-youtube-red"></i>
                <span className="text-sm font-semibold text-qiita-text-dark dark:text-white">{stats.mention_count}</span>
                <span className="text-xs text-qiita-text dark:text-dark-text font-medium">動画</span>
              </div>
            </>
          ) : (
            // Qiita記事の場合: 言及数
            <div className="flex items-center gap-1.5 bg-white dark:bg-dark-surface-light px-3 py-1.5 rounded-full border border-qiita-border dark:border-dark-border shadow-sm">
              <i className="ri-article-line text-qiita-green"></i>
              <span className="text-sm font-semibold text-qiita-text-dark dark:text-white">{formatNumber(stats.mention_count)}</span>
              <span className="text-xs text-qiita-text dark:text-dark-text font-medium">記事</span>
            </div>
          )}
        </div>
      </div>
      
      {/* 書籍概要とアクションボタン（右側） */}
      {book.description && (
        <div className="flex-1 min-w-0 pl-4 border-l-2 border-qiita-border dark:border-dark-border flex flex-col justify-between">
          {/* 概要 */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-bold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-1.5">
              <i className="ri-book-open-line text-qiita-green"></i>
              書籍説明
            </h4>
            <p className="text-sm text-qiita-text-dark dark:text-dark-text line-clamp-5 leading-relaxed font-medium">
              {book.description}
            </p>
          </div>
          
          {/* アクションボタン（右下） */}
          <div className="flex gap-2 mt-4 justify-end">
            {book.amazon_affiliate_url && (
              <a
                href={book.amazon_affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-amazon inline-flex items-center gap-1 text-sm"
                onClick={() => analytics.clickAmazonLink(book.isbn || '', book.title)}
              >
                <i className="ri-amazon-line text-lg"></i>
                Amazonで購入
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

