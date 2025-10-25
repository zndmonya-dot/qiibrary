'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type RankingPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface PatternInfo {
  label: string;
  description: string;
  icon: string;
}

const PATTERNS: Record<RankingPattern, PatternInfo> = {
  daily: {
    label: '本日の1位',
    description: '24時間ランキング',
    icon: 'ri-calendar-line'
  },
  weekly: {
    label: '今週の1位',
    description: '7日間ランキング',
    icon: 'ri-calendar-week-line'
  },
  monthly: {
    label: '先月の1位',
    description: '完全なカレンダー月ランキング',
    icon: 'ri-calendar-2-line'
  },
  yearly: {
    label: '去年の1位',
    description: '完全なカレンダー年ランキング',
    icon: 'ri-calendar-event-line'
  }
};

export default function DailyTweetPage() {
  const [pattern, setPattern] = useState<RankingPattern>('daily');
  const [tweet, setTweet] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tweetInfo, setTweetInfo] = useState<any>(null);

  const fetchTodayTweet = async () => {
    setLoading(true);
    setError(null);
    setTweet('');
    setTweetInfo(null);

    try {
      const headers: HeadersInit = {};
      
      // 管理者トークンを環境変数から取得（設定されている場合）
      const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
      if (adminToken) {
        headers['Authorization'] = `Bearer ${adminToken}`;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://qiibrary.onrender.com';
      const endpoint = `${apiUrl}/api/admin/daily-tweet?pattern=${pattern}`;
      
      const response = await fetch(endpoint, { headers });
      
      if (!response.ok) {
        // エラーレスポンスの詳細を取得
        let errorDetail = '';
        try {
          const errorData = await response.json();
          errorDetail = errorData.detail || JSON.stringify(errorData);
        } catch {
          errorDetail = await response.text();
        }
        
        if (response.status === 401) {
          throw new Error(`認証に失敗しました (401): ${errorDetail}`);
        }
        throw new Error(`ツイート文の取得に失敗しました (${response.status}): ${errorDetail}`);
      }

      const data = await response.json();
      setTweet(data.tweet);
      setTweetInfo(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '不明なエラーが発生しました';
      console.error('ツイート生成エラー:', errorMessage);
      console.error('API URL:', process.env.NEXT_PUBLIC_API_URL || 'https://qiibrary.onrender.com');
      setError(errorMessage);
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
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-qiita-text-dark dark:text-white mb-2">
            ツイート生成
          </h1>
          <p className="text-qiita-text dark:text-dark-text">
            ランキング1位のツイート文を生成します
          </p>
        </div>

        <div className="space-y-6">
          {/* パターン選択 */}
          <div>
            <h2 className="text-lg font-bold text-qiita-text-dark dark:text-white mb-3">
              ランキングパターン
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(Object.entries(PATTERNS) as [RankingPattern, PatternInfo][]).map(([key, info]) => (
                <button
                  key={key}
                  onClick={() => setPattern(key)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    pattern === key
                      ? 'border-qiita-green dark:border-dark-green bg-qiita-green/10 dark:bg-dark-green/10'
                      : 'border-qiita-border dark:border-dark-border bg-qiita-surface dark:bg-dark-surface-light hover:border-qiita-green/50 dark:hover:border-dark-green/50'
                  }`}
                >
                  <i className={`${info.icon} text-2xl mb-2 block ${
                    pattern === key ? 'text-qiita-green dark:text-dark-green' : 'text-qiita-text dark:text-dark-text'
                  }`}></i>
                  <div className="text-sm font-bold text-qiita-text-dark dark:text-white mb-1">
                    {info.label}
                  </div>
                  <div className="text-xs text-qiita-text dark:text-dark-text">
                    {info.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchTodayTweet}
            disabled={loading}
            className="w-full bg-qiita-green dark:bg-dark-green text-white px-6 py-4 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-lg flex items-center justify-center gap-2"
          >
            <i className="ri-article-line text-xl"></i>
            {loading ? '取得中...' : 'ツイート文を生成'}
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
              {/* ツイート情報 */}
              {tweetInfo && (
                <div className="mb-4 p-3 bg-qiita-surface dark:bg-dark-surface-light rounded-lg border border-qiita-border dark:border-dark-border">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-qiita-text dark:text-dark-text mb-1">書籍</div>
                      <div className="font-bold text-qiita-text-dark dark:text-white line-clamp-2">
                        {tweetInfo.book_title}
                      </div>
                    </div>
                    <div>
                      <div className="text-qiita-text dark:text-dark-text mb-1">期間</div>
                      <div className="font-bold text-qiita-text-dark dark:text-white">
                        {tweetInfo.period_label}
                      </div>
                    </div>
                    <div>
                      <div className="text-qiita-text dark:text-dark-text mb-1">記事数</div>
                      <div className="font-bold text-qiita-green dark:text-dark-green">
                        {tweetInfo.article_count}件
                      </div>
                    </div>
                    <div>
                      <div className="text-qiita-text dark:text-dark-text mb-1">総評価数</div>
                      <div className="font-bold text-pink-500 dark:text-pink-400">
                        {tweetInfo.total_likes.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ツイート文 */}
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

