'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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
    // ページトップにスクロール
    window.scrollTo(0, 0);
    
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
            className="mt-4 text-qiita-green dark:text-dark-green hover-text-green inline-flex items-center gap-1"
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
          
          <main className="container mx-auto px-3 md:px-4 pt-6 pb-4 md:py-8">
            {/* 戻るボタン */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-qiita-text dark:text-dark-text hover-text-green mb-4 md:mb-8 text-sm md:text-base font-medium py-2 px-3 md:px-0 md:py-0"
            >
              <i className="ri-arrow-left-line text-base md:text-lg"></i>
              <span>ランキングに戻る</span>
            </button>
            
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
                      className="group block p-2 md:p-3 rounded-lg bg-qiita-surface dark:bg-[#2f3232] hover-card"
                      style={style}
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
                    );
                  })}
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
      </main>
      
      <Footer />
    </div>
  );
}

