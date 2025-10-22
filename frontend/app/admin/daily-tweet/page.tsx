'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function DailyTweetPage() {
  const [tweet, setTweet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTodayTweet = async () => {
    setLoading(true);
    setError(null);
    setTweet('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/admin/daily-tweet`);
      
      if (!response.ok) {
        throw new Error('ツイート文の取得に失敗しました');
      }

      const data = await response.json();
      setTweet(data.tweet);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const openTwitter = () => {
    if (!tweet) return;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweet)}`;
    window.open(tweetUrl, '_blank');
  };

  const copyToClipboard = async () => {
    if (!tweet) return;
    try {
      await navigator.clipboard.writeText(tweet);
      alert('コピーしました！');
    } catch {
      alert('コピーに失敗しました');
    }
  };

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-qiita-text-dark dark:text-white mb-2">
            本日のツイート
          </h1>
          <p className="text-qiita-text dark:text-dark-text">
            24時間ランキング1位のツイート文を表示します
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={fetchTodayTweet}
            disabled={loading}
            className="w-full bg-qiita-green dark:bg-dark-green text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? '取得中...' : '今日のツイートを見る'}
          </button>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <i className="ri-error-warning-line text-xl"></i>
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {tweet && (
            <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border border-qiita-border dark:border-dark-border shadow-sm">
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border mb-4">
                <p className="whitespace-pre-wrap text-qiita-text-dark dark:text-white text-base leading-relaxed">
                  {tweet}
                </p>
                <p className="text-xs text-qiita-text-light dark:text-dark-text-light text-right mt-3">
                  文字数: {tweet.length} / 280
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gray-600 dark:bg-gray-500 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <i className="ri-file-copy-line"></i>
                  コピー
                </button>
                <button
                  onClick={openTwitter}
                  className="flex-1 bg-blue-500 dark:bg-blue-400 text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <i className="ri-twitter-x-line"></i>
                  Xで投稿する
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

