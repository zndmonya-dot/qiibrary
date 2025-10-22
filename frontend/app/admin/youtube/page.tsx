'use client';

import { useState } from 'react';
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
  
  // 新規追加用
  const [newYouTubeUrl, setNewYouTubeUrl] = useState('');

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

  // 検索
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asin.trim()) return;

    setLoading(true);
    setError('');

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-qiita-text dark:text-dark-text mb-6">
          YouTube動画管理
        </h1>

        {/* 検索 */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={asin}
              onChange={(e) => setAsin(e.target.value)}
              placeholder="ISBNで検索（例: 4873115655）"
              className="flex-1 px-4 py-3 rounded-lg border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-card text-qiita-text dark:text-dark-text"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-qiita-green dark:bg-dark-green text-white rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold"
            >
              検索
            </button>
          </div>
        </form>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* 書籍情報 */}
        {bookDetail && (
          <>
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-6 mb-6">
              <div className="flex gap-4 items-start mb-6">
                {bookDetail.thumbnail_url && (
                  <img
                    src={bookDetail.thumbnail_url}
                    alt={bookDetail.title}
                    className="w-24 h-auto rounded"
                  />
                )}
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-1">
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
                    className="flex-1 px-4 py-2 rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text"
                  />
                  <button
                    type="submit"
                    disabled={loading || !newYouTubeUrl.trim()}
                    className="px-6 py-2 bg-qiita-green dark:bg-dark-green text-white rounded hover:opacity-90 disabled:opacity-50 font-semibold"
                  >
                    追加
                  </button>
                </div>
              </form>
            </div>

            {/* 動画リスト */}
            <div className="bg-qiita-card dark:bg-dark-card rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-qiita-text dark:text-dark-text mb-4">
                登録済み動画 ({bookDetail.youtube_links.length})
              </h3>
              
              {bookDetail.youtube_links.length === 0 ? (
                <p className="text-qiita-text-light dark:text-dark-text-light text-center py-8">
                  動画がまだ登録されていません
                </p>
              ) : (
                <div className="space-y-3">
                  {bookDetail.youtube_links
                    .sort((a, b) => a.display_order - b.display_order)
                    .map((link) => (
                      <div
                        key={link.id}
                        className="border border-qiita-border dark:border-dark-border rounded-lg p-4 flex gap-3 items-center"
                      >
                        {link.thumbnail_url && (
                          <img
                            src={link.thumbnail_url}
                            alt=""
                            className="w-32 h-auto rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <a
                            href={link.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-qiita-green dark:text-dark-green hover:underline block truncate"
                          >
                            {link.youtube_url}
                          </a>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={link.display_order}
                            onChange={(e) =>
                              handleUpdateOrder(link.id, Number(e.target.value))
                            }
                            min="1"
                            className="w-16 px-2 py-1 text-center rounded border border-qiita-border dark:border-dark-border bg-white dark:bg-dark-surface text-qiita-text dark:text-dark-text"
                          />
                          <button
                            onClick={() => handleDeleteYouTube(link.id)}
                            disabled={loading}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
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
        )}
      </div>
    </div>
  );
}
