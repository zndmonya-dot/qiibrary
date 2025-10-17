'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import BookCard from '@/components/BookCard';
import { getRankings, RankingResponse } from '@/lib/api';
import { getLocale, t } from '@/lib/locale';

type PeriodType = 'daily' | 'monthly' | 'yearly';

export default function Home() {
  const [period, setPeriod] = useState<PeriodType>('daily');
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<'ja' | 'en'>('ja');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 25;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  useEffect(() => {
    setLocaleState(getLocale());
    
    // 言語変更イベントをリッスン
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);

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
        setError(locale === 'ja' ? 'ランキングの取得に失敗しました' : 'Failed to fetch rankings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRankings();
  }, [period, currentYear, currentMonth, locale]);

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
    if (period === 'daily') return t('todayRanking');
    if (period === 'monthly') return t('monthlyRanking');
    return t('yearlyRanking');
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 bg-gradient-to-r from-youtube-dark-surface/50 to-transparent rounded-lg p-6 border-l-4 border-youtube-red">
          <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <i className="ri-fire-line text-youtube-red"></i>
            {t('siteTitle')}
          </h2>
          <p className="text-secondary">
            {t('description')}
          </p>
        </div>
        
        {/* タブ */}
        <div className="flex gap-2 mb-6 border-b border-youtube-dark-surface">
          <button
            onClick={() => setPeriod('daily')}
            className={`tab-button ${
              period === 'daily'
                ? 'text-white active'
                : 'text-secondary hover:text-white'
            }`}
          >
            <i className="ri-calendar-line mr-1"></i>
            {t('today')}
          </button>
          <button
            onClick={() => setPeriod('monthly')}
            className={`tab-button ${
              period === 'monthly'
                ? 'text-white active'
                : 'text-secondary hover:text-white'
            }`}
          >
            <i className="ri-calendar-2-line mr-1"></i>
            {t('thisMonth')}
          </button>
          <button
            onClick={() => setPeriod('yearly')}
            className={`tab-button ${
              period === 'yearly'
                ? 'text-white active'
                : 'text-secondary hover:text-white'
            }`}
          >
            <i className="ri-calendar-check-line mr-1"></i>
            {t('thisYear')}
          </button>
        </div>
        
        {/* ランキング表示 */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-20 animate-fade-in">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-youtube-red mb-4"></div>
            <p className="text-secondary text-sm animate-pulse">読み込み中...</p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded animate-slide-down">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-xl"></i>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {!loading && !error && rankings && (
          <div className="animate-fade-in">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <i className="ri-trophy-line text-youtube-red text-2xl"></i>
                <h2 className="text-lg font-semibold text-white">
                  {getPeriodLabel()} {t('top50')}
                </h2>
              </div>
              <div className="text-sm text-secondary">
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
              <div className="flex items-center justify-center gap-4 py-8">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === 1
                      ? 'bg-youtube-dark-surface text-youtube-dark-text-secondary cursor-not-allowed opacity-50'
                      : 'bg-youtube-dark-surface text-white hover:bg-youtube-dark-hover'
                  }`}
                >
                  <i className="ri-arrow-left-line"></i>
                  {locale === 'ja' ? '前へ' : 'Previous'}
                </button>
                
                <div className="text-white font-medium px-4">
                  {currentPage} / {totalPages}
                </div>
                
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    currentPage === totalPages
                      ? 'bg-youtube-dark-surface text-youtube-dark-text-secondary cursor-not-allowed opacity-50'
                      : 'bg-youtube-dark-surface text-white hover:bg-youtube-dark-hover'
                  }`}
                >
                  {locale === 'ja' ? '次へ' : 'Next'}
                  <i className="ri-arrow-right-line"></i>
                </button>
              </div>
            )}
          </div>
        )}
      </main>
      
      {/* フッター */}
      <footer className="border-t border-youtube-dark-surface mt-20 py-8">
        <div className="container mx-auto px-4 text-center text-secondary text-sm">
          <p>&copy; 2025 BookTube. All rights reserved.</p>
          <p className="mt-2">
            {t('description')}
          </p>
        </div>
      </footer>
    </div>
  );
}

