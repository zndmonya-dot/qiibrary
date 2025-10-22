'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getRankings, getBookDetail, Book, BookStats, TopArticle } from '@/lib/api';

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
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return String(num);
  };

  const generateTweetText = (book: Book, stats: BookStats): string => {
    const title = book.title;
    const articleCount = stats.article_count;
    const totalLikes = stats.total_likes;
    const likesDisplay = formatNumber(totalLikes);
    
    const asin = book.isbn?.replace(/-/g, '') || '';
    const bookUrl = asin ? `https://qiibrary.com/books/${asin}` : 'https://qiibrary.com';
    const amazonUrl = book.amazon_affiliate_url || book.amazon_url || '';
    
    const tweet = `【Qiita技術書ランキング 速報】

${title}

・記事掲載数: ${articleCount}件
・総評価数: ${likesDisplay}

Qiitaで話題の技術書をランキング化
👉 ${bookUrl}

Amazon: ${amazonUrl}

#技術書 #Qiita #Qiibrary`;
    
    return tweet;
  };

  const fetchDailyTop = async () => {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      // 24時間ランキングを取得
      const rankings = await getRankings.daily();
      
      if (!rankings || rankings.rankings.length === 0) {
        throw new Error('24時間以内のランキングデータがありません');
      }

      // 1位を取得
      const topItem = rankings.rankings[0];
      
      // 書籍詳細を取得して累計データを計算
      const asin = topItem.book.isbn?.replace(/-/g, '') || '';
      const bookDetail = await getBookDetail(asin);
      
      // 累計いいね数を計算
      const totalLikes = bookDetail.qiita_articles.reduce((sum, article) => sum + article.likes_count, 0);
      
      // 累計データで統計情報を上書き
      const cumulativeStats: BookStats = {
        ...topItem.stats,
        article_count: bookDetail.qiita_articles.length, // 累計記事数
        total_likes: totalLikes, // 累計いいね数
      };
      
      // ツイート文を生成
      const tweetText = generateTweetText(bookDetail, cumulativeStats);
      
      // データを整形（累計データを使用）
      const bookData: BookData = {
        id: bookDetail.id,
        isbn: bookDetail.isbn || '',
        title: bookDetail.title,
        author: bookDetail.author || '',
        publisher: bookDetail.publisher || '',
        thumbnail_url: bookDetail.thumbnail_url,
        amazon_affiliate_url: bookDetail.amazon_affiliate_url,
        article_count: cumulativeStats.article_count,
        unique_user_count: cumulativeStats.unique_user_count,
        total_likes: cumulativeStats.total_likes,
        mention_count: cumulativeStats.mention_count,
      };
      
      setData({
        book: bookData,
        tweet: tweetText,
        generated_at: new Date().toISOString()
      });
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

  const updateData = async (days: number = 7) => {
    setUpdating(true);
    setUpdateSuccess(false);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/admin/update-data?days=${days}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('データ更新の開始に失敗しました');
      }

      const result = await response.json();
      setUpdateSuccess(true);
      alert(`データ更新を開始しました！\n期間: ${result.start_date} 〜 ${result.end_date}\n\nバックグラウンドで処理中です。数分後に再度「今日の1位を取得」してください。`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました');
    } finally {
      setUpdating(false);
    }
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
          24時間ランキング1位の書籍をX（Twitter）で紹介するためのツイート文を生成します。<br />
          <span className="text-sm text-qiita-text-light dark:text-dark-text-light">※記事数・いいね数は累計データです</span>
        </p>
        </div>

        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 border border-qiita-border dark:border-dark-border shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={fetchDailyTop}
              disabled={loading}
              className="flex-1 bg-qiita-green dark:bg-dark-green text-white px-6 py-3 rounded-lg font-semibold hover-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '取得中...' : '今日の1位を取得'}
            </button>
            
            <button
              onClick={() => updateData(7)}
              disabled={updating}
              className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <i className="ri-refresh-line"></i>
              {updating ? 'データ更新中...' : '過去7日分のデータを更新'}
            </button>
          </div>
          
          {updateSuccess && (
            <div className="mt-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <i className="ri-check-line text-lg"></i>
                <span>データ更新を開始しました。バックグラウンドで処理中です。</span>
              </div>
            </div>
          )}
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

