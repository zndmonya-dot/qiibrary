'use client';

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Book, BookStats, TopArticle } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';
import { analytics } from '@/lib/analytics';

interface BookCardProps {
  rank: number;
  book: Book;
  stats: BookStats;
  topArticles?: TopArticle[];
  onNavigate?: () => void;
}

function BookCard({ rank, book, stats, topArticles, onNavigate }: BookCardProps) {
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
    <div className="card-primary flex flex-col md:flex-row gap-4 md:gap-6 border border-qiita-border relative overflow-hidden">
      {/* NEWバッジ（スマホ：右上、デスクトップ：左上） */}
      {stats.is_new && (
        <div className="absolute top-0 right-0 md:left-0 md:right-auto z-10">
          <div className="relative">
            {/* メインバッジ */}
            <div className="px-3 md:px-4 py-1 md:py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-bl-lg md:rounded-bl-none md:rounded-br-lg shadow-lg animate-pulse">
              <span className="text-xs md:text-sm font-black text-white tracking-wider drop-shadow-md">NEW!</span>
            </div>
            {/* グロー効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-md rounded-bl-lg md:rounded-bl-none md:rounded-br-lg -z-10"></div>
          </div>
        </div>
      )}
      
      {/* ランク表示 */}
      <div className="flex-shrink-0 w-12 md:w-14 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* メダルアイコン：デスクトップのみ表示 */}
          {getRankIcon() && (
            <i className={`hidden md:inline ${getRankIcon()} text-2xl ${getRankStyle()}`}></i>
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
          onClick={() => {
            onNavigate?.();
            analytics.clickBook(book.isbn || '', book.title, rank);
          }}
        >
              {book.thumbnail_url ? (
                <div className="relative w-[120px] h-[180px] md:w-[160px] md:h-[240px]">
                  <Image
                    src={book.thumbnail_url}
                    alt={book.title}
                    width={160}
                    height={240}
                    className="rounded shadow-lg w-full h-full object-cover"
                    loading={rank > 10 ? "lazy" : "eager"}
                    priority={rank <= 5}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  if (target.parentElement) {
                    target.parentElement.innerHTML = '<div class="w-[120px] h-[180px] md:w-[160px] md:h-[240px] bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border"><i class="ri-image-2-line text-4xl md:text-6xl text-qiita-text-light dark:text-dark-text-light"></i><span class="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像読込失敗</span></div>';
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-[120px] h-[180px] md:w-[160px] md:h-[240px] bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border">
              <i className="ri-book-2-line text-5xl md:text-6xl text-qiita-text-light dark:text-dark-text-light"></i>
              <span className="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像なし</span>
            </div>
          )}
        </Link>
      </div>
      
          {/* 書籍情報（左側） */}
          <div className="flex-1 min-w-0 w-full md:max-w-md">
            <Link 
              href={`/books/${book.isbn}`} 
              prefetch={true} 
              className="group inline-block"
              onClick={() => {
                onNavigate?.();
                analytics.clickBook(book.isbn || '', book.title, rank);
              }}
            >
              <h3 className="text-sm md:text-base font-bold mb-2.5 line-clamp-2 leading-snug text-qiita-text-dark dark:text-white group-hover:text-qiita-green dark:group-hover:text-dark-green transition-colors duration-200">
                {book.title || `ISBN: ${book.isbn} の書籍`}
              </h3>
            </Link>
            
            {!book.title && (
              <div className="mb-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-700 dark:text-yellow-300 inline-flex items-center gap-1">
                <i className="ri-information-line"></i>
                <span>書籍情報取得中</span>
              </div>
            )}
        
        <div className="space-y-2 text-sm text-qiita-text dark:text-dark-text mb-4 font-medium">
          <p className="flex items-center gap-2">
            <i className="ri-user-line text-qiita-green dark:text-dark-green text-base"></i>
            <span className="line-clamp-1">{book.author || '著者情報なし'}</span>
          </p>
          <p className="flex items-center gap-2">
            <i className="ri-building-line text-qiita-green dark:text-dark-green text-base"></i>
            <span className="line-clamp-1">{book.publisher || '出版社情報なし'}</span>
          </p>
          {book.publication_date && (
            <p className="flex items-center gap-2">
              <i className="ri-calendar-line text-qiita-green dark:text-dark-green text-base"></i>
              <span>{formatPublicationDate(book.publication_date)}</span>
            </p>
          )}
        </div>
        
        {/* 統計情報 - フラットデザイン */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
          {(stats.total_views ?? 0) > 0 ? (
            // YouTube動画がある場合: 再生数と動画数
            <>
              <div className="flex items-center gap-1.5 md:gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-blue-200 dark:border-blue-700">
                <i className="ri-eye-line text-blue-600 dark:text-blue-400 text-base md:text-lg"></i>
                <span className="text-sm md:text-base font-bold text-blue-900 dark:text-blue-100">{formatNumber(stats.total_views ?? 0)}</span>
                <span className="text-xs md:text-sm text-blue-700 dark:text-blue-300 font-medium">回再生</span>
              </div>
              <div className="flex items-center gap-1.5 md:gap-2 bg-red-50 dark:bg-red-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-red-200 dark:border-red-700">
                <i className="ri-youtube-line text-youtube-red text-base md:text-lg"></i>
                <span className="text-sm md:text-base font-bold text-red-900 dark:text-red-100">{stats.mention_count}</span>
                <span className="text-xs md:text-sm text-red-700 dark:text-red-300 font-medium">動画</span>
              </div>
            </>
          ) : (
            // Qiita記事の場合: 言及数、いいね数
            <>
              <Link 
                href={`/books/${book.isbn}#qiita-articles`}
                prefetch={true}
                className="flex items-center gap-1.5 md:gap-2 bg-qiita-green/10 dark:bg-qiita-green/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-qiita-green/30 dark:border-qiita-green/50 hover:bg-qiita-green/20 dark:hover:bg-qiita-green/30 transition-colors duration-150 cursor-pointer"
                onClick={() => onNavigate?.()}
              >
                <i className="ri-article-line text-qiita-green dark:text-dark-green text-base md:text-lg"></i>
                <span className="text-sm md:text-base font-bold text-qiita-text-dark dark:text-white">{formatNumber(stats.mention_count)}</span>
                <span className="text-xs md:text-sm text-qiita-green dark:text-dark-green font-medium">件の記事で言及</span>
              </Link>
              
              {/* 総いいね数 */}
              {stats.total_likes > 0 && (
                <div className="flex items-center gap-1.5 md:gap-2 bg-pink-50 dark:bg-pink-900/20 px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-pink-200 dark:border-pink-700">
                  <i className="ri-heart-line text-pink-600 dark:text-pink-400 text-base md:text-lg"></i>
                  <span className="text-sm md:text-base font-bold text-pink-900 dark:text-pink-100">{formatNumber(stats.total_likes)}</span>
                  <span className="text-xs md:text-sm text-pink-700 dark:text-pink-300 font-medium">いいね</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* トップ記事とアクションボタン（右側） */}
      {topArticles && topArticles.length > 0 && (
        <div className="flex-1 min-w-0 w-full md:pl-5 md:border-l border-qiita-border/60 dark:border-dark-border/60 flex flex-col justify-between pt-4 md:pt-0">
          {/* トップ記事一覧 */}
          <div className="flex-1 flex flex-col">
            <h4 className="text-sm font-bold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-2">
              <div className="w-6 h-6 bg-qiita-green/20 dark:bg-qiita-green/30 rounded-full flex items-center justify-center">
                <i className="ri-article-line text-qiita-green dark:text-dark-green text-sm"></i>
              </div>
              人気記事トップ{topArticles.length}
            </h4>
            <div className="space-y-2.5">
              {topArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block p-3 rounded-lg bg-qiita-surface/30 dark:bg-dark-surface-light/30 hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 transition-all duration-200 border border-qiita-border/30 dark:border-dark-border/30 hover:border-qiita-green/40 dark:hover:border-qiita-green/40 hover:shadow-sm"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-qiita-green/20 dark:bg-qiita-green/30 text-qiita-green dark:text-dark-green text-xs font-bold group-hover:bg-qiita-green/30 dark:group-hover:bg-qiita-green/40 transition-colors">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-qiita-text-dark dark:text-white line-clamp-2 leading-relaxed group-hover:text-qiita-green dark:group-hover:text-dark-green transition-colors mb-1.5">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-qiita-text dark:text-dark-text font-medium">
                        <span className="flex items-center gap-1">
                          <i className="ri-heart-fill text-pink-500"></i>
                          {formatNumber(article.likes_count)}
                        </span>
                        <span className="flex items-center gap-1 truncate">
                          <i className="ri-user-line text-qiita-green dark:text-dark-green"></i>
                          <span className="truncate">{article.author_name || article.author_id}</span>
                        </span>
                      </div>
                    </div>
                    <i className="ri-external-link-line text-lg text-qiita-text-light dark:text-dark-text-light group-hover:text-qiita-green dark:group-hover:text-dark-green transition-colors flex-shrink-0"></i>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          {/* アクションボタン（右下） */}
          <div className="flex flex-wrap gap-2 mt-5">
            <Link
              href={`/books/${book.isbn}`}
              prefetch={true}
              className="flex-1 min-w-[120px] px-4 py-2.5 bg-qiita-green/10 dark:bg-qiita-green/20 hover:bg-qiita-green/20 dark:hover:bg-qiita-green/30 text-qiita-green dark:text-dark-green border border-qiita-green/30 dark:border-qiita-green/50 rounded-lg font-semibold text-sm transition-all duration-150 inline-flex items-center justify-center gap-2"
              onClick={() => {
                onNavigate?.();
                analytics.clickBook(book.isbn || '', book.title, rank);
              }}
            >
              <i className="ri-book-open-line text-lg"></i>
              書籍詳細を見る
            </Link>
            {book.amazon_affiliate_url && (
              <a
                href={book.amazon_affiliate_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[120px] px-4 py-2.5 bg-[#FF9900] hover:bg-[#ff8800] text-white rounded-lg font-semibold text-sm transition-all duration-150 inline-flex items-center justify-center gap-2 shadow-sm"
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

