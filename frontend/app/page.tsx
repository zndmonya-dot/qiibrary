'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRankings, getAvailableYears, RankingResponse } from '@/lib/api';
import { analytics, trackPageView } from '@/lib/analytics';
import { ITEMS_PER_PAGE, ANIMATION, SEARCH } from '@/lib/constants';
import { generateWebSiteStructuredData, generateRankingStructuredData } from '@/lib/seo';
import { getErrorMessage, logError } from '@/lib/error-handler';
import { PeriodType } from '@/types/common';

// スクロール位置キャッシュ（これは残す）
const scrollPositionCache = new Map<string, number>();
// 利用可能な年のキャッシュ
let availableYearsCache: number[] | null = null;

const getPeriodLabel = (period: PeriodType, selectedYear: number | null): string => {
  if (period === 'daily') return '24時間';
  if (period === 'monthly') return '30日間';
  if (period === 'yearly') return '365日間';
  if (period === 'year' && selectedYear) return `${selectedYear}年`;
  if (period === 'all') return '全期間';
  return '365日間';
};

const getAnimationStyle = (index: number): React.CSSProperties => ({
  animation: `fadeInUp ${ANIMATION.DURATION}s ease-out ${ANIMATION.FADE_IN_DELAY + index * ANIMATION.FADE_IN_INCREMENT}s forwards`,
  opacity: 0
});


