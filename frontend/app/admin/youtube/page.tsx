'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string | null;
  thumbnail_url: string | null;
}

interface YouTubeLink {
  id: number;
  youtube_url: string;
  youtube_video_id: string | null;
  title: string | null;
  thumbnail_url: string | null;
  display_order: number;
}

interface BookDetail extends Book {
  youtube_links: YouTubeLink[];
}

interface RankingItem {
  rank: number;
  book: Book;
  stats: {
    article_count: number;
    total_likes: number;
  };
}

interface YouTubeSearchResult {
  video_id: string;
  title: string;
  channel_name: string;
  description: string;
  thumbnail_url: string;
  youtube_url: string;
}

type RankingMode = 'period' | 'year';
type RankingPeriod = '24h' | '30d' | '365d';

export default function YouTubeAdminPage() {
  const [mode, setMode] = useState<RankingMode>('period');
  const [period, setPeriod] = useState<RankingPeriod>('365d');
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 新規追加用
  const [newYouTubeUrl, setNewYouTubeUrl] = useState('');
  
  // YouTube検索用
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<YouTubeSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  // 一括登録用
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [batchRegistering, setBatchRegistering] = useState(false);

  // 利用可能な年を取得
  useEffect(() => {
    const loadYears = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/rankings/years`);
        setAvailableYears(response.data.years || []);
      } catch (err) {
        console.error('年次データ取得エラー:', err);
      }
    };
    loadYears();
  }, []);

  // ランキング取得
  useEffect(() => {
    loadRankings();
  }, [mode, period, selectedYear]);

  const loadRankings = async () => {
    setLoading(true);
    setError('');

    try {
      let url = `${API_URL}/api/rankings/?limit=10`;
      
      if (mode === 'period') {
        const days = period === '24h' ? 1 : period === '30d' ? 30 : 365;
        url += `&days=${days}`;
      } else {
        url += `&year=${selectedYear}`;
      }
      
      const response = await axios.get(url);
      setRankings(response.data.rankings || []);
    } catch (err: any) {
      setError('ランキングの取得に失敗しました');
      setRankings([]);
    } finally {
      setLoading(false);
    }
  };

  // 書籍を選択
  const selectBook = async (book: Book) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/books/${book.isbn}`);
      const data = response.data;
      
      setBookDetail({
        id: data.book.id,
        isbn: data.book.isbn,
        title: data.book.title,
        author: data.book.author,
        thumbnail_url: data.book.thumbnail_url,
        youtube_links: data.youtube_links || [],
      });
    } catch (err: any) {
      setError('書籍の詳細取得に失敗しました');
      setBookDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // 書籍を再読み込み
  const reloadBook = async () => {
    if (!bookDetail) return;
    try {
      const response = await axios.get(`${API_URL}/api/books/${bookDetail.isbn}`);
      const data = response.data;
      setBookDetail({
        ...bookDetail,
        youtube_links: data.youtube_links || [],
      });
    } catch (err) {
      console.error('再読み込み失敗:', err);
    }
  };

  // YouTube検索
  const handleSearchYouTube = async () => {
    if (!bookDetail || !searchQuery.trim()) return;

    setSearching(true);
    setError('');

    try {
      const response = await axios.get(`${API_URL}/api/youtube/search`, {
        params: {
          q: searchQuery.trim(),
          max_results: 10,
        },
      });

      setSearchResults(response.data.videos || []);
    } catch (err: any) {
      if (err.response?.status === 503) {
        setError('YouTube APIキーが設定されていません。管理者に連絡してください。');
      } else if (err.response?.status === 403) {
        setError('YouTube APIのクォータ制限に達しました。明日再度お試しください。');
      } else {
        setError(err.response?.data?.detail || 'YouTube検索に失敗しました');
      }
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // 検索結果から動画を選択（単体登録用）
  const handleSelectVideo = (video: YouTubeSearchResult) => {
    setNewYouTubeUrl(video.youtube_url);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  // 検索結果から動画を選択（一括登録用）
  const handleToggleVideoSelection = (videoUrl: string) => {
    const newSelection = new Set(selectedVideos);
    if (newSelection.has(videoUrl)) {
      newSelection.delete(videoUrl);
    } else {
      newSelection.add(videoUrl);
    }
    setSelectedVideos(newSelection);
  };
  
  // 選択した動画を一括登録
  const handleBatchRegister = async () => {
    if (!bookDetail || selectedVideos.size === 0) return;
    
    setBatchRegistering(true);
    setError('');
    
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/books/${bookDetail.id}/youtube/batch`,
        {
          youtube_urls: Array.from(selectedVideos),
        }
      );
      
      alert(`✅ ${response.data.added}件の動画を登録しました！${response.data.failed > 0 ? `\n❌ ${response.data.failed}件の登録に失敗しました。` : ''}`);
      
      // 選択をクリア
      setSelectedVideos(new Set());
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
      
      // 書籍詳細を再読み込み
      await reloadBook();
    } catch (err: any) {
      setError(err.response?.data?.detail || '一括登録に失敗しました');
    } finally {
      setBatchRegistering(false);
    }
  };

  // YouTube動画を追加
  const handleAddYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDetail || !newYouTubeUrl.trim()) return;

    setLoading(true);
    setError('');

    try {
      const nextOrder = bookDetail.youtube_links.length + 1;
      await axios.post(
        `${API_URL}/api/admin/books/${bookDetail.id}/youtube`,
        {
          youtube_url: newYouTubeUrl.trim(),
          display_order: nextOrder,
        }
      );

      setNewYouTubeUrl('');
      await reloadBook();
    } catch (err: any) {
      setError(err.response?.data?.detail || '追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // YouTube動画を削除
  const handleDeleteYouTube = async (linkId: number) => {
    if (!confirm('削除しますか？')) return;

    setLoading(true);
    setError('');

    try {
      await axios.delete(`${API_URL}/api/admin/youtube/${linkId}`);
      await reloadBook();
    } catch (err: any) {
      setError(err.response?.data?.detail || '削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 表示順序を更新
  const handleUpdateOrder = async (linkId: number, newOrder: number) => {
    setLoading(true);
    setError('');

    try {
      await axios.put(
        `${API_URL}/api/admin/youtube/${linkId}`,
        { display_order: newOrder }
      );
      await reloadBook();
    } catch (err: any) {
      setError(err.response?.data?.detail || '更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-3 md:px-4 py-3 md:py-8 min-h-[calc(100vh-120px)]">
        {/* ヘッダー */}
        <div className="mb-3 md:mb-8 bg-qiita-card dark:bg-dark-surface rounded-xl p-3 md:p-8 border-l-4 border-qiita-green dark:border-dark-green shadow-sm">
          <h2 className="text-lg md:text-3xl font-bold mb-1.5 md:mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
            <i className="ri-youtube-line text-xl md:text-3xl text-red-500"></i>
            YouTube動画管理
          </h2>
          <p className="text-qiita-text dark:text-dark-text font-medium text-xs md:text-base">
            人気書籍にYouTube動画を追加して、より詳しい情報を提供しましょう
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-3 md:gap-6">
          {/* 左側：ランキング (3/5) */}
          <div className="lg:col-span-3">
            {/* モード切り替え */}
            <div className="mb-3 md:mb-4 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('period')}
                  className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-base rounded-lg font-semibold transition-all ${
                    mode === 'period'
                      ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                  }`}
                >
                  <i className="ri-time-line mr-1"></i>期間別
                </button>
                <button
                  onClick={() => setMode('year')}
                  className={`flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-base rounded-lg font-semibold transition-all ${
                    mode === 'year'
                      ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                      : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                  }`}
                >
                  <i className="ri-calendar-line mr-1"></i>年次別
                </button>
              </div>
            </div>

            {/* 期間選択 / 年次選択 */}
            {mode === 'period' ? (
              <div className="mb-3 md:mb-4 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-2">
                <div className="grid grid-cols-3 gap-2">
                  {(['24h', '30d', '365d'] as RankingPeriod[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriod(p)}
                      className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-base rounded-lg font-semibold transition-all ${
                        period === p
                          ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                      }`}
                    >
                      {p === '24h' ? '24時間' : p === '30d' ? '30日間' : '365日間'}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-3 md:mb-4 bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-2">
                <div className="grid grid-cols-4 gap-2">
                  {availableYears.slice(0, 8).map((year) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-2 md:px-3 py-2 md:py-2.5 text-xs md:text-base rounded-lg font-semibold transition-all ${
                        selectedYear === year
                          ? 'bg-qiita-green dark:bg-dark-green text-white shadow-sm'
                          : 'bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-dark-text hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ランキングリスト */}
            <div className="bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-base md:text-xl font-bold text-qiita-text-dark dark:text-white flex items-center gap-2">
                  <i className="ri-trophy-line text-qiita-green dark:text-dark-green"></i>
                  TOP 10
                </h3>
                {loading && !bookDetail && (
                  <div className="animate-spin h-5 w-5 border-2 border-qiita-green dark:border-dark-green border-t-transparent rounded-full"></div>
                )}
              </div>
              
              {rankings.length === 0 && !loading ? (
                <p className="text-center py-8 text-qiita-text dark:text-dark-text text-sm md:text-base">
                  データがありません
                </p>
              ) : (
                <div className="space-y-2 md:space-y-3">
                  {rankings.map((item) => (
                    <button
                      key={item.book.id}
                      onClick={() => selectBook(item.book)}
                      className={`w-full text-left p-3 md:p-4 rounded-lg border transition-all ${
                        bookDetail?.id === item.book.id
                          ? 'border-qiita-green dark:border-dark-green bg-qiita-green/5 dark:bg-dark-green/10 shadow-sm'
                          : 'border-qiita-border dark:border-dark-border hover:border-qiita-green/50 dark:hover:border-dark-green/50 hover:bg-qiita-surface dark:hover:bg-dark-surface-light'
                      }`}
                    >
                      <div className="flex gap-2 md:gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm ${
                          item.rank === 1 ? 'bg-yellow-500 text-white' :
                          item.rank === 2 ? 'bg-gray-400 text-white' :
                          item.rank === 3 ? 'bg-orange-500 text-white' :
                          'bg-qiita-green dark:bg-dark-green text-white'
                        }`}>
                          {item.rank}
                        </div>
                        {item.book.thumbnail_url && (
                          <img
                            src={item.book.thumbnail_url}
                            alt=""
                            className="w-12 md:w-14 h-auto rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs md:text-sm text-qiita-text-dark dark:text-white line-clamp-2 mb-1">
                            {item.book.title}
                          </h4>
                          <div className="flex gap-2 md:gap-3 text-xs text-qiita-text dark:text-dark-text">
                            <span className="flex items-center gap-1">
                              <i className="ri-article-line"></i>
                              {item.stats.article_count}
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-heart-line"></i>
                              {item.stats.total_likes}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側：YouTube管理 (2/5) */}
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-3 md:px-4 py-2 md:py-3 rounded-lg mb-3 md:mb-4 text-xs md:text-sm">
                {error}
              </div>
            )}

            {bookDetail ? (
              <>
                {/* 書籍情報 */}
                <div className="bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-6 mb-3 md:mb-4">
                  <div className="flex gap-3 md:gap-4 items-start mb-4 md:mb-5">
                    {bookDetail.thumbnail_url && (
                      <img
                        src={bookDetail.thumbnail_url}
                        alt={bookDetail.title}
                        className="w-20 md:w-24 h-auto rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm md:text-lg font-bold text-qiita-text-dark dark:text-white mb-1 md:mb-2 line-clamp-3">
                        {bookDetail.title}
                      </h3>
                      {bookDetail.author && (
                        <p className="text-xs md:text-sm text-qiita-text dark:text-dark-text">
                          {bookDetail.author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* YouTube検索ボタン */}
                  <button
                    onClick={() => {
                      setShowSearch(true);
                      setSearchQuery(bookDetail.title);
                    }}
                    className="w-full px-3 md:px-4 py-2 md:py-2.5 mb-3 bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-xs md:text-sm rounded-lg hover:bg-red-500/20 dark:hover:bg-red-500/30 font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    <i className="ri-search-line"></i>
                    YouTubeで検索
                  </button>

                  {/* 追加フォーム */}
                  <form onSubmit={handleAddYouTube}>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newYouTubeUrl}
                        onChange={(e) => setNewYouTubeUrl(e.target.value)}
                        placeholder="YouTube URL（または上の検索で選択）"
                        className="flex-1 px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-base rounded-lg border border-qiita-border dark:border-dark-border bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-qiita-green/50 dark:focus:ring-dark-green/50"
                      />
                      <button
                        type="submit"
                        disabled={loading || !newYouTubeUrl.trim()}
                        className="px-3 md:px-5 py-2 md:py-2.5 bg-qiita-green dark:bg-dark-green text-white text-xs md:text-base rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold transition-all"
                      >
                        追加
                      </button>
                    </div>
                  </form>
                </div>

                {/* 動画リスト */}
                <div className="bg-qiita-card dark:bg-dark-surface rounded-lg border border-qiita-border dark:border-dark-border p-3 md:p-6">
                  <h3 className="text-base md:text-lg font-bold text-qiita-text-dark dark:text-white mb-3 md:mb-4 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <i className="ri-play-list-line"></i>
                      登録済み動画
                    </span>
                    <span className="text-xs md:text-sm font-normal bg-qiita-green/10 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green px-2 md:px-3 py-1 rounded-full">
                      {bookDetail.youtube_links.length}件
                    </span>
                  </h3>
                  
                  {bookDetail.youtube_links.length === 0 ? (
                    <div className="text-center py-8 md:py-12">
                      <i className="ri-video-off-line text-3xl md:text-4xl text-qiita-text dark:text-dark-text mb-2 md:mb-3 block"></i>
                      <p className="text-qiita-text dark:text-dark-text text-xs md:text-sm">
                        動画がまだ登録されていません
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2 md:space-y-3 max-h-[500px] md:max-h-[600px] overflow-y-auto">
                      {bookDetail.youtube_links
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((link) => (
                          <div
                            key={link.id}
                            className="border border-qiita-border dark:border-dark-border rounded-lg p-2 md:p-3 bg-qiita-surface dark:bg-dark-surface-light"
                          >
                            <div className="flex gap-2 items-start mb-2 md:mb-3">
                              {link.thumbnail_url && (
                                <img
                                  src={link.thumbnail_url}
                                  alt=""
                                  className="w-24 md:w-28 h-auto rounded"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <a
                                  href={link.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-qiita-green dark:text-dark-green hover:underline block truncate"
                                >
                                  {link.youtube_url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-qiita-text dark:text-dark-text">
                                順序:
                              </span>
                              <input
                                type="number"
                                value={link.display_order}
                                onChange={(e) =>
                                  handleUpdateOrder(link.id, Number(e.target.value))
                                }
                                min="1"
                                className="w-14 md:w-16 px-2 py-1 text-xs text-center rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-qiita-green/50 dark:focus:ring-dark-green/50"
                              />
                              <button
                                onClick={() => handleDeleteYouTube(link.id)}
                                disabled={loading}
                                className="ml-auto px-2 md:px-3 py-1 md:py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded disabled:opacity-50 transition-all"
                              >
                                削除
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-qiita-card dark:bg-dark-surface rounded-lg border-2 border-dashed border-qiita-border dark:border-dark-border p-8 md:p-12 text-center">
                <i className="ri-hand-coin-line text-4xl md:text-6xl text-qiita-text dark:text-dark-text mb-3 md:mb-4 block"></i>
                <p className="text-qiita-text dark:text-dark-text text-sm md:text-lg">
                  左のランキングから書籍を選択してください
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* YouTube検索モーダル */}
      {showSearch && bookDetail && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowSearch(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-qiita-card dark:bg-dark-surface rounded-lg shadow-2xl max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className="p-4 md:p-6 border-b border-qiita-border dark:border-dark-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white">
                  YouTube動画を検索
                </h3>
                <button
                  onClick={() => setShowSearch(false)}
                  className="w-8 h-8 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text dark:text-dark-text rounded-full flex items-center justify-center hover:bg-qiita-border dark:hover:bg-dark-border transition-colors"
                  aria-label="閉じる"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              
              {/* 検索フォーム */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchYouTube();
                    }
                  }}
                  placeholder={`「${bookDetail.title}」で検索`}
                  className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-qiita-border dark:border-dark-border bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-qiita-green/50 dark:focus:ring-dark-green/50"
                  autoFocus
                />
                <button
                  onClick={handleSearchYouTube}
                  disabled={searching || !searchQuery.trim()}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 font-semibold transition-all flex items-center gap-2"
                >
                  {searching ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      検索中...
                    </>
                  ) : (
                    <>
                      <i className="ri-search-line"></i>
                      検索
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* 検索結果 */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {searchResults.length === 0 && !searching ? (
                <div className="text-center py-12">
                  <i className="ri-search-line text-4xl text-qiita-text dark:text-dark-text mb-3 block"></i>
                  <p className="text-qiita-text dark:text-dark-text">
                    検索して動画を探しましょう
                  </p>
                </div>
              ) : (
                <>
                  {/* 一括選択ヘッダー */}
                  {searchResults.length > 0 && (
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-qiita-border dark:border-dark-border">
                      <div className="text-sm text-qiita-text dark:text-dark-text">
                        {selectedVideos.size > 0 ? (
                          <span className="font-bold text-qiita-green dark:text-dark-green">
                            {selectedVideos.size}件選択中
                          </span>
                        ) : (
                          <span>動画をクリックして選択</span>
                        )}
                      </div>
                      <button
                        onClick={handleBatchRegister}
                        disabled={selectedVideos.size === 0 || batchRegistering}
                        className="px-4 py-2 bg-qiita-green hover:bg-qiita-green-dark dark:bg-dark-green dark:hover:bg-dark-green-dark text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all flex items-center gap-2"
                      >
                        {batchRegistering ? (
                          <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                            登録中...
                          </>
                        ) : (
                          <>
                            <i className="ri-check-double-line"></i>
                            選択した動画を登録
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {/* 検索結果リスト */}
                  <div className="space-y-3">
                    {searchResults.map((video) => {
                      const isSelected = selectedVideos.has(video.youtube_url);
                      return (
                        <div
                          key={video.video_id}
                          onClick={() => handleToggleVideoSelection(video.youtube_url)}
                          className={`cursor-pointer p-3 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-qiita-green dark:border-dark-green bg-qiita-green/5 dark:bg-dark-green/10'
                              : 'border-qiita-border dark:border-dark-border hover:border-qiita-green/50 dark:hover:border-dark-green/50 hover:bg-qiita-surface dark:hover:bg-dark-surface-light'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* 選択チェックボックス */}
                            <div className="flex-shrink-0 flex items-start pt-1">
                              <div
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                  isSelected
                                    ? 'bg-qiita-green dark:bg-dark-green border-qiita-green dark:border-dark-green'
                                    : 'border-qiita-border dark:border-dark-border'
                                }`}
                              >
                                {isSelected && (
                                  <i className="ri-check-line text-white text-sm"></i>
                                )}
                              </div>
                            </div>
                            
                            {/* サムネイル */}
                            <img
                              src={video.thumbnail_url}
                              alt={video.title}
                              className="w-32 h-auto rounded flex-shrink-0"
                            />
                            
                            {/* 動画情報 */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-qiita-text-dark dark:text-white mb-1.5 line-clamp-2">
                                {video.title}
                              </h4>
                              <div className="flex items-center gap-1 mb-2 text-xs text-qiita-text dark:text-dark-text">
                                <i className="ri-youtube-line text-red-500"></i>
                                <span className="truncate">{video.channel_name}</span>
                              </div>
                              <p className="text-xs text-qiita-text dark:text-dark-text line-clamp-2">
                                {video.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
