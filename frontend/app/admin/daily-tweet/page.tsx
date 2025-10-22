'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';

interface BookData {
  id: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  thumbnail_url: string | null;
  amazon_affiliate_url: string | null;
  article_count: number;
  unique_user_count: number;
  total_likes: number;
  mention_count: number;
}

interface DailyTopResponse {
  book: BookData;
  tweet: string;
  generated_at: string;
}

export default function DailyTweetPage() {
  const [data, setData] = useState<DailyTopResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchDailyTop = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/daily-top`);
      
      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!data) return;

    try {
      await navigator.clipboard.writeText(data.tweet);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      alert('コピーに失敗しました');
    }
  };

  const openTwitter = () => {
    if (!data) return;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(data.tweet)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-qiita-text-dark dark:text-white mb-2">
            デイリーツイート生成
          </h1>
          <p className="text-qiita-text dark:text-dark-text">
            24時間ランキング1位の書籍をX（Twitter）で紹介するためのツイート文を生成します。
          </p>
        </div>

        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border border-qiita-border dark:border-dark-border shadow-sm mb-6">
          <button
            onClick={fetchDailyTop}
            disabled={loading}
            className="w-full bg-qiita-green dark:bg-dark-green text-white px-6 py-3 rounded-lg font-semibold hover-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '取得中...' : '今日の1位を取得'}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <i className="ri-error-warning-line text-xl"></i>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {data && !loading && (
          <div className="space-y-6">
            {/* 書籍情報 */}
            <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border border-qiita-border dark:border-dark-border shadow-sm">
              <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-book-2-line text-qiita-green dark:text-dark-green"></i>
                本日の1位
              </h2>
              
              <div className="flex gap-4">
                {data.book.thumbnail_url && (
                  <img
                    src={data.book.thumbnail_url}
                    alt={data.book.title}
                    className="w-24 h-36 object-cover rounded shadow-md"
                  />
                )}
                
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-qiita-text-dark dark:text-white mb-2">
                    {data.book.title}
                  </h3>
                  {data.book.author && (
                    <p className="text-sm text-qiita-text dark:text-dark-text mb-1">
                      著者: {data.book.author}
                    </p>
                  )}
                  {data.book.publisher && (
                    <p className="text-sm text-qiita-text dark:text-dark-text mb-3">
                      出版社: {data.book.publisher}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <i className="ri-article-line text-qiita-green dark:text-dark-green"></i>
                      <span className="text-qiita-text dark:text-dark-text">
                        {data.book.article_count}件の記事
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <i className="ri-heart-line text-red-500"></i>
                      <span className="text-qiita-text dark:text-dark-text">
                        {data.book.total_likes.toLocaleString()}いいね
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ツイート文 */}
            <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border border-qiita-border dark:border-dark-border shadow-sm">
              <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-twitter-x-line text-qiita-green dark:text-dark-green"></i>
                ツイート文
              </h2>
              
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 mb-4 font-mono text-sm whitespace-pre-wrap">
                {data.tweet}
              </div>
              
              <div className="text-sm text-qiita-text dark:text-dark-text mb-4">
                文字数: {data.tweet.length} / 280
              </div>
              
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 min-w-[200px] bg-qiita-green dark:bg-dark-green text-white px-6 py-3 rounded-lg font-semibold hover-opacity-90 flex items-center justify-center gap-2"
                >
                  <i className={copied ? "ri-check-line" : "ri-file-copy-line"}></i>
                  {copied ? 'コピーしました！' : 'ツイート文をコピー'}
                </button>
                
                <button
                  onClick={openTwitter}
                  className="flex-1 min-w-[200px] bg-[#1DA1F2] text-white px-6 py-3 rounded-lg font-semibold hover-opacity-90 flex items-center justify-center gap-2"
                >
                  <i className="ri-twitter-x-line"></i>
                  Xで投稿する
                </button>
              </div>
            </div>

            <div className="text-xs text-qiita-text-light dark:text-dark-text-light text-center">
              生成日時: {new Date(data.generated_at).toLocaleString('ja-JP')}
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

