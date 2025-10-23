'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRankings, getAvailableYears, RankingResponse } from '@/lib/api';
import { analytics, trackPageView } from '@/lib/analytics';
import { ITEMS_PER_PAGE } from '@/lib/constants';

type PeriodType = 'daily' | 'monthly' | 'yearly' | 'all' | 'year';

const getPeriodLabel = (period: PeriodType, selectedYear: number | null): string => {
  if (period === 'daily') return '24時間';
  if (period === 'monthly') return '30日間';
  if (period === 'yearly') return '365日間';
  if (period === 'year' && selectedYear) return `${selectedYear}年`;
  if (period === 'all') return '全期間';
  return '365日間';
};

const getAnimationStyle = (index: number): React.CSSProperties => ({
  animation: `fadeInUp 0.4s ease-out ${0.2 + index * 0.05}s forwards`,
  opacity: 0
});

export default function Home() {
  const [period, setPeriod] = useState<PeriodType>('yearly');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllYears, setShowAllYears] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
      } catch (err) {
        console.error('Failed to fetch available years:', err);
      }
    };
    fetchYears();
  }, []);

  const sortedYears = useMemo(() => [...availableYears].sort((a, b) => b - a), [availableYears]);
  const recentYears = useMemo(() => sortedYears.slice(0, 6), [sortedYears]);
  const olderYears = useMemo(() => sortedYears.slice(6), [sortedYears]);

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1);
      
      try {
        const data = period === 'daily' ? await getRankings.daily()
          : period === 'monthly' ? await getRankings.monthly()
          : period === 'yearly' ? await getRankings.yearly()
          : period === 'year' && selectedYear ? await getRankings.byYear(selectedYear)
          : await getRankings.all();
        
        setRankings(data);
      } catch (err) {
        setError('ランキングの取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankings();
  }, [period, selectedYear]);

  const filteredRankings = useMemo(() => {
    if (!rankings) return [];
    return rankings.rankings.filter(item => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.book.title?.toLowerCase().includes(query) ||
        item.book.author?.toLowerCase().includes(query) ||
        item.book.publisher?.toLowerCase().includes(query) ||
        item.book.isbn?.toLowerCase().includes(query)
      );
    });
  }, [rankings, searchQuery]);

  const paginatedRankings = useMemo(() => {
    return filteredRankings.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [filteredRankings, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredRankings.length / ITEMS_PER_PAGE);
  }, [filteredRankings.length]);
  
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);
  
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  // 構造化データ（JSON-LD）
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Qiibrary - Qiitaで話題の技術書まとめ',
    url: 'https://qiibrary.com',
    description: 'エンジニアが実践で使い、Qiita記事で推薦した技術書ライブラリ。開発者コミュニティの知見を集約し、現場で本当に役立つ技術書を厳選してお届けします。',
    inLanguage: 'ja',
    publisher: {
      '@type': 'Organization',
      name: 'Qiibrary',
      url: 'https://qiibrary.com'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://qiibrary.com/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      {/* 構造化データ（JSON-LD） */}
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />
      
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-3 md:py-8 min-h-[calc(100vh-120px)]">
        {/* ヘッダー */}
        <div className="mb-3 md:mb-8 bg-qiita-card dark:bg-dark-surface rounded-xl p-3 md:p-8 border-l-4 border-qiita-green dark:border-dark-green shadow-sm animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div className="w-full text-left">
              <h2 className="text-lg md:text-3xl font-bold mb-1.5 md:mb-3 flex items-center justify-start gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
                <i className="ri-trophy-line text-qiita-green dark:text-dark-green text-xl md:text-3xl"></i>
                Qiitaで話題の技術書まとめ
              </h2>
              <p className="text-qiita-text dark:text-dark-text font-medium text-xs md:text-base leading-relaxed" style={{ textAlign: 'left' }}>
                おすすめ書籍をランキング形式でわかりやすく紹介！
              </p>
            </div>
          </div>
        </div>
        
        {/* 検索バー */}
        <div className="mb-4 md:mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-4 animate-fade-in-up">
          <div className="relative">
            {/* デスクトップ: 左側の虫眼鏡アイコン */}
            <i className="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-qiita-text dark:text-dark-text text-lg md:text-xl hidden md:block"></i>
            
            <input
              type="text"
              placeholder="書籍名、著者、出版社、ISBNで検索..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // 検索時はページをリセット
                if (e.target.value) {
                  analytics.search(e.target.value, filteredRankings.length);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur(); // キーボードを閉じる
                }
              }}
              className="w-full pl-3 md:pl-12 pr-12 md:pr-12 py-2.5 md:py-3 text-[16px] bg-qiita-surface dark:bg-[#494b4b] text-qiita-text-dark dark:text-white rounded-lg border border-qiita-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-qiita-green/50 dark:focus:ring-dark-green/50 font-medium"
            />
            
            {/* クリアボタン（検索文字がある時のみ） */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-12 md:right-4 top-1/2 -translate-y-1/2 text-qiita-text dark:text-dark-text p-1 md:p-0"
                aria-label="検索をクリア"
              >
                <i className="ri-close-circle-line text-xl"></i>
              </button>
            )}
            
            {/* スマホ: 右側の検索ボタン */}
            <button
              onClick={() => {
                // キーボードを閉じる
                if (document.activeElement instanceof HTMLElement) {
                  document.activeElement.blur();
                }
              }}
              className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 text-qiita-green dark:text-dark-green p-1 hover:opacity-70 transition-opacity"
              aria-label="検索"
            >
              <i className="ri-search-line text-2xl"></i>
            </button>
          </div>
          {searchQuery && filteredRankings.length > 0 && (
            <div className="mt-3 text-sm md:text-base text-qiita-text dark:text-dark-text font-medium">
              <i className="ri-information-line text-qiita-green dark:text-dark-green mr-1"></i>
              {filteredRankings.length}件の書籍が見つかりました
            </div>
          )}
          {searchQuery && filteredRankings.length === 0 && !loading && (
            <div className="mt-3 text-sm md:text-base text-red-600 dark:text-red-400 font-medium animate-fade-in-up">
              <i className="ri-error-warning-line mr-1"></i>
              該当する書籍が見つかりませんでした
            </div>
          )}
        </div>
        
        {/* タブ */}
        <div className="relative mb-3 md:mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-2 md:p-4 overflow-x-auto animate-fade-in-up animate-delay-50">
          <div className="flex flex-nowrap md:flex-wrap gap-1.5 md:gap-2 min-w-max md:min-w-0">
            <button
              onClick={() => {
                setPeriod('daily');
                setSelectedYear(null);
                analytics.changeRankingPeriod('daily');
              }}
              className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold whitespace-nowrap transition-all duration-150 ${
                period === 'daily'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm' 
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
              }`}
            >
              <i className="ri-time-line mr-0.5 md:mr-1 text-sm md:text-base"></i>
              <span className="hidden sm:inline">24時間</span>
              <span className="inline sm:hidden">24h</span>
            </button>
            <button
              onClick={() => {
                setPeriod('monthly');
                setSelectedYear(null);
                analytics.changeRankingPeriod('monthly');
              }}
              className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 ${
                period === 'monthly'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
              }`}
            >
              <i className="ri-calendar-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
              30日間
            </button>
            <button
              onClick={() => {
                setPeriod('yearly');
                setSelectedYear(null);
                analytics.changeRankingPeriod('yearly');
              }}
              className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 ${
                period === 'yearly'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
              }`}
            >
              <i className="ri-calendar-check-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
              365日間
            </button>
            <button
              onClick={() => {
                setPeriod('all');
                setSelectedYear(null);
                analytics.changeRankingPeriod('all');
              }}
              className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 ${
                period === 'all'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
              }`}
            >
              <i className="ri-infinity-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
              全期間
            </button>
            
            {recentYears.length > 0 && (
              <div className="w-px h-8 bg-qiita-border dark:bg-dark-border"></div>
            )}
            
            {recentYears.map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setPeriod('year');
                  analytics.changeRankingPeriod(`year-${year}`);
                }}
                className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 ${
                  period === 'year' && selectedYear === year
                    ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                    : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
                }`}
              >
                <i className="ri-calendar-2-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
                {year}年
              </button>
            ))}
            
            {olderYears.length > 0 && (
              <button
                onClick={() => setShowAllYears(!showAllYears)}
                className="px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary"
              >
                {showAllYears ? (
                  <>
                    <i className="ri-arrow-up-s-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
                    閉じる
                  </>
                ) : (
                  <>
                    <i className="ri-arrow-down-s-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
                    もっと見る（{olderYears.length}年）
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* 古い年の展開エリア */}
          {showAllYears && olderYears.length > 0 && (
            <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-qiita-border dark:border-dark-border animate-fade-in-up">
              {olderYears.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setPeriod('year');
                    analytics.changeRankingPeriod(`year-${year}`);
                  }}
                  className={`px-2.5 md:px-4 py-1 md:py-2 text-xs md:text-base rounded-lg font-semibold transition-all duration-150 ${
                    period === 'year' && selectedYear === year
                      ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover-primary'
                  }`}
                >
                  <i className="ri-calendar-2-line mr-0.5 md:mr-1 text-xs md:text-base"></i>
                  {year}年
                </button>
              ))}
            </div>
          )}
        </div>
        
        {loading && !rankings && (
          <LoadingSpinner />
        )}
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded animate-slide-down">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-xl"></i>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {!error && rankings && loading && (
          <LoadingSpinner />
        )}

        {!error && rankings && !loading && (
          <div>
            <div className="mb-3 md:mb-6 flex items-center justify-between bg-qiita-card dark:bg-dark-surface p-2.5 md:p-4 rounded-lg shadow-sm border border-qiita-border dark:border-dark-border animate-fade-in-up animate-delay-100">
              <div className="flex items-center gap-1.5 md:gap-2">
                <i className="ri-trophy-line text-qiita-green dark:text-dark-green text-lg md:text-2xl"></i>
                <h2 className="text-sm md:text-lg font-semibold text-qiita-text-dark dark:text-white">
                  {getPeriodLabel(period, selectedYear)}
                </h2>
              </div>
              <div className="text-[10px] md:text-sm text-qiita-text dark:text-dark-text">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRankings.length)} / {filteredRankings.length}件
              </div>
            </div>
            
            <div className="space-y-2 md:space-y-4 mb-4 md:mb-8">
              {paginatedRankings.length > 0 ? (
                paginatedRankings.map((item, index) => {
                  const style = getAnimationStyle(index);
                  
                  return (
                    <div key={item.book.id} style={style}>
                      <BookCard
                        rank={item.rank}
                        book={item.book}
                        stats={item.stats}
                        topArticles={item.top_articles}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-12 text-center border border-qiita-border dark:border-dark-border shadow-sm animate-fade-in-up">
                  <i className="ri-inbox-line text-6xl text-qiita-text-light dark:text-dark-text-light mb-4"></i>
                  <h3 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-2">データがありません</h3>
                  <p className="text-qiita-text dark:text-dark-text">この期間のランキングデータはまだ収集されていません。</p>
                </div>
              )}
            </div>
            
            {totalPages > 1 && (
              <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-3 md:p-6 shadow-sm border border-qiita-border dark:border-dark-border">
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg font-medium transition-all duration-150 ${
                        currentPage === 1
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover-primary'
                      }`}
                      title="最初のページ"
                    >
                      <i className="ri-skip-back-mini-line text-lg md:text-xl"></i>
                    </button>
                    
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-3 md:px-4 h-10 md:h-11 rounded-lg font-semibold text-sm md:text-base transition-all duration-150 ${
                        currentPage === 1
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover-primary'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line text-lg md:text-xl"></i>
                      <span className="hidden sm:inline">前へ</span>
                    </button>
                    
                    {(() => {
                      const pageNumbers: (number | string)[] = [];
                      const maxVisible = 7; // 表示する最大ページ番号数
                      
                      if (totalPages <= maxVisible + 2) {
                        // 全ページ番号を表示
                        for (let i = 1; i <= totalPages; i++) {
                          pageNumbers.push(i);
                        }
                      } else {
                        // 最初のページ
                        pageNumbers.push(1);
                        
                        if (currentPage <= 4) {
                          // 最初の方のページ
                          for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
                            pageNumbers.push(i);
                          }
                          pageNumbers.push('...');
                        } else if (currentPage >= totalPages - 3) {
                          // 最後の方のページ
                          pageNumbers.push('...');
                          for (let i = Math.max(2, totalPages - 4); i <= totalPages - 1; i++) {
                            pageNumbers.push(i);
                          }
                        } else {
                          // 中間のページ
                          pageNumbers.push('...');
                          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                            pageNumbers.push(i);
                          }
                          pageNumbers.push('...');
                        }
                        
                        // 最後のページ
                        pageNumbers.push(totalPages);
                      }
                      
                      return pageNumbers.map((page, index) => (
                        typeof page === 'number' ? (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentPage(page);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg font-semibold text-sm md:text-base transition-all duration-150 ${
                              currentPage === page
                                ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                                : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover-primary'
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={index} className="flex items-center justify-center w-8 md:w-10 h-10 md:h-11 text-qiita-text-light dark:text-dark-text-light text-sm md:text-base">
                            {page}
                          </span>
                        )
                      ));
                    })()}
                    
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-1 px-3 md:px-4 h-10 md:h-11 rounded-lg font-semibold text-sm md:text-base transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover-primary'
                      }`}
                    >
                      <span className="hidden sm:inline">次へ</span>
                      <i className="ri-arrow-right-s-line text-lg md:text-xl"></i>
                    </button>
                    
                    <button
                      onClick={() => {
                        setCurrentPage(totalPages);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-10 h-10 md:w-11 md:h-11 rounded-lg font-medium transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover-primary'
                      }`}
                      title="最後のページ"
                    >
                      <i className="ri-skip-forward-mini-line text-lg md:text-xl"></i>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 md:gap-3">
                    <span className="text-xs md:text-sm text-qiita-text dark:text-dark-text">ページ:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = parseInt(e.target.value);
                        if (page >= 1 && page <= totalPages) {
                          setCurrentPage(page);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-qiita-surface dark:bg-dark-surface-light border border-qiita-border dark:border-dark-border rounded-lg text-center text-qiita-text-dark dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                    />
                    <span className="text-xs md:text-sm text-qiita-text dark:text-dark-text">/ {totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

