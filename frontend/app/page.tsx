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
  const [period, setPeriod] = useState<PeriodType>('yearly');
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [rankings, setRankings] = useState<RankingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // 期間選択オプションを生成（年のみ）
  const generatePeriodOptions = () => {
    const options: { label: string; value: string; year?: number }[] = [];
    
    availableYears.forEach(year => {
      // 年のオプション
      options.push({ label: `${year}年`, value: `year-${year}`, year });
    });
    
    return options;
  };

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
      setCurrentPage(1); // 期間変更時はページをリセット
      
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
    if (period === 'daily') return '24時間のランキング';
    if (period === 'monthly') return '30日間のランキング';
    return '365日間のランキング';
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8 bg-qiita-card dark:bg-dark-surface rounded-xl p-8 border-l-4 border-qiita-green dark:border-dark-green shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-bold mb-3 flex items-center gap-3 text-qiita-text-dark dark:text-white">
                <i className="ri-fire-line text-qiita-green dark:text-dark-green text-4xl"></i>
                IT技術書ランキング
              </h2>
              <p className="text-qiita-text dark:text-dark-text font-medium text-lg leading-relaxed">
                Qiita記事で言及されたIT技術書をランキング形式で表示
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm text-qiita-text dark:text-dark-text">
                <i className="ri-information-line text-qiita-green dark:text-dark-green"></i>
                <span>毎日自動更新 • 実際の開発者が選んだ技術書</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* 検索バー */}
        <div className="mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-4">
          <div className="relative">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-qiita-text dark:text-dark-text text-xl"></i>
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
              className="w-full pl-12 pr-4 py-3 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg border border-qiita-border dark:border-dark-border focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green focus:border-transparent font-medium transition-all duration-150"
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
        <div className="relative mb-6 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-4">
          <div className="flex flex-wrap gap-2">
            {/* 期間タブ */}
            <button
              onClick={() => {
                setPeriod('daily');
                analytics.changeRankingPeriod('daily');
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 ${
                period === 'daily' 
                  ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm' 
                  : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
              }`}
            >
              <i className="ri-time-line mr-1"></i>
              24時間
            </button>
            <button
              onClick={() => {
                setPeriod('monthly');
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
            
            {/* 年別ドロップダウン */}
            {availableYears.length > 0 && (
              <select
                value={period === 'year' && selectedYear ? `year-${selectedYear}` : ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value.startsWith('year-')) {
                    const year = parseInt(value.replace('year-', ''));
                    setSelectedYear(year);
                    setPeriod('year');
                    analytics.changeRankingPeriod(`year-${year}`);
                  }
                }}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-150 border ${
                  period === 'year'
                    ? 'bg-qiita-green dark:bg-dark-green text-white border-qiita-green dark:border-dark-green shadow-sm'
                    : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text border-qiita-border dark:border-dark-border hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20'
                }`}
              >
                <option value="">年別ランキング</option>
                {generatePeriodOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
          </div>
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
              {paginatedRankings.length > 0 ? (
                paginatedRankings.map((item, index) => (
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
                ))
              ) : (
                <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-12 text-center border border-qiita-border dark:border-dark-border shadow-sm">
                  <i className="ri-inbox-line text-6xl text-qiita-text-light dark:text-dark-text-light mb-4"></i>
                  <h3 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-2">データがありません</h3>
                  <p className="text-qiita-text dark:text-dark-text">この期間のランキングデータはまだ収集されていません。</p>
                </div>
              )}
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

