'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import { getRankings, getAvailableYears, RankingResponse } from '@/lib/api';
import { analytics, trackPageView } from '@/lib/analytics';
import { ITEMS_PER_PAGE } from '@/lib/constants';

type PeriodType = 'daily' | 'monthly' | 'yearly' | 'all' | 'year';

export default function Home() {
  // sessionStorageから初期値を取得（ある場合）
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem('rankingPageState');
      if (savedState) {
        try {
          return JSON.parse(savedState);
        } catch (e) {
          return null;
        }
      }
    }
    return null;
  };

  const initialState = getInitialState();

  const [period, setPeriod] = useState<PeriodType>(initialState?.period || 'yearly');
  const [selectedYear, setSelectedYear] = useState<number | null>(initialState?.selectedYear || null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialState?.currentPage || 1);
  const [searchQuery, setSearchQuery] = useState(initialState?.searchQuery || '');
  const [showAllYears, setShowAllYears] = useState(false);
  const [isRestoring, setIsRestoring] = useState(!!initialState);
  const [savedScrollY, setSavedScrollY] = useState<number | null>(initialState?.scrollY || null);

  // ページ状態をsessionStorageに保存
  const savePageState = () => {
    if (typeof window !== 'undefined') {
      const state = {
        scrollY: window.scrollY,
        currentPage,
        period,
        selectedYear,
        searchQuery,
      };
      sessionStorage.setItem('rankingPageState', JSON.stringify(state));
    }
  };

  // 初回マウント時にsessionStorageをクリア（復元完了後）
  useEffect(() => {
    if (typeof window !== 'undefined' && initialState) {
      // 次回は通常動作にするため、復元完了後にクリア
      sessionStorage.removeItem('rankingPageState');
    }
  }, []);

  // データ読み込み完了後にスクロール位置を復元
  useEffect(() => {
    if (isRestoring && !loading && savedScrollY !== null) {
      setTimeout(() => {
        window.scrollTo({ top: savedScrollY, behavior: 'instant' });
        setSavedScrollY(null);
        setIsRestoring(false);
      }, 50);
    }
  }, [isRestoring, loading, savedScrollY]);

  // 年を最新順にソート
  const sortedYears = [...availableYears].sort((a, b) => b - a);
  
  // 最近の年（デフォルト表示）と古い年（展開で表示）に分ける
  const recentYears = sortedYears.slice(0, 5);
  const olderYears = sortedYears.slice(5);

  // 利用可能な年のリストを取得
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

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      // 復元中でない場合のみページをリセット
      if (!isRestoring) {
        setCurrentPage(1);
      }
      
      try {
        let data: RankingResponse;
        
        if (period === 'daily') {
          data = await getRankings.daily();
        } else if (period === 'monthly') {
          data = await getRankings.monthly();
        } else if (period === 'yearly') {
          data = await getRankings.yearly();
        } else if (period === 'year' && selectedYear) {
          data = await getRankings.byYear(selectedYear);
        } else {
          // all
          data = await getRankings.all();
        }
        
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

  // 検索フィルタリング
  const filteredRankings = rankings ? rankings.rankings.filter(item => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.book.title?.toLowerCase().includes(query) ||
      item.book.author?.toLowerCase().includes(query) ||
      item.book.publisher?.toLowerCase().includes(query) ||
      item.book.isbn?.toLowerCase().includes(query)
    );
  }) : [];

  // ページネーション用の計算
  const paginatedRankings = filteredRankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  
  const totalPages = Math.ceil(filteredRankings.length / ITEMS_PER_PAGE);
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPeriodLabel = () => {
    if (period === 'daily') return '24時間';
    if (period === 'monthly') return '30日間';
    if (period === 'yearly') return '365日間';
    if (period === 'year' && selectedYear) return `${selectedYear}年`;
    if (period === 'all') return '全期間';
    return '365日間'; // デフォルト
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-6 md:mb-8 bg-qiita-card dark:bg-dark-surface rounded-xl p-4 md:p-8 border-l-4 border-qiita-green dark:border-dark-green shadow-sm animate-fade-in-up">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg md:text-3xl font-bold mb-2 md:mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
                <i className="ri-fire-line text-qiita-green dark:text-dark-green text-xl md:text-3xl"></i>
                IT技術書ランキング
              </h2>
              <p className="text-qiita-text dark:text-dark-text font-medium text-xs md:text-base leading-relaxed">
                Qiita記事で言及されたIT技術書をランキング形式で表示
              </p>
              <div className="mt-2 md:mt-4 flex items-center gap-2 text-xs md:text-sm text-qiita-text dark:text-dark-text">
                <i className="ri-information-line text-qiita-green dark:text-dark-green text-xs md:text-base"></i>
                <span>毎日自動更新 • 実際の開発者が選んだ技術書</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 検索バー */}
        <div className="mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-4 animate-fade-in-up animate-delay-100">
          <div className="relative">
            <i className="ri-search-line absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-qiita-text dark:text-dark-text text-lg md:text-xl"></i>
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
              className="w-full pl-10 md:pl-12 pr-3 md:pr-4 py-2 md:py-3 text-sm md:text-base bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg border border-qiita-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green focus:border-transparent font-medium transition-all duration-150"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-qiita-text dark:text-dark-text hover:text-qiita-green dark:hover:text-dark-green transition-colors duration-150"
              >
                <i className="ri-close-circle-line text-xl"></i>
              </button>
            )}
          </div>
          {searchQuery && filteredRankings.length > 0 && (
            <div className="mt-3 text-sm text-qiita-text dark:text-dark-text font-medium">
              <i className="ri-information-line text-qiita-green dark:text-dark-green mr-1"></i>
              {filteredRankings.length}件の書籍が見つかりました
            </div>
          )}
          {searchQuery && filteredRankings.length === 0 && !loading && (
            <div className="mt-3 text-sm text-red-600 dark:text-red-400 font-medium">
              <i className="ri-error-warning-line mr-1"></i>
              該当する書籍が見つかりませんでした
            </div>
          )}
        </div>
        
        {/* タブ - スライドアニメーション付き */}
        <div className="relative mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-4 overflow-x-auto animate-fade-in-up animate-delay-200">
          <div className="flex flex-nowrap md:flex-wrap gap-2 min-w-max md:min-w-0">
            {/* 期間タブ */}
            <button
              onClick={() => {
                setPeriod('daily');
                setSelectedYear(null);
                analytics.changeRankingPeriod('daily');
              }}
              className={`px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base rounded-lg font-semibold transition-all duration-150 whitespace-nowrap ${
                period === 'daily'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm' 
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
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
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                period === 'monthly'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
              }`}
            >
              <i className="ri-calendar-line mr-1"></i>
              30日間
            </button>
            <button
              onClick={() => {
                setPeriod('yearly');
                setSelectedYear(null);
                analytics.changeRankingPeriod('yearly');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                period === 'yearly'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
              }`}
            >
              <i className="ri-calendar-check-line mr-1"></i>
              365日間
            </button>
            <button
              onClick={() => {
                setPeriod('all');
                setSelectedYear(null);
                analytics.changeRankingPeriod('all');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                period === 'all'
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
              }`}
            >
              <i className="ri-infinity-line mr-1"></i>
              全期間
            </button>
            
            {/* 年別セパレーター */}
            {recentYears.length > 0 && (
              <div className="w-px h-8 bg-qiita-border dark:bg-dark-border"></div>
            )}
            
            {/* 最近の年をボタン表示 */}
            {recentYears.map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setPeriod('year');
                  analytics.changeRankingPeriod(`year-${year}`);
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                  period === 'year' && selectedYear === year
                    ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                    : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
                }`}
              >
                <i className="ri-calendar-2-line mr-1"></i>
                {year}年
              </button>
            ))}
            
            {/* もっと見る/閉じるボタン（古い年がある場合のみ） */}
            {olderYears.length > 0 && (
              <button
                onClick={() => setShowAllYears(!showAllYears)}
                className="px-4 py-2 rounded-lg font-semibold transition-all duration-150 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 border border-qiita-border dark:border-dark-border"
              >
                {showAllYears ? (
                  <>
                    <i className="ri-arrow-up-s-line mr-1"></i>
                    閉じる
                  </>
                ) : (
                  <>
                    <i className="ri-arrow-down-s-line mr-1"></i>
                    もっと見る（{olderYears.length}年）
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* 古い年の展開エリア */}
          {showAllYears && olderYears.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-qiita-border dark:border-dark-border animate-fade-in-up">
              {olderYears.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setPeriod('year');
                    analytics.changeRankingPeriod(`year-${year}`);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                    period === 'year' && selectedYear === year
                      ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
                  }`}
                >
                  <i className="ri-calendar-2-line mr-1"></i>
                  {year}年
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* ランキング表示 */}
        {loading && !rankings && (
          <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-12 border border-qiita-border dark:border-dark-border shadow-sm">
            <div className="flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qiita-green dark:border-dark-green mb-4"></div>
              <p className="text-qiita-text dark:text-dark-text text-sm font-medium animate-pulse">読み込み中...</p>
            </div>
          </div>
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
          <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-12 border border-qiita-border dark:border-dark-border shadow-sm">
            <div className="flex flex-col justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qiita-green dark:border-dark-green mb-4"></div>
              <p className="text-qiita-text dark:text-dark-text text-sm font-medium animate-pulse">読み込み中...</p>
            </div>
          </div>
        )}

        {!error && rankings && !loading && (
          <div>
            <div className="mb-6 flex items-center justify-between bg-qiita-card dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-qiita-border dark:border-dark-border animate-fade-in-up animate-delay-300">
              <div className="flex items-center gap-2">
                <i className="ri-trophy-line text-qiita-green dark:text-dark-green text-2xl"></i>
                <h2 className="text-lg font-semibold text-qiita-text-dark dark:text-white">
                  {getPeriodLabel()}
                </h2>
              </div>
              <div className="text-sm text-qiita-text dark:text-dark-text">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRankings.length)} / {filteredRankings.length}件
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {paginatedRankings.length > 0 ? (
                paginatedRankings.map((item, index) => {
                  // 各ページの最初の3件（1位、2位、3位）に遅延アニメーション
                  let animationClass = '';
                  if (index === 0) animationClass = 'animate-fade-in-up animate-delay-400';
                  else if (index === 1) animationClass = 'animate-fade-in-up animate-delay-500';
                  else if (index === 2) animationClass = 'animate-fade-in-up animate-delay-600';
                  
                  return (
                    <div key={item.book.id} className={animationClass}>
                      <BookCard
                        rank={item.rank}
                        book={item.book}
                        stats={item.stats}
                        onNavigate={savePageState}
                      />
                    </div>
                  );
                })
              ) : (
                <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-12 text-center border border-qiita-border dark:border-dark-border shadow-sm">
                  <i className="ri-inbox-line text-6xl text-qiita-text-light dark:text-dark-text-light mb-4"></i>
                  <h3 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-2">データがありません</h3>
                  <p className="text-qiita-text dark:text-dark-text">この期間のランキングデータはまだ収集されていません。</p>
                </div>
              )}
            </div>
            
            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-3 md:p-6 shadow-sm border border-qiita-border dark:border-dark-border">
                <div className="flex flex-col gap-4">
                  {/* ページネーションボタン */}
                  <div className="flex items-center justify-center gap-1 md:gap-2 flex-wrap">
                    {/* 最初のページへ */}
                    <button
                      onClick={() => {
                        setCurrentPage(1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === 1}
                      className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium transition-all duration-150 ${
                        currentPage === 1
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 hover:text-qiita-green dark:hover:text-dark-green'
                      }`}
                      title="最初のページ"
                    >
                      <i className="ri-skip-back-mini-line text-base md:text-lg"></i>
                    </button>
                    
                    {/* 前のページへ */}
                    <button
                      onClick={handlePrevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-0.5 md:gap-1 px-2 md:px-4 h-8 md:h-10 rounded-lg font-medium text-sm md:text-base transition-all duration-150 ${
                        currentPage === 1
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 hover:text-qiita-green dark:hover:text-dark-green'
                      }`}
                    >
                      <i className="ri-arrow-left-s-line text-base md:text-lg"></i>
                      <span className="hidden sm:inline">前へ</span>
                    </button>
                    
                    {/* ページ番号リスト */}
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
                            className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium text-xs md:text-base transition-all duration-150 ${
                              currentPage === page
                                ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                                : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 hover:text-qiita-green dark:hover:text-dark-green'
                            }`}
                          >
                            {page}
                          </button>
                        ) : (
                          <span key={index} className="flex items-center justify-center w-6 md:w-10 h-8 md:h-10 text-qiita-text-light dark:text-dark-text-light text-xs md:text-base">
                            {page}
                          </span>
                        )
                      ));
                    })()}
                    
                    {/* 次のページへ */}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center gap-0.5 md:gap-1 px-2 md:px-4 h-8 md:h-10 rounded-lg font-medium text-sm md:text-base transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 hover:text-qiita-green dark:hover:text-dark-green'
                      }`}
                    >
                      <span className="hidden sm:inline">次へ</span>
                      <i className="ri-arrow-right-s-line text-base md:text-lg"></i>
                    </button>
                    
                    {/* 最後のページへ */}
                    <button
                      onClick={() => {
                        setCurrentPage(totalPages);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      disabled={currentPage === totalPages}
                      className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg font-medium transition-all duration-150 ${
                        currentPage === totalPages
                          ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 hover:text-qiita-green dark:hover:text-dark-green'
                      }`}
                      title="最後のページ"
                    >
                      <i className="ri-skip-forward-mini-line text-base md:text-lg"></i>
                    </button>
                  </div>
                  
                  {/* ページ直接入力 */}
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

