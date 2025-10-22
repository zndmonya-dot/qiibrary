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
}

function BookCard({ rank, book, stats, topArticles }: BookCardProps) {
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
    <div className="card-primary flex flex-col items-center md:flex-row md:items-center gap-4 md:gap-6 border border-qiita-border relative overflow-hidden">
      {/* NEWバッジ（スマホ：右上、デスクトップ：左上） */}
      {stats.is_new && (
        <div className="absolute top-0 right-0 md:left-0 md:right-auto z-10">
          <div className="relative">
            {/* メインバッジ */}
            <div className="px-3 md:px-4 py-1.5 md:py-1.5 bg-gradient-to-r from-red-500 to-orange-500 rounded-bl-lg md:rounded-bl-none md:rounded-br-lg shadow-lg animate-pulse">
              <span className="text-sm md:text-sm font-black text-white tracking-wider drop-shadow-md">NEW!</span>
            </div>
            {/* グロー効果 */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-orange-500/30 blur-md rounded-bl-lg md:rounded-bl-none md:rounded-br-lg -z-10"></div>
          </div>
        </div>
      )}
      
      {/* ランク表示 */}
      <div className="flex-shrink-0 w-full md:w-14 flex items-center justify-center">
        <div className="flex flex-col items-center">
          {/* メダルアイコン：デスクトップのみ表示 */}
          {getRankIcon() && (
            <i className={`hidden md:inline ${getRankIcon()} text-2xl ${getRankStyle()}`}></i>
          )}
          <span className={`text-4xl md:text-3xl font-bold ${getRankStyle()}`}>
            {rank}
          </span>
        </div>
      </div>
      
      {/* 書籍画像と詳細ボタン */}
      <div className="flex-shrink-0 flex flex-col gap-2 items-center md:items-start">
        {book.amazon_affiliate_url ? (
          <a
            href={book.amazon_affiliate_url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="block hover-scale"
            onClick={(e) => {
              analytics.clickAmazonLink(book.isbn || '', book.title);
              // スマホではアフィリエイトリンクを保持するため、同じタブで開く
              if (window.innerWidth < 768) {
                e.preventDefault();
                window.location.href = book.amazon_affiliate_url || '';
              }
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
          </a>
        ) : (
          <>
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
          </>
        )}
      </div>
      
      {/* 上部：タイトルと著者情報 */}
      <div className="flex-1 min-w-0 w-full">
        <div className="flex flex-col md:flex-row gap-3 md:gap-6 mb-3 md:mb-4">
          {/* タイトル（左） */}
          <div className="flex-1 min-w-0 text-center md:text-left">
            {book.amazon_affiliate_url ? (
              <a
                href={book.amazon_affiliate_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="group inline-block"
                onClick={(e) => {
                  analytics.clickAmazonLink(book.isbn || '', book.title);
                  // スマホではアフィリエイトリンクを保持するため、同じタブで開く
                  if (window.innerWidth < 768) {
                    e.preventDefault();
                    window.location.href = book.amazon_affiliate_url || '';
                  }
                }}
              >
                <h3 className="text-lg md:text-lg font-bold line-clamp-2 leading-relaxed text-qiita-text-dark dark:text-white">
                  {book.title || `ISBN: ${book.isbn} の書籍`}
                </h3>
              </a>
            ) : (
              <h3 className="text-lg md:text-lg font-bold line-clamp-2 leading-relaxed text-qiita-text-dark dark:text-white">
                {book.title || `ISBN: ${book.isbn} の書籍`}
              </h3>
            )}
            
            {!book.title && (
              <div className="mt-2 px-2 py-1 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded text-xs text-yellow-700 dark:text-yellow-300 inline-flex items-center gap-1">
                <i className="ri-information-line text-xs"></i>
                <span>書籍情報取得中</span>
              </div>
            )}
          </div>
          
          {/* 統計情報（右） */}
          <div className="flex items-center justify-center md:justify-start gap-4 md:gap-4 text-base md:text-sm flex-shrink-0">
            {(stats.total_views ?? 0) > 0 ? (
              // YouTube動画がある場合
              <>
                <div className="flex items-center gap-1.5 text-qiita-text dark:text-dark-text">
                  <i className="ri-eye-line text-xl md:text-lg"></i>
                  <span className="font-bold text-lg md:text-base">{formatNumber(stats.total_views ?? 0)}</span>
                  <span className="text-sm md:text-xs">再生</span>
                </div>
                <div className="flex items-center gap-1.5 text-qiita-text dark:text-dark-text">
                  <i className="ri-youtube-line text-xl md:text-lg"></i>
                  <span className="font-bold text-lg md:text-base">{stats.mention_count}</span>
                  <span className="text-sm md:text-xs">動画</span>
                </div>
              </>
            ) : (
              // Qiita記事の場合
              <>
                <Link
                  href={`/books/${book.isbn}#qiita-articles`}
                  prefetch={true}
                  className="flex items-center gap-1.5 text-qiita-green dark:text-dark-green"
                >
                  <i className="ri-article-line text-xl md:text-lg"></i>
                  <span className="font-bold text-lg md:text-base">{formatNumber(stats.mention_count)}</span>
                  <span className="text-sm md:text-xs">記事</span>
                </Link>
                {stats.total_likes > 0 && (
                  <Link
                    href={`/books/${book.isbn}#qiita-articles`}
                    prefetch={true}
                    className="flex items-center gap-1.5 text-pink-600 dark:text-pink-400"
                  >
                    <i className="ri-heart-fill text-xl md:text-lg"></i>
                    <span className="font-bold text-lg md:text-base">{formatNumber(stats.total_likes)}</span>
                    <span className="text-sm md:text-xs text-qiita-text dark:text-dark-text">いいね</span>
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* トップ記事一覧（下部） */}
        {topArticles && topArticles.length > 0 && (
          <div>
            <h4 className="text-sm md:text-xs font-bold text-qiita-text dark:text-dark-text mb-3 md:mb-3 flex items-center justify-center md:justify-start gap-1.5">
              <i className="ri-article-line text-qiita-green dark:text-dark-green text-base md:text-sm"></i>
              人気記事トップ{topArticles.length}
            </h4>
            <div className="space-y-2 md:space-y-2">
              {topArticles.map((article, index) => (
                <a
                  key={article.id}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 md:p-3 rounded-lg bg-qiita-surface/30 dark:bg-dark-surface-light/30 border border-qiita-border/30 dark:border-dark-border/30"
                >
                  <div className="flex items-start gap-3 md:gap-2.5">
                    <span className="flex-shrink-0 w-7 h-7 md:w-6 md:h-6 flex items-center justify-center rounded-full bg-qiita-green/20 dark:bg-qiita-green/30 text-qiita-green dark:text-dark-green text-sm md:text-xs font-bold">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-base md:text-sm font-semibold text-qiita-text-dark dark:text-white line-clamp-2 leading-relaxed mb-2 md:mb-1.5">
                        {article.title}
                      </p>
                      <div className="flex items-center gap-1.5 md:gap-1 text-sm md:text-xs text-qiita-text dark:text-dark-text">
                        <i className="ri-heart-fill text-pink-500 text-base md:text-sm"></i>
                        <span>{formatNumber(article.likes_count)}</span>
                      </div>
                    </div>
                    <i className="ri-external-link-line text-lg md:text-base text-qiita-text-light dark:text-dark-text-light flex-shrink-0"></i>
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-3 md:mt-3 flex justify-end">
              <Link
                href={`/books/${book.isbn}#qiita-articles`}
                prefetch={true}
                className="inline-flex items-center gap-1.5 md:gap-1 text-sm md:text-xs text-qiita-green dark:text-dark-green font-medium py-2 px-3 md:py-0 md:px-0"
                onClick={() => {
                  analytics.clickBook(book.isbn || '', book.title, rank);
                }}
              >
                <span>すべての記事を見る</span>
                <i className="ri-arrow-right-line text-base md:text-sm"></i>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default memo(BookCard);