export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URLパラメータから初期状態を復元
  const [period, setPeriod] = useState<PeriodType>((searchParams.get('period') as PeriodType) || 'yearly');
  const [selectedYear, setSelectedYear] = useState<number | null>(
    searchParams.get('year') ? parseInt(searchParams.get('year')!) : null
  );
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(
    searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1
  );
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showAllYears, setShowAllYears] = useState(false);
  
  // URLを更新するヘルパー関数
  const updateURL = useCallback((params: Record<string, string | number | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === '' || value === 1 || (key === 'period' && value === 'yearly')) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });
    
    const queryString = newParams.toString();
    router.replace(queryString ? `/?${queryString}` : '/', { scroll: false });
  }, [searchParams, router]);

  useEffect(() => {
    const fetchYears = async () => {
      // キャッシュがあればそれを使用
      if (availableYearsCache) {
        setAvailableYears(availableYearsCache);
        return;
      }
      
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
        // グローバルキャッシュに保存
        availableYearsCache = years;
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
      
      try {
        // 真のサーバーサイドページネーション
        const options = {
          limit: ITEMS_PER_PAGE,  // 1ページあたりの件数（25件）
          offset: (currentPage - 1) * ITEMS_PER_PAGE,  // ページに応じたオフセット
          search: searchQuery || undefined,  // サーバーサイド検索
        };
        
        const data = period === 'daily' ? await getRankings.daily(options)
          : period === 'monthly' ? await getRankings.monthly(options)
          : period === 'yearly' ? await getRankings.yearly(options)
          : period === 'year' && selectedYear ? await getRankings.byYear(selectedYear, options)
          : await getRankings.all(options);
        
        setRankings(data);
        setError(null);  // エラーをクリア
      } catch (err: any) {
        logError(err, 'ランキング取得');
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    
    // デバウンス：検索時は設定された時間待つ
    const timeoutId = setTimeout(() => {
      fetchRankings();
    }, searchQuery ? SEARCH.DEBOUNCE_DELAY : 0);
    
    return () => clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, selectedYear, searchQuery, currentPage]);

  // スクロール位置の保存と復元（ちらつき防止版）
  useEffect(() => {
    // ブラウザのデフォルト復元を無効化
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const cacheKey = period === 'year' ? `${period}-${selectedYear}` : period;
    
    // 保存：スクロールイベント
    const saveScroll = () => {
      scrollPositionCache.set(cacheKey, window.scrollY);
    };

    window.addEventListener('scroll', saveScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', saveScroll);
      saveScroll(); // 最後に保存
    };
  }, [period, selectedYear]);

  // 復元：データ表示直後（ちらつき防止のため即座に実行）
  useEffect(() => {
    if (!rankings) return;
    
    const cacheKey = period === 'year' ? `${period}-${selectedYear}` : period;
    const savedPosition = scrollPositionCache.get(cacheKey) || 0;
    
    if (savedPosition > 0) {
      // 同期的に即座に復元
      window.scrollTo(0, savedPosition);
    }
  }, [period, selectedYear, rankings]);

  // サーバーサイドページネーションなので、取得したデータをそのまま表示
  const paginatedRankings = useMemo(() => {
    if (!rankings) return [];
    return rankings.rankings;
  }, [rankings]);

  // 総ページ数をサーバーから取得した総件数で計算
  const totalPages = useMemo(() => {
    if (!rankings || !rankings.total) return 0;
    return Math.ceil(rankings.total / ITEMS_PER_PAGE);
  }, [rankings]);
  
  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateURL({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'instant' }); // サーバーから取得するので即座にスクロール
    }
  }, [currentPage, totalPages, updateURL]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateURL({ page: newPage });
      window.scrollTo({ top: 0, behavior: 'instant' }); // サーバーから取得するので即座にスクロール
    }
  }, [currentPage, updateURL]);

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
                const query = e.target.value;
                setSearchQuery(query);
                setCurrentPage(1);
                updateURL({ search: query, page: 1 });
                if (query) {
                  analytics.search(query, rankings?.total || 0);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur(); // キーボードを閉じる
                }
              }}
              className="w-full pl-3 md:pl-12 pr-12 md:pr-12 py-2.5 md:py-3 text-[16px] bg-qiita-surface dark:bg-[#494b4b] text-qiita-text-dark dark:text-white rounded-lg border border-qiita-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-qiita-green/50 dark:focus:ring-dark-green/50 font-medium"
              aria-label="書籍を検索"
            />
            
            {/* クリアボタン（検索文字がある時のみ） */}
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  updateURL({ search: '', page: 1 });
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
          {searchQuery && rankings && rankings.total > 0 && !loading && (
            <div className="mt-3 text-sm md:text-base text-qiita-text dark:text-dark-text font-medium">
              <i className="ri-information-line text-qiita-green dark:text-dark-green mr-1"></i>
              {rankings.total}件の書籍が見つかりました
            </div>
          )}
          {searchQuery && rankings && rankings.total === 0 && !loading && (
            <div className="mt-3 text-sm md:text-base text-red-600 dark:text-red-400 font-medium animate-fade-in-up">
              <i className="ri-error-warning-line mr-1"></i>
              該当する書籍が見つかりませんでした
            </div>
          )}
          {loading && searchQuery && (
            <div className="mt-3 text-sm md:text-base text-qiita-text dark:text-dark-text font-medium">
              <i className="ri-loader-4-line animate-spin mr-1"></i>
              検索中...
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
                setCurrentPage(1);
                updateURL({ period: 'daily', year: null, page: 1 });
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
                setCurrentPage(1);
                updateURL({ period: 'monthly', year: null, page: 1 });
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
                setCurrentPage(1);
                updateURL({ period: 'yearly', year: null, page: 1 });
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
                setCurrentPage(1);
                updateURL({ period: 'all', year: null, page: 1 });
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
                  setCurrentPage(1);
                  updateURL({ period: 'year', year: year, page: 1 });
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
                    setCurrentPage(1);
                    updateURL({ period: 'year', year: year, page: 1 });
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
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <i className="ri-error-warning-line text-xl"></i>
                <span>{error}</span>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  // リトライ
                  window.location.reload();
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors"
              >
                <i className="ri-refresh-line mr-1"></i>
                再試行
              </button>
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
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, rankings?.total || 0)} / {rankings?.total || 0}件
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
                        updateURL({ page: 1 });
                        window.scrollTo({ top: 0, behavior: 'instant' });
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
                              updateURL({ page });
                              window.scrollTo({ top: 0, behavior: 'instant' });
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
                        updateURL({ page: totalPages });
                        window.scrollTo({ top: 0, behavior: 'instant' });
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
                          updateURL({ page });
                          window.scrollTo({ top: 0, behavior: 'instant' });
                        }
                      }}
                      className="w-16 md:w-20 px-2 md:px-3 py-1.5 md:py-2 text-sm md:text-base bg-qiita-surface dark:bg-dark-surface-light border border-qiita-border dark:border-dark-border rounded-lg text-center text-qiita-text-dark dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                      aria-label="ページ番号"
                    />
                    <span className="text-xs md:text-sm text-qiita-text dark:text-dark-text">/ {totalPages}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* 構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteStructuredData()),
        }}
      />
      {rankings && rankings.rankings && rankings.rankings.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateRankingStructuredData(
                rankings.rankings.slice(0, 10).map((item, index) => ({
                  book: item.book,
                  rank: (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
                }))
              )
            ),
          }}
        />
      )}
      
      <Footer />
    </div>
  );
}

