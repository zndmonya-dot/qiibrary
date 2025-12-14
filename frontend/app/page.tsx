'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BookCard from '@/components/BookCard';
import HeroSection from '@/components/HeroSection';
import { AdSenseDisplay, AdSenseInFeed } from '@/components/AdSense';
import { getRankings, getAvailableYears, RankingResponse } from '@/lib/api';
import { analytics } from '@/lib/analytics';
import { ITEMS_PER_PAGE, SEARCH } from '@/lib/constants';
import { ensureCanonicalUrl, generateRankingStructuredData, generateWebSiteStructuredData } from '@/lib/seo';
import { getErrorMessage, logError } from '@/lib/error-handler';
import { PeriodType } from '@/types/common';

let scrollPositionCache = new Map<string, number>();
let availableYearsCache: number[] | null = null;

const getPeriodLabel = (p: PeriodType, year: number | null) => {
  if (p === 'daily') return 'DAILY RANKING';
  if (p === 'monthly') return 'MONTHLY RANKING';
  if (p === 'yearly') return 'YEARLY RANKING';
  if (p === 'year' && year) return `${year} RANKING`;
  return 'ALL TIME RANKING';
};

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // canonical は常にトップ（クエリで重複URLを作らない）
  useEffect(() => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiibrary.com';
    ensureCanonicalUrl(`${siteUrl}/`);
  }, []);
  
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
      if (availableYearsCache) {
        setAvailableYears(availableYearsCache);
        return;
      }
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
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
        const options = {
          limit: ITEMS_PER_PAGE,
          offset: (currentPage - 1) * ITEMS_PER_PAGE,
          search: searchQuery || undefined,
        };
        const data = period === 'daily' ? await getRankings.daily(options)
          : period === 'monthly' ? await getRankings.monthly(options)
          : period === 'yearly' ? await getRankings.yearly(options)
          : period === 'year' && selectedYear ? await getRankings.byYear(selectedYear, options)
          : await getRankings.all(options);
        setRankings(data);
        setError(null);
      } catch (err: any) {
        logError(err, 'ランキング取得');
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    const timeoutId = setTimeout(() => {
      fetchRankings();
    }, searchQuery ? SEARCH.DEBOUNCE_DELAY : 0);
    return () => clearTimeout(timeoutId);
  }, [period, selectedYear, searchQuery, currentPage]);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    const cacheKey = period === 'year' ? `${period}-${selectedYear}` : period;
    const saveScroll = () => {
      scrollPositionCache.set(cacheKey, window.scrollY);
    };
    window.addEventListener('scroll', saveScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', saveScroll);
      saveScroll();
    };
  }, [period, selectedYear]);

  useEffect(() => {
    if (!rankings) return;
    const cacheKey = period === 'year' ? `${period}-${selectedYear}` : period;
    const savedPosition = scrollPositionCache.get(cacheKey) || 0;
    if (savedPosition > 0) {
      window.scrollTo(0, savedPosition);
    }
  }, [period, selectedYear, rankings]);

  const paginatedRankings = useMemo(() => {
    if (!rankings) return [];
    return rankings.rankings;
  }, [rankings]);

  const totalPages = useMemo(() => {
    if (!rankings || !rankings.total) return 0;
    return Math.ceil(rankings.total / ITEMS_PER_PAGE);
  }, [rankings]);
  
  const scrollToResults = useCallback(() => {
    const headerHeight = 80;
    const filterHeight = 300;
    const scrollTarget = headerHeight + filterHeight;
    window.scrollTo({ 
      top: scrollTarget, 
      behavior: 'smooth' 
    });
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      setCurrentPage(newPage);
      updateURL({ page: newPage });
      scrollToResults();
    }
  }, [currentPage, totalPages, updateURL, scrollToResults]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      setCurrentPage(newPage);
      updateURL({ page: newPage });
      scrollToResults();
    }
  }, [currentPage, updateURL, scrollToResults]);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateWebSiteStructuredData()),
        }}
      />

      {!error && rankings && paginatedRankings.length > 0 && (
        <Script
          id="structured-data-ranking"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              generateRankingStructuredData(
                paginatedRankings.slice(0, 50).map((item) => ({
                  book: item.book,
                  rank: item.rank,
                }))
              )
            ),
          }}
        />
      )}
      
      {/* Scanline Effect */}
      <div className="crt-flicker"></div>
      
      <Header />
      <HeroSection />
      
      <main className="container mx-auto px-4 py-12 relative z-10" id="rankings">
        <div className="max-w-3xl mx-auto">
          {/* Search Bar - Retro Style */}
          <div className="mb-8 p-4 border-2 border-green-500 bg-black shadow-[4px_4px_0_#39ff14]">
          <div className="relative flex items-center">
            <i className="ri-search-line absolute left-4 text-green-500 text-xl animate-pulse"></i>
            <input
              type="text"
              placeholder="SEARCH DATABASE..."
              value={searchQuery}
              onChange={(e) => {
                const query = e.target.value;
                setSearchQuery(query);
                setCurrentPage(1);
                updateURL({ search: query, page: 1 });
                if (query) analytics.search(query, rankings?.total || 0);
              }}
              className="w-full pl-12 pr-12 py-3 text-lg bg-gray-900 text-green-400 border border-green-800 focus:outline-none focus:border-green-400 font-pixel"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(1);
                  updateURL({ search: '', page: 1 });
                }}
                className="absolute right-4 text-green-500 hover:text-red-400 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            )}
          </div>
        </div>
        
        {/* Filter Controls - Retro Style */}
        <div className="mb-8 p-4 border border-gray-800 bg-black">
          <div className="flex flex-wrap gap-2 mb-4">
            {['daily', 'monthly', 'yearly', 'all'].map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p as PeriodType);
                  setSelectedYear(null);
                  setCurrentPage(1);
                  updateURL({ period: p, year: null, page: 1 });
                  analytics.changeRankingPeriod(p);
                }}
                className={`px-4 py-2 text-xs font-pixel uppercase transition-all ${
                  period === p
                    ? 'bg-green-600 text-black shadow-[2px_2px_0_#fff]'
                    : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-green-400 hover:border-green-400'
                }`}
              >
                {getPeriodLabel(p as PeriodType, null)}
              </button>
            ))}
          </div>
          
          <div className="h-px bg-gray-800 my-4"></div>
          
          <div className="flex flex-wrap gap-2">
            {recentYears.map(year => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year);
                  setPeriod('year');
                  setCurrentPage(1);
                  updateURL({ period: 'year', year: year, page: 1 });
                }}
                className={`px-3 py-1 text-xs font-pixel transition-all ${
                  period === 'year' && selectedYear === year
                    ? 'bg-yellow-500 text-black shadow-[2px_2px_0_#fff]'
                    : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-yellow-400 hover:border-yellow-400'
                }`}
              >
                {year}
              </button>
            ))}
             {olderYears.length > 0 && (
              <button
                onClick={() => setShowAllYears(!showAllYears)}
                className="px-3 py-1 text-xs font-pixel bg-gray-900 text-gray-400 border border-gray-700 hover:text-white"
              >
                {showAllYears ? '[-] HIDE' : `[+] MORE`}
              </button>
            )}
          </div>
          
          {showAllYears && olderYears.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-800 animate-fade-in-down">
              {olderYears.map(year => (
                <button
                  key={year}
                  onClick={() => {
                    setSelectedYear(year);
                    setPeriod('year');
                    setCurrentPage(1);
                    updateURL({ period: 'year', year: year, page: 1 });
                  }}
                  className={`px-3 py-1 text-xs font-pixel transition-all ${
                    period === 'year' && selectedYear === year
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-900 text-gray-400 border border-gray-700 hover:text-yellow-400 hover:border-yellow-400'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Ad: Top Banner */}
        <AdSenseDisplay adSlot="8708082843" />
        
        {error && (
          <div className="bg-red-900/20 border-2 border-red-500 p-6 text-center animate-pulse">
            <i className="ri-error-warning-fill text-4xl text-red-500 mb-4 block"></i>
            <h3 className="font-pixel text-red-400 text-xl mb-2">SYSTEM ERROR</h3>
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-600 text-white font-pixel text-xs border-2 border-red-400 shadow-[2px_2px_0_#7f1d1d] hover:bg-red-500 hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              ▶ RETRY CONNECTION
            </button>
          </div>
        )}

        {!error && rankings && (
          <div>
            <div className="flex items-center justify-between mb-6 border-b border-green-900/50 pb-2">
              <h2 className="text-xl font-pixel text-green-500 flex items-center">
                <i className="ri-database-2-line mr-2"></i>
                RESULTS: {getPeriodLabel(period, selectedYear)}
              </h2>
              <span className="font-mono text-gray-500 text-xs">
                {rankings.total} RECORDS FOUND
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-6 mb-12">
              {paginatedRankings.length > 0 ? (
                paginatedRankings.map((item, index) => (
                  <React.Fragment key={`${currentPage}-${item.book.id}`}>
                    <BookCard
                      rank={item.rank}
                      book={item.book}
                      stats={item.stats}
                      topArticles={item.top_articles}
                    />
                    {/* Insert ad after 10th item */}
                    {index === 9 && paginatedRankings.length > 10 && (
                      <AdSenseInFeed adSlot="1136714581" layoutKey="-f1+5d+7q-d8-2t" />
                    )}
                    {/* Insert ad after 20th item */}
                    {index === 19 && paginatedRankings.length > 20 && (
                      <AdSenseInFeed adSlot="3741152038" layoutKey="-f1+5g+7i-dn-1i" />
                    )}
                  </React.Fragment>
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-gray-800">
                  <p className="font-pixel text-gray-500">NO DATA FOUND IN SECTOR.</p>
                </div>
              )}
            </div>
            
            {/* Pagination - Retro Style */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center space-x-2">
                   <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 font-pixel text-xs border-2 border-green-500 transition-all ${
                      currentPage === 1 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'shadow-[2px_2px_0_#166534] hover:bg-green-500 hover:text-black hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                  >
                    ◀ PREV
                  </button>
                  
                  <span className="font-pixel text-sm mx-4 text-green-400 bg-gray-900 px-4 py-2 border border-gray-700">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 font-pixel text-xs border-2 border-green-500 transition-all ${
                      currentPage === totalPages 
                        ? 'opacity-30 cursor-not-allowed' 
                        : 'shadow-[2px_2px_0_#166534] hover:bg-green-500 hover:text-black hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                    }`}
                  >
                    NEXT ▶
                  </button>
                </div>
              </div>
            )}
            
            {/* Ad: Bottom Banner */}
            <AdSenseDisplay adSlot="2683221235" />
          </div>
        )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
