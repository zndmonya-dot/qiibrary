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

export default function YouTubeAdminPage() {
  const [token, setToken] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [youtubeLinks, setYoutubeLinks] = useState<YouTubeLink[]>([]);
  const [newYoutubeUrl, setNewYoutubeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // トークンをlocalStorageから復元
  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // ログイン
  const handleLogin = () => {
    if (token.trim()) {
      localStorage.setItem('admin_token', token);
      setIsAuthenticated(true);
      setError(null);
    }
  };

  // ログアウト
  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setToken('');
    setIsAuthenticated(false);
    setSearchResults([]);
    setSelectedBook(null);
    setYoutubeLinks([]);
  };

  // 書籍を検索
  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/admin/books/search`, {
        params: { q: searchQuery, limit: 20 },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'エラーが発生しました');
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  // 書籍を選択
  const selectBook = async (book: Book) => {
    setSelectedBook(book);
    setSearchResults([]);
    setSearchQuery('');
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_URL}/api/admin/books/${book.id}/youtube`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setYoutubeLinks(response.data.youtube_links || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // YouTube動画を追加
  const addYoutubeLink = async () => {
    if (!selectedBook || !newYoutubeUrl.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/admin/books/${selectedBook.id}/youtube`,
        {
          youtube_url: newYoutubeUrl,
          display_order: youtubeLinks.length + 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setYoutubeLinks([...youtubeLinks, response.data]);
      setNewYoutubeUrl('');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // YouTube動画を削除
  const deleteYoutubeLink = async (linkId: number) => {
    if (!confirm('この動画を削除しますか？')) return;

    setLoading(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/api/admin/youtube/${linkId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setYoutubeLinks(youtubeLinks.filter((link) => link.id !== linkId));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  // ログイン画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-youtube-dark-bg flex items-center justify-center p-4">
        <div className="bg-youtube-dark-surface p-8 rounded-lg shadow-xl max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-center">管理者ログイン</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">アクセストークン</label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full px-4 py-2 bg-youtube-dark-bg border border-youtube-dark-text-secondary/30 rounded focus:outline-none focus:border-youtube-red"
                placeholder="トークンを入力してください"
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-youtube-red hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              ログイン
            </button>
          </div>
        </div>
      </div>
    );
  }

  // メイン画面
  return (
    <div className="min-h-screen bg-youtube-dark-bg p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">YouTube動画管理</h1>
          <button
            onClick={handleLogout}
            className="bg-youtube-dark-surface hover:bg-youtube-dark-hover text-white px-4 py-2 rounded transition-colors"
          >
            ログアウト
          </button>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* 書籍検索 */}
        {!selectedBook && (
          <div className="bg-youtube-dark-surface p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">書籍を検索</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                className="flex-1 px-4 py-2 bg-youtube-dark-bg border border-youtube-dark-text-secondary/30 rounded focus:outline-none focus:border-youtube-red"
                placeholder="書籍名で検索..."
              />
              <button
                onClick={searchBooks}
                disabled={loading}
                className="bg-youtube-red hover:bg-red-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
              >
                {loading ? '検索中...' : '検索'}
              </button>
            </div>

            {/* 検索結果 */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => selectBook(book)}
                    className="flex items-center gap-4 p-3 bg-youtube-dark-bg hover:bg-youtube-dark-hover rounded cursor-pointer transition-colors"
                  >
                    {book.thumbnail_url && (
                      <img src={book.thumbnail_url} alt={book.title} className="w-12 h-16 object-cover rounded" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-medium">{book.title}</h3>
                      <p className="text-sm text-secondary">{book.author}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 選択された書籍 */}
        {selectedBook && (
          <div className="space-y-6">
            {/* 書籍情報 */}
            <div className="bg-youtube-dark-surface p-6 rounded-lg">
              <div className="flex items-center gap-4 mb-4">
                {selectedBook.thumbnail_url && (
                  <img src={selectedBook.thumbnail_url} alt={selectedBook.title} className="w-20 h-28 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{selectedBook.title}</h2>
                  <p className="text-secondary">{selectedBook.author}</p>
                  <p className="text-sm text-secondary mt-1">ISBN: {selectedBook.isbn}</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedBook(null);
                    setYoutubeLinks([]);
                  }}
                  className="bg-youtube-dark-bg hover:bg-youtube-dark-hover px-4 py-2 rounded transition-colors"
                >
                  別の書籍を選択
                </button>
              </div>
            </div>

            {/* YouTube動画追加 */}
            <div className="bg-youtube-dark-surface p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">YouTube動画を追加</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newYoutubeUrl}
                  onChange={(e) => setNewYoutubeUrl(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addYoutubeLink()}
                  className="flex-1 px-4 py-2 bg-youtube-dark-bg border border-youtube-dark-text-secondary/30 rounded focus:outline-none focus:border-youtube-red"
                  placeholder="YouTube URLを入力..."
                />
                <button
                  onClick={addYoutubeLink}
                  disabled={loading || !newYoutubeUrl.trim()}
                  className="bg-youtube-red hover:bg-red-600 text-white px-6 py-2 rounded transition-colors disabled:opacity-50"
                >
                  追加
                </button>
              </div>
            </div>

            {/* YouTube動画リスト */}
            <div className="bg-youtube-dark-surface p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">登録済みYouTube動画 ({youtubeLinks.length}件)</h3>
              {youtubeLinks.length === 0 ? (
                <p className="text-secondary text-center py-8">まだYouTube動画が登録されていません</p>
              ) : (
                <div className="space-y-3">
                  {youtubeLinks.map((link) => (
                    <div key={link.id} className="flex items-center gap-4 p-3 bg-youtube-dark-bg rounded">
                      {link.thumbnail_url && (
                        <img src={link.thumbnail_url} alt="thumbnail" className="w-32 h-20 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-secondary truncate">{link.youtube_url}</p>
                        <p className="text-xs text-secondary mt-1">表示順序: {link.display_order}</p>
                      </div>
                      <button
                        onClick={() => deleteYoutubeLink(link.id)}
                        disabled={loading}
                        className="bg-red-900/50 hover:bg-red-900 text-red-500 hover:text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
                      >
                        削除
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

