'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getBookDetail, BookDetail } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';

const INITIAL_ARTICLES_COUNT = 10;
const SHOW_MORE_INCREMENT = 10;
const ANIMATION_TIMEOUT_MORE = 1200;
const ANIMATION_TIMEOUT_ALL = 2000;
const MIN_LOADING_DELAY = 300;

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const asin = params.asin as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(INITIAL_ARTICLES_COUNT);
  const previousCountRef = useRef(INITIAL_ARTICLES_COUNT);
  const [newlyAddedStart, setNewlyAddedStart] = useState<number | null>(null);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      setDisplayedArticlesCount(INITIAL_ARTICLES_COUNT);
      previousCountRef.current = INITIAL_ARTICLES_COUNT;
      setNewlyAddedStart(null);
      
      try {
        const data = await getBookDetail(asin);
        const minDelay = new Promise(resolve => setTimeout(resolve, MIN_LOADING_DELAY));
        await Promise.all([data, minDelay]);
        setBook(data);
      } catch (err) {
        setError('書籍情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [asin]);

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
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-qiita-green dark:text-dark-green hover:text-qiita-green-dark dark:hover:text-dark-green transition-colors duration-200 inline-flex items-center gap-1"
          >
            <i className="ri-arrow-left-line"></i>
            ランキングに戻る
          </button>
        </div>
      </div>
    );
  }

      return (
        <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            {/* 戻るボタン */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-qiita-text dark:text-dark-text hover:text-qiita-green dark:hover:text-dark-green mb-8 transition-colors duration-200 text-sm font-medium"
            >
              <i className="ri-arrow-left-line text-base"></i>
              <span>ランキングに戻る</span>
            </button>
            
            {/* タイトル */}
            <div className="mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-qiita-text-dark dark:text-white leading-tight">
                {book.title}
              </h1>
            </div>
            
            {/* Qiita記事セクション */}
            {book.qiita_articles && book.qiita_articles.length > 0 && (
              <div id="qiita-articles" className="mb-12 scroll-mt-24">
                {/* セクションヘッダー */}
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-lg font-bold text-qiita-text-dark dark:text-white">
                      この本を紹介しているQiita記事
                    </h2>
                    <span className="text-sm font-bold text-qiita-green dark:text-dark-green px-2 py-0.5 bg-qiita-green/10 dark:bg-qiita-green/20 rounded">
                      {book.qiita_articles.length}件
                    </span>
                  </div>
                  <p className="text-sm text-qiita-text dark:text-dark-text">
                    実際に使ってみた開発者の声
                  </p>
                </div>
                
                <div className="space-y-1.5 md:space-y-2">
                  {book.qiita_articles.slice(0, displayedArticlesCount).map((article, index) => {
                    let style: React.CSSProperties = {};
                    
                    if (newlyAddedStart !== null && index >= newlyAddedStart) {
                      const relativeIndex = index - newlyAddedStart;
                      const delayMs = Math.min(relativeIndex, 9) * 100;
                      style = {
                        animation: `fadeInUp 0.5s ease-out ${delayMs}ms forwards`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      };
                    } else if (index < INITIAL_ARTICLES_COUNT && displayedArticlesCount === INITIAL_ARTICLES_COUNT) {
                      const delayMs = index * 100;
                      style = {
                        animation: `fadeInUp 0.5s ease-out ${delayMs}ms forwards`,
                        opacity: 0,
                        transform: 'translateY(20px)'
                      };
                    }
                    
                    return (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-2.5 md:p-3 rounded-lg hover:bg-qiita-green/5 dark:hover:bg-qiita-green/10 transition-all duration-200"
                      style={style}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 pt-1">
                          <i className="ri-article-line text-qiita-green dark:text-dark-green text-lg"></i>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold text-qiita-text-dark dark:text-white mb-2 group-hover:text-qiita-green dark:group-hover:text-dark-green transition-colors line-clamp-2 leading-relaxed">
                            {article.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs text-qiita-text dark:text-dark-text mb-2">
                            <span className="flex items-center gap-1">
                              <i className="ri-user-line"></i>
                              {article.author_name || article.author_id}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-heart-fill text-pink-500"></i>
                              {formatNumber(article.likes_count)}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-bookmark-line"></i>
                              {formatNumber(article.stocks_count)}
                            </span>
                            <span>{new Date(article.published_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                          
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {article.tags.slice(0, 5).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-qiita-green/10 dark:bg-qiita-green/20 text-qiita-green dark:text-dark-green text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 5 && (
                                <span className="text-xs text-qiita-text dark:text-dark-text">
                                  +{article.tags.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0 pt-1">
                          <i className="ri-external-link-line text-qiita-text-light dark:text-dark-text-light group-hover:text-qiita-green dark:group-hover:text-dark-green text-base transition-colors"></i>
                        </div>
                      </div>
                    </a>
                    );
                  })}
                </div>
                
                {/* もっと見る / すべて表示ボタン */}
                {book.qiita_articles.length > displayedArticlesCount && (
                  <div className="mt-6 flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => handleShowMore(SHOW_MORE_INCREMENT)}
                      className="px-4 py-2 text-sm bg-qiita-green dark:bg-dark-green text-white rounded-lg hover:opacity-90 transition-opacity font-medium"
                    >
                      もっと見る（+{SHOW_MORE_INCREMENT}件）
                    </button>
                    <button
                      onClick={handleShowAll}
                      className="px-4 py-2 text-sm bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 transition-colors font-medium border border-qiita-border dark:border-dark-border"
                    >
                      すべて表示（全{book.qiita_articles.length}件）
                    </button>
                  </div>
                )}
              </div>
            )}
        
            {/* YouTube動画セクション */}
            {book.youtube_videos && book.youtube_videos.length > 0 && (
              <div className="mb-12 animate-fade-in-up animate-delay-300">
                {/* セクションヘッダー */}
                <div className="mb-6">
                  <div className="bg-youtube-red/10 dark:bg-youtube-red/20 rounded-lg p-3 md:p-5 border-l-4 border-youtube-red">
                    <h2 className="text-base md:text-xl lg:text-2xl font-bold lg:font-extrabold flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
                      <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-youtube-red rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="ri-youtube-fill text-white text-lg md:text-2xl lg:text-3xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                          <span className="text-sm md:text-base lg:text-lg">この本を紹介しているYouTube動画</span>
                          <span className="bg-youtube-red text-white text-xs md:text-sm lg:text-base font-bold px-2 md:px-3 lg:px-4 py-0.5 md:py-1 rounded-full">
                            {book.youtube_videos.length}件
                          </span>
                        </div>
                        <p className="text-xs md:text-sm lg:text-base text-qiita-text dark:text-dark-text font-normal lg:font-medium mt-1">
                          動画で詳しい解説をチェック
                        </p>
                      </div>
                    </h2>
                  </div>
                </div>
                
                {/* 動画グリッド */}
                <div className={`grid gap-6 ${
                  book.youtube_videos.length === 1 
                    ? 'grid-cols-1 max-w-2xl mx-auto' 
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                  {book.youtube_videos.map((video) => (
                    <YouTubeEmbed key={video.video_id} video={video} />
                  ))}
                </div>
              </div>
            )}
      </main>
      
      <Footer />
    </div>
  );
}

