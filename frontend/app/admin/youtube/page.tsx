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

export default function YouTubeAdminPage() {
  const [asin, setAsin] = useState('');
  const [bookDetail, setBookDetail] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [adminToken, setAdminToken] = useState('');
  
  // 新規追加用
  const [newYouTubeUrl, setNewYouTubeUrl] = useState('');
  const [newDisplayOrder, setNewDisplayOrder] = useState(1);

  // 初回ロード時にローカルストレージからトークンを取得
  useEffect(() => {
    const stored = localStorage.getItem('qiibrary-admin-token');
    if (stored) setAdminToken(stored);
  }, []);

  // トークンをローカルストレージに保存
  const saveAdminToken = (token: string) => {
    setAdminToken(token);
    localStorage.setItem('qiibrary-admin-token', token);
  };

  // 検索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim()) {
      setError('ASINを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.get(`${API_URL}/api/books/${asin.trim()}`);
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
      setError(err.response?.data?.detail || '書籍が見つかりませんでした');
      setBookDetail(null);
    } finally {
      setLoading(false);
    }
  };

  // YouTube動画を追加
  const handleAddYouTube = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDetail || !newYouTubeUrl.trim()) {
      setError('YouTube URLを入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post(
        `${API_URL}/api/admin/books/${bookDetail.id}/youtube`,
        {
          youtube_url: newYouTubeUrl.trim(),
          display_order: newDisplayOrder,
        },
        {
          headers: {
            'X-Admin-Token': adminToken,
          },
        }
      );

      setSuccess('YouTube動画を追加しました');
      setNewYouTubeUrl('');
      setNewDisplayOrder(1);
      
      // 再読み込み
      handleSearch(e);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'YouTube動画の追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // YouTube動画を削除
  const handleDeleteYouTube = async (linkId: number) => {
    if (!confirm('この動画リンクを削除しますか？')) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.delete(`${API_URL}/api/admin/youtube/${linkId}`, {
        headers: {
          'X-Admin-Token': adminToken,
        },
      });

      setSuccess('YouTube動画を削除しました');
      
      // 再読み込み
      if (bookDetail) {
        const response = await axios.get(`${API_URL}/api/books/${bookDetail.isbn}`);
        const data = response.data;
        setBookDetail({
          ...bookDetail,
          youtube_links: data.youtube_links || [],
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'YouTube動画の削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 表示順序を更新
  const handleUpdateOrder = async (linkId: number, newOrder: number) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.put(
        `${API_URL}/api/admin/youtube/${linkId}`,
        {
          display_order: newOrder,
        },
        {
          headers: {
            'X-Admin-Token': adminToken,
          },
        }
      );

      setSuccess('表示順序を更新しました');
      
      // 再読み込み
      if (bookDetail) {
        const response = await axios.get(`${API_URL}/api/books/${bookDetail.isbn}`);
        const data = response.data;
        setBookDetail({
          ...bookDetail,
          youtube_links: data.youtube_links || [],
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || '表示順序の更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-qiita-surface dark:bg-dark-surface p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-qiita-text dark:text-dark-text mb-8">
          YouTube動画リンク管理
        </h1>

        {/* 管理トークン */}
        {!adminToken && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-yellow-800 dark:text-yellow-300 mb-3">
              管理者トークンを入力してください
            </h2>
            <div className="flex gap-3">
              <input
                type="password"
                placeholder="管理者トークンを入力"
                className="flex-1 px-4 py-3 rounded-lg border border-yellow-300 dark:border-yellow-700 bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    saveAdminToken((e.target as HTMLInputElement).value);
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  if (input.value) saveAdminToken(input.value);
                }}
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-semibold"
              >
                保存
              </button>
            </div>
          </div>
        )}

        {adminToken && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6 flex justify-between items-center">
            <p className="text-green-800 dark:text-green-300">
              管理者トークン: ******{adminToken.slice(-4)}
            </p>
            <button
              onClick={() => {
                setAdminToken('');
                localStorage.removeItem('qiibrary-admin-token');
              }}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
            >
              削除
            </button>
          </div>
        )}

        {/* 検索フォーム */}
        <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-qiita-text dark:text-dark-text mb-4">
            書籍を検索
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3">
            <input
              type="text"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              placeholder="ISBN/ASIN を入力（例: 4873115655）"
              className="flex-1 px-4 py-3 rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-qiita-green dark:bg-dark-green text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
            >
              {loading ? '検索中...' : '検索'}
            </button>
          </form>
        </div>

        {/* エラー・成功メッセージ */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 px-6 py-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* 書籍詳細 */}
        {bookDetail && (
          <>
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-qiita-text dark:text-dark-text mb-4">
                書籍情報
              </h2>
              <div className="flex gap-6">
                {bookDetail.thumbnail_url && (
                  <img
                    src={bookDetail.thumbnail_url}
                    alt={bookDetail.title}
                    className="w-32 h-auto rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-2">
                    {bookDetail.title}
                  </h3>
                  {bookDetail.author && (
                    <p className="text-sm text-qiita-text-light dark:text-dark-text-light mb-1">
                      著者: {bookDetail.author}
                    </p>
                  )}
                  <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                    ISBN: {bookDetail.isbn}
                  </p>
                </div>
              </div>
            </div>

            {/* YouTube動画追加フォーム */}
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-qiita-text dark:text-dark-text mb-4">
                YouTube動画を追加
              </h2>
              <form onSubmit={handleAddYouTube} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-qiita-text dark:text-dark-text mb-2">
                    YouTube URL
                  </label>
                  <input
                    type="url"
                    value={newYouTubeUrl}
                    onChange={(e) => setNewYouTubeUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-qiita-text dark:text-dark-text mb-2">
                    表示順序
                  </label>
                  <input
                    type="number"
                    value={newDisplayOrder}
                    onChange={(e) => setNewDisplayOrder(Number(e.target.value))}
                    min="1"
                    className="w-32 px-4 py-3 rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-qiita-green dark:focus:ring-dark-green"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-qiita-green dark:bg-dark-green text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
                >
                  追加
                </button>
              </form>
            </div>

            {/* 既存のYouTube動画リスト */}
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-qiita-text dark:text-dark-text mb-4">
                登録済みYouTube動画 ({bookDetail.youtube_links.length}件)
              </h2>
              {bookDetail.youtube_links.length === 0 ? (
                <p className="text-qiita-text-light dark:text-dark-text-light">
                  まだYouTube動画が登録されていません
                </p>
              ) : (
                <div className="space-y-4">
                  {bookDetail.youtube_links
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((link) => (
                      <div
                        key={link.id}
                        className="border border-qiita-border dark:border-dark-border rounded-lg p-4 flex gap-4"
                      >
                        {link.thumbnail_url && (
                          <img
                            src={link.thumbnail_url}
                            alt={link.title || 'YouTube動画'}
                            className="w-40 h-auto rounded"
                          />
                        )}
                        <div className="flex-1">
                          <a
                            href={link.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-qiita-green dark:text-dark-green hover:underline font-medium mb-2 block"
                          >
                            {link.title || link.youtube_url}
                          </a>
                          <p className="text-sm text-qiita-text-light dark:text-dark-text-light mb-3">
                            動画ID: {link.youtube_video_id}
                          </p>
                          <div className="flex gap-3 items-center">
                            <label className="text-sm font-medium text-qiita-text dark:text-dark-text">
                              表示順序:
                            </label>
                            <input
                              type="number"
                              value={link.display_order}
                              onChange={(e) =>
                                handleUpdateOrder(link.id, Number(e.target.value))
                              }
                              min="1"
                              className="w-20 px-3 py-1 rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text"
                            />
                            <button
                              onClick={() => handleDeleteYouTube(link.id)}
                              disabled={loading}
                              className="ml-auto px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

