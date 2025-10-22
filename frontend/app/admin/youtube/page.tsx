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

type RankingPeriod = '24h' | '30d' | '365d';

export default function YouTubeAdminPage() {
  const [period, setPeriod] = useState<RankingPeriod>('24h');
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 新規追加用
  const [newYouTubeUrl, setNewYouTubeUrl] = useState('');

  // ランキング取得
  useEffect(() => {
    loadRankings();
  }, [period]);

  const loadRankings = async () => {
    setLoading(true);
    setError('');

    try {
      const days = period === '24h' ? 1 : period === '30d' ? 30 : 365;
      const response = await axios.get(`${API_URL}/api/rankings/fast?days=${days}&limit=10`);
      setRankings(response.data || []);
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
    <div className="min-h-screen bg-qiita-surface dark:bg-dark-surface p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-qiita-text dark:text-dark-text mb-6">
          YouTube動画管理
        </h1>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 左側：ランキング */}
          <div>
            {/* 期間選択 */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setPeriod('24h')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  period === '24h'
                    ? 'bg-qiita-green dark:bg-dark-green text-white'
                    : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border'
                }`}
              >
                24時間
              </button>
              <button
                onClick={() => setPeriod('30d')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  period === '30d'
                    ? 'bg-qiita-green dark:bg-dark-green text-white'
                    : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border'
                }`}
              >
                30日間
              </button>
              <button
                onClick={() => setPeriod('365d')}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold ${
                  period === '365d'
                    ? 'bg-qiita-green dark:bg-dark-green text-white'
                    : 'bg-qiita-card dark:bg-dark-card text-qiita-text dark:text-dark-text border border-qiita-border dark:border-dark-border'
                }`}
              >
                365日間
              </button>
            </div>

            {/* ランキングリスト */}
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-4">
              <h2 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-3">
                ランキング TOP 10
              </h2>
              
              {loading && !bookDetail ? (
                <p className="text-center py-8 text-qiita-text-light dark:text-dark-text-light">
                  読み込み中...
                </p>
              ) : rankings.length === 0 ? (
                <p className="text-center py-8 text-qiita-text-light dark:text-dark-text-light">
                  データがありません
                </p>
              ) : (
                <div className="space-y-2">
                  {rankings.map((item) => (
                    <button
                      key={item.book.id}
                      onClick={() => selectBook(item.book)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        bookDetail?.id === item.book.id
                          ? 'border-qiita-green dark:border-dark-green bg-qiita-green/5 dark:bg-dark-green/10'
                          : 'border-qiita-border dark:border-dark-border hover:bg-qiita-surface dark:hover:bg-dark-surface'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-qiita-green dark:bg-dark-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {item.rank}
                        </div>
                        {item.book.thumbnail_url && (
                          <img
                            src={item.book.thumbnail_url}
                            alt=""
                            className="w-12 h-auto rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-qiita-text dark:text-dark-text line-clamp-2 mb-1">
                            {item.book.title}
                          </h3>
                          <p className="text-xs text-qiita-text-light dark:text-dark-text-light">
                            {item.stats.article_count}記事 · {item.stats.total_likes}いいね
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側：書籍詳細 & YouTube管理 */}
          <div>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
                {error}
              </div>
            )}

            {bookDetail ? (
              <>
                {/* 書籍情報 */}
                <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-4 mb-4">
                  <div className="flex gap-3 items-start mb-4">
                    {bookDetail.thumbnail_url && (
                      <img
                        src={bookDetail.thumbnail_url}
                        alt={bookDetail.title}
                        className="w-20 h-auto rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-bold text-qiita-text dark:text-dark-text mb-1 line-clamp-2">
                        {bookDetail.title}
                      </h2>
                      {bookDetail.author && (
                        <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                          {bookDetail.author}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 追加フォーム */}
                  <form onSubmit={handleAddYouTube}>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newYouTubeUrl}
                        onChange={(e) => setNewYouTubeUrl(e.target.value)}
                        placeholder="YouTube URL"
                        className="flex-1 px-3 py-2 text-sm rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text"
                      />
                      <button
                        type="submit"
                        disabled={loading || !newYouTubeUrl.trim()}
                        className="px-4 py-2 bg-qiita-green dark:bg-dark-green text-white text-sm rounded hover:opacity-90 disabled:opacity-50 font-semibold"
                      >
                        追加
                      </button>
                    </div>
                  </form>
                </div>

                {/* 動画リスト */}
                <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-4">
                  <h3 className="text-base font-bold text-qiita-text dark:text-dark-text mb-3">
                    登録済み動画 ({bookDetail.youtube_links.length})
                  </h3>
                  
                  {bookDetail.youtube_links.length === 0 ? (
                    <p className="text-qiita-text-light dark:text-dark-text-light text-center py-6 text-sm">
                      動画がまだ登録されていません
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {bookDetail.youtube_links
                        .sort((a, b) => a.display_order - b.display_order)
                        .map((link) => (
                          <div
                            key={link.id}
                            className="border border-qiita-border dark:border-dark-border rounded p-3"
                          >
                            <div className="flex gap-2 items-start mb-2">
                              {link.thumbnail_url && (
                                <img
                                  src={link.thumbnail_url}
                                  alt=""
                                  className="w-24 h-auto rounded"
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
                                className="w-14 px-2 py-1 text-xs text-center rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text"
                              />
                              <button
                                onClick={() => handleDeleteYouTube(link.id)}
                                disabled={loading}
                                className="ml-auto px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 disabled:opacity-50"
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
              <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-8 text-center">
                <p className="text-qiita-text-light dark:text-dark-text-light">
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
