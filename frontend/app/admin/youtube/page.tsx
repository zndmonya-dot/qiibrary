'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

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
    <div className="min-h-screen bg-gradient-to-br from-qiita-surface via-qiita-surface to-qiita-card dark:from-dark-surface dark:via-dark-surface dark:to-dark-card p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-qiita-text dark:text-dark-text mb-2 flex items-center gap-3">
            <i className="ri-youtube-line text-red-500"></i>
            YouTube動画管理
          </h1>
          <p className="text-qiita-text-light dark:text-dark-text-light">
            人気書籍にYouTube動画を追加して、より詳しい情報を提供しましょう
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* 左側：ランキング (3/5) */}
          <div className="lg:col-span-3">
            {/* モード切り替え */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode('period')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  mode === 'period'
                    ? 'bg-gradient-to-r from-qiita-green to-emerald-500 dark:from-dark-green dark:to-emerald-600 text-white shadow-lg shadow-qiita-green/30 dark:shadow-dark-green/30'
                    : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border hover:border-qiita-green dark:hover:border-dark-green'
                }`}
              >
                <i className="ri-time-line mr-2"></i>期間別
              </button>
              <button
                onClick={() => setMode('year')}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  mode === 'year'
                    ? 'bg-gradient-to-r from-qiita-green to-emerald-500 dark:from-dark-green dark:to-emerald-600 text-white shadow-lg shadow-qiita-green/30 dark:shadow-dark-green/30'
                    : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border hover:border-qiita-green dark:hover:border-dark-green'
                }`}
              >
                <i className="ri-calendar-line mr-2"></i>年次別
              </button>
            </div>

            {/* 期間選択 / 年次選択 */}
            {mode === 'period' ? (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(['24h', '30d', '365d'] as RankingPeriod[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      period === p
                        ? 'bg-qiita-green dark:bg-dark-green text-white shadow-md'
                        : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                    }`}
                  >
                    {p === '24h' ? '24時間' : p === '30d' ? '30日間' : '365日間'}
                  </button>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mb-4">
                {availableYears.slice(0, 8).map((year) => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                      selectedYear === year
                        ? 'bg-qiita-green dark:bg-dark-green text-white shadow-md'
                        : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border hover:bg-qiita-green/10 dark:hover:bg-dark-green/10'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}

            {/* ランキングリスト */}
            <div className="bg-qiita-card dark:bg-dark-card rounded-2xl shadow-xl border border-qiita-border dark:border-dark-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-qiita-text dark:text-dark-text flex items-center gap-2">
                  <i className="ri-trophy-line text-yellow-500"></i>
                  TOP 10 ランキング
                </h2>
                {loading && !bookDetail && (
                  <div className="animate-spin h-5 w-5 border-2 border-qiita-green dark:border-dark-green border-t-transparent rounded-full"></div>
                )}
              </div>
              
              {rankings.length === 0 && !loading ? (
                <p className="text-center py-12 text-qiita-text-light dark:text-dark-text-light">
                  データがありません
                </p>
              ) : (
                <div className="space-y-3">
                  {rankings.map((item) => (
                    <button
                      key={item.book.id}
                      onClick={() => selectBook(item.book)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                        bookDetail?.id === item.book.id
                          ? 'border-qiita-green dark:border-dark-green bg-gradient-to-r from-qiita-green/10 to-emerald-500/5 dark:from-dark-green/20 dark:to-emerald-600/10 shadow-lg'
                          : 'border-qiita-border dark:border-dark-border hover:border-qiita-green/50 dark:hover:border-dark-green/50 hover:shadow-md hover:bg-qiita-surface dark:hover:bg-dark-surface'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                          item.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          item.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          item.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gradient-to-br from-qiita-green to-emerald-600 dark:from-dark-green dark:to-emerald-700 text-white'
                        }`}>
                          {item.rank}
                        </div>
                        {item.book.thumbnail_url && (
                          <img
                            src={item.book.thumbnail_url}
                            alt=""
                            className="w-14 h-auto rounded-lg shadow-md"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-qiita-text dark:text-dark-text line-clamp-2 mb-1.5">
                            {item.book.title}
                          </h3>
                          <div className="flex gap-3 text-xs text-qiita-text-light dark:text-dark-text-light">
                            <span className="flex items-center gap-1">
                              <i className="ri-article-line"></i>
                              {item.stats.article_count}記事
                            </span>
                            <span className="flex items-center gap-1">
                              <i className="ri-heart-line"></i>
                              {item.stats.total_likes}いいね
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
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                {error}
              </div>
            )}

            {bookDetail ? (
              <>
                {/* 書籍情報 */}
                <div className="bg-gradient-to-br from-qiita-card to-qiita-surface dark:from-dark-card dark:to-dark-surface rounded-2xl shadow-xl border border-qiita-border dark:border-dark-border p-6 mb-4">
                  <div className="flex gap-4 items-start mb-5">
                    {bookDetail.thumbnail_url && (
                      <img
                        src={bookDetail.thumbnail_url}
                        alt={bookDetail.title}
                        className="w-24 h-auto rounded-lg shadow-lg"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-2 line-clamp-3">
                        {bookDetail.title}
                      </h2>
                      {bookDetail.author && (
                        <p className="text-sm text-qiita-text-light dark:text-dark-text-light flex items-center gap-1">
                          <i className="ri-user-line"></i>
                          {bookDetail.author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 追加フォーム */}
                  <form onSubmit={handleAddYouTube}>
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <i className="ri-youtube-line absolute left-3 top-1/2 -translate-y-1/2 text-qiita-text-light dark:text-dark-text-light"></i>
                        <input
                          type="url"
                          value={newYouTubeUrl}
                          onChange={(e) => setNewYouTubeUrl(e.target.value)}
                          placeholder="YouTube URL"
                          className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={loading || !newYouTubeUrl.trim()}
                        className="px-5 py-2.5 bg-gradient-to-r from-qiita-green to-emerald-500 dark:from-dark-green dark:to-emerald-600 text-white text-sm rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all duration-200"
                      >
                        <i className="ri-add-line mr-1"></i>追加
                      </button>
                    </div>
                  </form>
                </div>

                {/* 動画リスト */}
                <div className="bg-qiita-card dark:bg-dark-card rounded-2xl shadow-xl border border-qiita-border dark:border-dark-border p-6">
                  <h3 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-4 flex items-center gap-2">
                    <i className="ri-play-list-line"></i>
                    登録済み動画 
                    <span className="ml-auto text-sm font-normal bg-qiita-green/10 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green px-3 py-1 rounded-full">
                      {bookDetail.youtube_links.length}件
                    </span>
                  </h3>
                  
                  {bookDetail.youtube_links.length === 0 ? (
                    <div className="text-center py-12">
                      <i className="ri-video-off-line text-4xl text-qiita-text-light dark:text-dark-text-light mb-3 block"></i>
                      <p className="text-qiita-text-light dark:text-dark-text-light text-sm">
                        動画がまだ登録されていません
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {bookDetail.youtube_links
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((link) => (
                          <div
                            key={link.id}
                            className="border border-qiita-border dark:border-dark-border rounded-xl p-3 hover:shadow-md transition-all duration-200 bg-qiita-surface dark:bg-dark-surface"
                          >
                            <div className="flex gap-2 items-start mb-3">
                              {link.thumbnail_url && (
                                <img
                                  src={link.thumbnail_url}
                                  alt=""
                                  className="w-28 h-auto rounded-lg shadow-sm"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <a
                                  href={link.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-qiita-green dark:text-dark-green hover:underline block truncate flex items-center gap-1"
                                >
                                  <i className="ri-external-link-line"></i>
                                  {link.youtube_url}
                                </a>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-qiita-text-light dark:text-dark-text-light">
                                順序:
                              </span>
                              <input
                                type="number"
                                value={link.display_order}
                                onChange={(e) =>
                                  handleUpdateOrder(link.id, Number(e.target.value))
                                }
                                min="1"
                                className="w-16 px-2 py-1 text-xs text-center rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                              />
                              <button
                                onClick={() => handleDeleteYouTube(link.id)}
                                disabled={loading}
                                className="ml-auto px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg disabled:opacity-50 transition-all duration-200 flex items-center gap-1"
                              >
                                <i className="ri-delete-bin-line"></i>削除
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-gradient-to-br from-qiita-card to-qiita-surface dark:from-dark-card dark:to-dark-surface rounded-2xl shadow-xl border-2 border-dashed border-qiita-border dark:border-dark-border p-12 text-center">
                <i className="ri-hand-coin-line text-6xl text-qiita-text-light dark:text-dark-text-light mb-4 block"></i>
                <p className="text-qiita-text-light dark:text-dark-text-light text-lg">
                  左のランキングから書籍を選択してください
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
