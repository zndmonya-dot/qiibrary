'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getBookDetail, BookDetail } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';

// グローバルキャッシュ（コンポーネント外で管理）
const bookDetailsCache = new Map<string, BookDetail>();
// スクロール位置キャッシュ
const scrollPositionCache = new Map<string, number>();

const INITIAL_ARTICLES_COUNT = 20;
const SHOW_MORE_INCREMENT = 20;
const ANIMATION_TIMEOUT_MORE = 1200;
const ANIMATION_TIMEOUT_ALL = 2000;
const MIN_LOADING_DELAY = 300;

export default function BookDetailPage() {
  const params = useParams();
  const asin = params.asin as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(INITIAL_ARTICLES_COUNT);
  const previousCountRef = useRef(INITIAL_ARTICLES_COUNT);
  const [newlyAddedStart, setNewlyAddedStart] = useState<number | null>(null);
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [displayedVideosCount, setDisplayedVideosCount] = useState(8);
  const [newlyAddedVideosStart, setNewlyAddedVideosStart] = useState<number | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      // キャッシュにデータがあればそれを使用
      const cachedData = bookDetailsCache.get(asin);
      if (cachedData) {
        setBook(cachedData);
        setLoading(false);
        setDisplayedArticlesCount(INITIAL_ARTICLES_COUNT);
        previousCountRef.current = INITIAL_ARTICLES_COUNT;
        setNewlyAddedStart(null);
        setDisplayedVideosCount(8);
        setNewlyAddedVideosStart(null);
        return;
      }
      
      // 新規取得時のみページトップにスクロール
      window.scrollTo(0, 0);
      
      setLoading(true);
      setError(null);
      setDisplayedArticlesCount(INITIAL_ARTICLES_COUNT);
      previousCountRef.current = INITIAL_ARTICLES_COUNT;
      setNewlyAddedStart(null);
      setDisplayedVideosCount(8);
      setNewlyAddedVideosStart(null);
      
      try {
        const data = await getBookDetail(asin);
        const minDelay = new Promise(resolve => setTimeout(resolve, MIN_LOADING_DELAY));
        await Promise.all([data, minDelay]);
        setBook(data);
        
        // データをグローバルキャッシュに保存
        bookDetailsCache.set(asin, data);
      } catch (err) {
        setError('書籍情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [asin]);

  // スクロール位置の保存と復元（シンプル版）
  useEffect(() => {
    // ブラウザのデフォルト復元を無効化
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // 復元：書籍データ表示後
    if (book) {
      const savedPosition = scrollPositionCache.get(asin) || 0;
      if (savedPosition > 0) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
    }

    // 保存：スクロールイベント
    const saveScroll = () => {
      scrollPositionCache.set(asin, window.scrollY);
    };

    window.addEventListener('scroll', saveScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', saveScroll);
      saveScroll(); // 最後に保存
    };
  }, [asin, book]);

  const handleShowMore = useCallback((increment: number) => {
    const currentCount = displayedArticlesCount;
    const newCount = Math.min(currentCount + increment, book?.qiita_articles.length || currentCount);
    
    setNewlyAddedStart(currentCount);
    setDisplayedArticlesCount(newCount);
    previousCountRef.current = newCount;
    
    setTimeout(() => setNewlyAddedStart(null), ANIMATION_TIMEOUT_MORE);
  }, [displayedArticlesCount, book?.qiita_articles?.length]);

  const handleShowAll = useCallback(() => {
    if (!book?.qiita_articles) return;
    
    const currentCount = displayedArticlesCount;
    const totalCount = book.qiita_articles.length;
    
    setNewlyAddedStart(currentCount);
    setDisplayedArticlesCount(totalCount);
    previousCountRef.current = totalCount;
    
    setTimeout(() => setNewlyAddedStart(null), ANIMATION_TIMEOUT_ALL);
  }, [displayedArticlesCount, book?.qiita_articles]);

  const handleShowMoreVideos = useCallback((increment: number) => {
    const currentCount = displayedVideosCount;
    const newCount = Math.min(currentCount + increment, book?.youtube_videos?.length || currentCount);
    
    setNewlyAddedVideosStart(currentCount);
    setDisplayedVideosCount(newCount);
    
    setTimeout(() => setNewlyAddedVideosStart(null), ANIMATION_TIMEOUT_MORE);
  }, [displayedVideosCount, book?.youtube_videos?.length]);

  const handleShowAllVideos = useCallback(() => {
    if (!book?.youtube_videos) return;
    
    const currentCount = displayedVideosCount;
    const totalCount = book.youtube_videos.length;
    
    setNewlyAddedVideosStart(currentCount);
    setDisplayedVideosCount(totalCount);
    
    setTimeout(() => setNewlyAddedVideosStart(null), ANIMATION_TIMEOUT_ALL);
  }, [displayedVideosCount, book?.youtube_videos]);

  // 構造化データ（JSON-LD）を生成
  const generateStructuredData = () => {
    if (!book) return null;

    const totalLikes = book.qiita_articles?.reduce((sum, article) => sum + (article.likes_count || 0), 0) || 0;
    const articleCount = book.qiita_articles?.length || 0;

    return {
      '@context': 'https://schema.org',
      '@type': 'Book',
      '@id': `https://qiibrary.com/books/${asin}`,
      name: book.title,
      author: book.author ? {
        '@type': 'Person',
        name: book.author
      } : undefined,
      isbn: book.isbn,
      image: book.thumbnail_url || undefined,
      publisher: book.publisher ? {
        '@type': 'Organization',
        name: book.publisher
      } : undefined,
      datePublished: book.publication_date || undefined,
      aggregateRating: totalLikes > 0 ? {
        '@type': 'AggregateRating',
        ratingValue: Math.min(5, (totalLikes / articleCount) / 20), // いいね数を5点満点に正規化
        reviewCount: articleCount,
        bestRating: 5,
        worstRating: 1
      } : undefined,
      offers: book.amazon_affiliate_url ? {
        '@type': 'Offer',
        url: book.amazon_affiliate_url,
        availability: 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Amazon.co.jp'
        }
      } : undefined,
      description: `Qiitaで話題の技術書「${book.title}」。${articleCount}件の記事で紹介され、${totalLikes}のいいねを獲得しています。`,
      inLanguage: 'ja',
      genre: '技術書'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
        <Header />
        <main className="container mx-auto px-4 min-h-[calc(100vh-120px)] flex items-center justify-center">
          <LoadingSpinner />
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded animate-slide-down">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-xl"></i>
              <span>{error || '書籍が見つかりませんでした'}</span>
            </div>
          </div>
          <a
            href="/"
            className="mt-4 text-qiita-green dark:text-dark-green hover-text-green inline-flex items-center gap-1 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              window.history.back();
            }}
          >
            <i className="ri-arrow-left-line"></i>
            ランキングに戻る
          </a>
        </div>
      </div>
    );
  }

      return (
        <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
          {/* 構造化データ（JSON-LD） */}
          {book && (
            <Script
              id="structured-data"
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(generateStructuredData()),
              }}
            />
          )}
          
          <Header />
          
          <main className="container mx-auto px-3 md:px-4 pt-6 pb-4 md:py-8">
            {/* 戻るボタン */}
            <a
              href="/"
              className="flex items-center gap-2 text-qiita-text dark:text-dark-text hover-text-green mb-4 md:mb-8 text-sm md:text-base font-medium py-2 px-3 md:px-0 md:py-0 cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.history.back();
              }}
            >
              <i className="ri-arrow-left-line text-base md:text-lg"></i>
              <span>ランキングに戻る</span>
            </a>
            
            {/* タイトル */}
            <div className="mb-4 md:mb-8">
              <h1 className="text-xl md:text-3xl font-bold text-qiita-text-dark dark:text-white leading-tight">
                {book.title}
              </h1>
            </div>
            
            {/* Qiita記事セクション */}
            {book.qiita_articles && book.qiita_articles.length > 0 && (
              <div id="qiita-articles" className="mb-12 scroll-mt-24">
                {/* セクションヘッダー */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <h2 className="text-base md:text-lg font-bold text-qiita-text-dark dark:text-white">
                      この本を紹介しているQiita記事
                    </h2>
                    <span className="text-xs md:text-sm font-bold text-qiita-green dark:text-dark-green px-1.5 md:px-2 py-0.5 bg-qiita-green/10 dark:bg-qiita-green/20 rounded">
                      {book.qiita_articles.length}件
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-qiita-text dark:text-dark-text">
                    実際に使ってみた開発者の声
                  </p>
                </div>
                
                <div className="space-y-1.5 md:space-y-2">
                  {book.qiita_articles.slice(0, displayedArticlesCount).map((article, index) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-2 md:p-3 rounded-lg bg-qiita-surface dark:bg-[#2f3232] hover-card"
                    >
                      <div className="flex gap-2 md:gap-3">
                        <div className="flex-shrink-0 pt-0.5 md:pt-1">
                          <i className="ri-article-line text-qiita-green dark:text-dark-green text-base md:text-lg"></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm md:text-base font-bold text-qiita-text-dark dark:text-white mb-1.5 md:mb-2 group-hover-text-green line-clamp-2 leading-relaxed">
                            {article.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs text-qiita-text dark:text-dark-text mb-1.5 md:mb-2">
                            <span className="flex items-center gap-1 max-w-[120px] md:max-w-none truncate">
                              <i className="ri-user-line flex-shrink-0"></i>
                              <span className="truncate">{article.author_name || article.author_id}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-heart-fill text-pink-500"></i>
                              {formatNumber(article.likes_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-bookmark-line"></i>
                              {formatNumber(article.stocks_count)}
                            </span>
                            <span className="hidden sm:inline">{new Date(article.published_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                          
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 md:gap-1.5">
                              {/* モバイル: 最初の3つ、デスクトップ: 最初の5つ */}
                              {article.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 md:px-2 py-0.5 bg-qiita-green/10 dark:bg-qiita-green/20 text-qiita-green dark:text-dark-green text-[10px] md:text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.slice(3, 5).map((tag, idx) => (
                                <span
                                  key={idx + 3}
                                  className="hidden md:inline-block px-2 py-0.5 bg-qiita-green/10 dark:bg-qiita-green/20 text-qiita-green dark:text-dark-green text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 3 && (
                                <span className="md:hidden text-[10px] text-qiita-text dark:text-dark-text">
                                  +{article.tags.length - 3}
                                </span>
                              )}
                              {article.tags.length > 5 && (
                                <span className="hidden md:inline text-xs text-qiita-text dark:text-dark-text">
                                  +{article.tags.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 pt-0.5 md:pt-1">
                          <i className="ri-external-link-line text-qiita-text-light dark:text-dark-text-light group-hover-text-green text-sm md:text-base"></i>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* もっと見る / すべて表示ボタン */}
                {book.qiita_articles.length > displayedArticlesCount && (
                  <div className="mt-4 md:mt-6 flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => handleShowMore(SHOW_MORE_INCREMENT)}
                      className="px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base bg-qiita-green dark:bg-dark-green text-white rounded-lg hover-opacity-90 font-semibold"
                    >
                      もっと見る（+{SHOW_MORE_INCREMENT}件）
                    </button>
                    <button
                      onClick={handleShowAll}
                      className="px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg hover-primary font-semibold"
                    >
                      すべて表示（全{book.qiita_articles.length}件）
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* YouTube動画セクション */}
            {book.youtube_videos && book.youtube_videos.length > 0 && (
              <div id="youtube-videos" className="mb-12 scroll-mt-24">
                {/* セクションヘッダー */}
                <div className="mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2">
                    <h2 className="text-base md:text-lg font-bold text-qiita-text-dark dark:text-white">
                      関連動画
                    </h2>
                    <span className="text-xs md:text-sm font-bold text-red-500 dark:text-red-400 px-1.5 md:px-2 py-0.5 bg-red-500/10 dark:bg-red-500/20 rounded">
                      {book.youtube_videos.length}件
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-qiita-text dark:text-dark-text">
                    この本について詳しく解説している動画
                  </p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                  {book.youtube_videos.slice(0, displayedVideosCount).map((video, index) => (
                      <button
                        key={video.video_id}
                        onClick={() => setSelectedVideoId(video.video_id)}
                        className="block rounded-lg bg-qiita-surface dark:bg-[#2f3232] overflow-hidden w-full text-left border border-qiita-border dark:border-dark-border hover-card"
                      >
                        {/* サムネイル */}
                        <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 overflow-hidden">
                          {video.thumbnail_url && (
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-full flex items-center justify-center shadow-lg">
                              <i className="ri-play-fill text-white text-lg md:text-2xl ml-0.5"></i>
                            </div>
                          </div>
                        </div>
                        
                        {/* 動画情報 */}
                        <div className="p-2 md:p-3">
                          <h3 className="text-xs md:text-sm font-bold text-qiita-text-dark dark:text-white mb-1.5 md:mb-2 line-clamp-2 leading-relaxed">
                            {video.title}
                          </h3>
                          
                          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-qiita-text dark:text-dark-text mb-1 md:mb-1.5">
                            <div className="flex items-center gap-0.5 md:gap-1 truncate">
                              <i className="ri-youtube-line text-red-500 flex-shrink-0"></i>
                              <span className="truncate">{video.channel_name}</span>
                            </div>
                          </div>
                          
                          {/* 再生回数・いいね数 */}
                          {(video.view_count > 0 || video.like_count > 0) && (
                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-qiita-text dark:text-dark-text">
                              {video.view_count > 0 && (
                                <div className="flex items-center gap-0.5 md:gap-1">
                                  <i className="ri-play-circle-line"></i>
                                  <span>{video.view_count.toLocaleString()}回</span>
                                </div>
                              )}
                              {video.like_count > 0 && (
                                <div className="flex items-center gap-0.5 md:gap-1">
                                  <i className="ri-thumb-up-line"></i>
                                  <span>{video.like_count.toLocaleString()}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                  ))}
                </div>
                
                {/* もっと見る / すべて表示ボタン */}
                {book.youtube_videos.length > displayedVideosCount && (
                  <div className="mt-4 md:mt-6 flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => handleShowMoreVideos(12)}
                      className="px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base bg-red-500 dark:bg-red-600 text-white rounded-lg hover-opacity-90 font-semibold"
                    >
                      もっと見る（+12件）
                    </button>
                    <button
                      onClick={handleShowAllVideos}
                      className="px-4 md:px-5 py-2.5 md:py-3 text-sm md:text-base bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg hover-primary font-semibold"
                    >
                      すべて表示（全{book.youtube_videos.length}件）
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Amazonで購入ボタン */}
            {book.amazon_affiliate_url && (
              <div className="mt-8 md:mt-12 flex justify-center">
                <a
                  href={book.amazon_affiliate_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-3.5 bg-[#FF9900] hover:bg-[#E88B00] text-white font-bold text-sm md:text-base rounded-lg transition-colors duration-200"
                >
                  <i className="ri-shopping-cart-line text-lg md:text-xl"></i>
                  <span>Amazonで購入する</span>
                  <i className="ri-external-link-line text-sm md:text-base"></i>
                </a>
              </div>
            )}

            {/* 動画再生モーダル */}
            {selectedVideoId && (
              <div
                className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={() => setSelectedVideoId(null)}
              >
                <div
                  className="relative w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* 閉じるボタン */}
                  <button
                    onClick={() => setSelectedVideoId(null)}
                    className="absolute top-2 right-2 md:top-4 md:right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center z-10 transition-colors"
                    aria-label="閉じる"
                  >
                    <i className="ri-close-line text-2xl"></i>
                  </button>
                  
                  {/* YouTube埋め込み */}
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideoId}?autoplay=1`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>
            )}
      </main>
      
      <Footer />
    </div>
  );
}

