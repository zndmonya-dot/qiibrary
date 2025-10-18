'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import { getRankings, RankingResponse } from '@/lib/api';
import { analytics, trackPageView } from '@/lib/analytics';

type PeriodType = 'daily' | 'monthly' | 'yearly';

export default function Home() {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true);
      setError(null);
      setCurrentPage(1); // 期間変更時はページをリセット
      
      try {
        let data: RankingResponse;
        
        if (period === 'daily') {
          data = await getRankings.daily();
        } else if (period === 'monthly') {
          data = await getRankings.monthly(currentYear, currentMonth);
        } else {
          data = await getRankings.yearly(currentYear);
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
  }, [period, currentYear, currentMonth]);

  // ページネーション用の計算
  const paginatedRankings = rankings ? rankings.rankings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ) : [];
  
  const totalPages = rankings ? Math.ceil(rankings.rankings.length / ITEMS_PER_PAGE) : 0;
  
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
    if (period === 'daily') return '今日のランキング';
    if (period === 'monthly') return '今月のランキング';
    return '今年のランキング';
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border-l-4 border-qiita-green shadow-sm">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 text-qiita-text-dark dark:text-white">
            <i className="ri-fire-line text-qiita-green dark:text-dark-green"></i>
            IT技術書ランキング
          </h2>
          <p className="text-qiita-text-dark dark:text-dark-text font-medium">
            Qiita記事で言及されたIT技術書をランキング形式で表示
          </p>
        </div>
        
        {/* タブ */}
        <div className="flex gap-2 mb-6 border-b border-qiita-border dark:border-dark-border bg-qiita-card dark:bg-dark-surface rounded-t-lg">
          <button
            onClick={() => {
              setPeriod('daily');
              analytics.changeRankingPeriod('daily');
            }}
            className={`tab-button ${
              period === 'daily' ? 'active' : ''
            }`}
          >
            <i className="ri-calendar-line mr-1"></i>
            今日
          </button>
          <button
            onClick={() => {
              setPeriod('monthly');
              analytics.changeRankingPeriod('monthly');
            }}
            className={`tab-button ${
              period === 'monthly' ? 'active' : ''
            }`}
          >
            <i className="ri-calendar-2-line mr-1"></i>
            今月
          </button>
          <button
            onClick={() => {
              setPeriod('yearly');
              analytics.changeRankingPeriod('yearly');
            }}
            className={`tab-button ${
              period === 'yearly' ? 'active' : ''
            }`}
          >
            <i className="ri-calendar-check-line mr-1"></i>
            今年
          </button>
        </div>
        
        {/* ランキング表示 */}
        {loading && !rankings && (
          <div className="flex flex-col justify-center items-center py-20 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-qiita-green dark:border-dark-green mb-4"></div>
            <p className="text-secondary text-sm animate-pulse">読み込み中...</p>
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
        
        {!error && rankings && (
          <div className="animate-fade-in">
            {/* タブ切り替え時のローディング表示 */}
            {loading && (
              <div className="mb-4 bg-qiita-card dark:bg-dark-surface rounded-lg p-3 border border-qiita-border dark:border-dark-border shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-qiita-green dark:border-dark-green"></div>
                  <span className="text-sm text-qiita-text dark:text-dark-text font-medium">読み込み中...</span>
                </div>
              </div>
            )}
            
            <div className="mb-6 flex items-center justify-between bg-qiita-card dark:bg-dark-surface p-4 rounded-lg shadow-sm border border-qiita-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                <i className="ri-trophy-line text-qiita-green dark:text-dark-green text-2xl"></i>
                <h2 className="text-lg font-semibold text-qiita-text-dark dark:text-white">
                  {getPeriodLabel()} TOP50
                </h2>
              </div>
              <div className="text-sm text-qiita-text dark:text-dark-text">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, rankings.rankings.length)} / {rankings.rankings.length}件
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              {paginatedRankings.map((item, index) => (
                <div
                  key={item.book.id}
                  style={{ 
                    animationDelay: index < 10 ? `${index * 0.02}s` : '0.2s'
                  }}
                  className={index < 20 ? "animate-fade-in" : ""}
                >
                  <BookCard
                    rank={item.rank}
                    book={item.book}
                    stats={item.stats}
                  />
                </div>
              ))}
            </div>
            
            {/* ページネーションボタン */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 py-8 bg-qiita-card dark:bg-dark-surface rounded-lg shadow-sm border border-qiita-border dark:border-dark-border">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-surface-2 dark:hover:bg-dark-border'
                  }`}
                >
                  <i className="ri-arrow-left-line"></i>
                  前へ
                </button>
                
                <div className="text-qiita-text-dark dark:text-white font-medium px-4">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-light dark:text-dark-text-light cursor-not-allowed opacity-50'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text hover:bg-qiita-surface-2 dark:hover:bg-dark-border'
                  }`}
                >
                  次へ
                  <i className="ri-arrow-right-line"></i>
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

