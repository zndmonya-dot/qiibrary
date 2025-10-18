'use client';

import { memo } from 'react';
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

function BookCard({ rank, book, stats }: BookCardProps) {
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
    <div className="card-primary flex gap-5 border border-qiita-border hover:border-qiita-green/30 dark:hover:border-dark-green/50">
      {/* ランク表示 */}
      <div className="flex-shrink-0 w-14 flex items-center justify-center">
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
                    target.parentElement.innerHTML = '<div class="w-[160px] h-[240px] bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border"><i class="ri-image-2-line text-6xl text-qiita-text-light dark:text-dark-text-light"></i><span class="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像読込失敗</span></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-[160px] h-[240px] bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border">
              <i className="ri-book-2-line text-6xl text-qiita-text-light dark:text-dark-text-light"></i>
              <span className="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像なし</span>
            </div>
          )}
        </Link>
      </div>
      
          {/* 書籍情報（左側） */}
          <div className="flex-1 min-w-0 max-w-md">
            <Link 
              href={`/books/${book.isbn}`} 
              prefetch={true} 
              className="inline-block text-qiita-text-dark dark:text-white"
              onClick={() => analytics.clickBook(book.isbn || '', book.title, rank)}
            >
              <h3 className="text-lg font-bold mb-2 line-clamp-2">
                {book.title || `ISBN: ${book.isbn} の書籍`}
              </h3>
            </Link>
            
            {!book.title && (
              <div className="mb-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-700 dark:text-yellow-300 inline-flex items-center gap-1">
                <i className="ri-information-line"></i>
                <span>書籍情報取得中</span>
              </div>
            )}
        
        <div className="space-y-1.5 text-sm text-qiita-text-dark dark:text-dark-text mb-3 font-medium">
          <p className="flex items-center gap-1.5">
            <i className="ri-user-line text-qiita-green dark:text-dark-green"></i>
            <span>{book.author || '著者情報なし'}</span>
          </p>
          <p className="flex items-center gap-1.5">
            <i className="ri-building-line text-qiita-green dark:text-dark-green"></i>
            <span>{book.publisher || '出版社情報なし'}</span>
          </p>
          {book.publication_date && (
            <p className="flex items-center gap-1.5">
              <i className="ri-calendar-line text-qiita-green dark:text-dark-green"></i>
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
        
        {/* 統計情報 - フラットデザイン */}
        <div className="flex items-center gap-3">
          {stats.total_views > 0 ? (
            // YouTube動画がある場合: 再生数と動画数
            <>
              <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-200 dark:border-blue-700">
                <i className="ri-eye-line text-blue-600 dark:text-blue-400 text-lg"></i>
                <span className="text-base font-bold text-blue-900 dark:text-blue-100">{formatNumber(stats.total_views)}</span>
                <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">回再生</span>
              </div>
              <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-lg border border-red-200 dark:border-red-700">
                <i className="ri-youtube-line text-youtube-red text-lg"></i>
                <span className="text-base font-bold text-red-900 dark:text-red-100">{stats.mention_count}</span>
                <span className="text-sm text-red-700 dark:text-red-300 font-medium">動画</span>
              </div>
            </>
          ) : (
            // Qiita記事の場合: 言及数
            <Link 
              href={`/books/${book.isbn}#qiita-articles`}
              prefetch={true}
              className="flex items-center gap-2 bg-qiita-green/10 dark:bg-qiita-green/20 px-4 py-2 rounded-lg border border-qiita-green/30 dark:border-qiita-green/50 hover:bg-qiita-green/20 dark:hover:bg-qiita-green/30 transition-colors duration-150 cursor-pointer"
            >
              <i className="ri-article-line text-qiita-green dark:text-dark-green text-lg"></i>
              <span className="text-base font-bold text-qiita-text-dark dark:text-white">{formatNumber(stats.mention_count)}</span>
              <span className="text-sm text-qiita-green dark:text-dark-green font-medium">件の記事で言及</span>
            </Link>
          )}
        </div>
      </div>
      
      {/* 書籍概要とアクションボタン（右側） */}
      {book.description && (
        <div className="flex-1 min-w-0 pl-4 border-l-2 border-qiita-border dark:border-dark-border flex flex-col justify-between">
          {/* 概要 - クリック可能 */}
          <Link 
            href={`/books/${book.isbn}`}
            prefetch={true}
            className="flex-1 flex flex-col cursor-pointer hover:opacity-80 transition-opacity duration-150"
            onClick={() => analytics.clickBook(book.isbn || '', book.title, rank)}
          >
            <h4 className="text-sm font-bold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-1.5">
              <i className="ri-book-open-line text-qiita-green"></i>
              書籍説明
            </h4>
            <p className="text-sm text-qiita-text-dark dark:text-dark-text line-clamp-5 leading-relaxed font-medium">
              {book.description}
            </p>
          </Link>
          
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

export default memo(BookCard);

