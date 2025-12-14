import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_TIMEOUT } from './constants';

// API設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
});

// リトライ用の型拡張
interface RetryConfig extends InternalAxiosRequestConfig {
  retryCount?: number;
}

// リトライ設定
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const config = error.config as RetryConfig;
  
  // ネットワークエラー、タイムアウト、5xxエラーの場合にリトライ
  const shouldRetry = 
    !error.response || // ネットワークエラー
    (error.response.status >= 500 && error.response.status < 600) || // サーバーエラー
    error.code === 'ECONNABORTED'; // タイムアウト

  if (!config || !shouldRetry || (config.retryCount || 0) >= MAX_RETRIES) {
    return Promise.reject(error);
  }
  
  config.retryCount = (config.retryCount || 0) + 1;
  
  // 指数バックオフ
  const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  console.log(`Retrying request... (${config.retryCount}/${MAX_RETRIES})`);
  return api(config);
});

// ========================================
// 型定義
// ========================================

/**
 * 書籍の基本情報
 */
export interface Book {
  id: number;
  isbn: string;
  title: string;
  author: string | null;
  publisher: string | null;
  publication_date: string | null;
  description: string | null;
  thumbnail_url: string | null;
  amazon_url: string | null;
  amazon_affiliate_url: string | null;
  total_mentions: number;
  latest_mention_at: string | null;
}

/**
 * 書籍の統計情報
 */
export interface BookStats {
  mention_count: number;
  /**
   * ブログ総数（全期間のQiita記事数）
   */
  article_count: number;
  /**
   * 期間/タグ等で絞った記事数（ランキング計算用）
   */
  article_count_period?: number;
  unique_user_count: number;
  total_likes: number;
  avg_likes: number;
  score: number;
  latest_mention_at: string | null;
  is_new: boolean;
}

/**
 * サイト全体の統計
 */
export interface SiteStatsResponse {
  total_articles: number;
  total_books: number;
  total_likes: number;
  updated_at: string;
}

/**
 * トップ記事情報（簡易版）
 */
export interface TopArticle {
  id: number;
  title: string;
  url: string;
  author_id: string;
  author_name: string | null;
  likes_count: number;
  published_at: string | null;
}

/**
 * ランキングアイテム
 */
export interface RankingItem {
  rank: number;
  book: Book;
  stats: BookStats;
  top_articles?: TopArticle[];
}

/**
 * ランキングAPIレスポンス
 */
export interface RankingResponse {
  rankings: RankingItem[];
  total: number;
  limit: number;
  offset: number;
  period: {
    type?: 'daily' | 'monthly' | 'yearly';
    date?: string;
    year?: number;
    month?: number;
  };
}

/**
 * Qiita記事情報
 */
export interface QiitaArticle {
  id: number;
  qiita_id: string;
  title: string;
  url: string;
  author_id: string;
  author_name: string | null;
  tags: string[];
  likes_count: number;
  stocks_count: number;
  comments_count: number;
  published_at: string;
}

/**
 * 書籍詳細情報（Qiita記事を含む）
 */
export interface BookDetail extends Book {
  qiita_articles: QiitaArticle[];
}

// ========================================
// API関数
// ========================================

/**
 * ランキング取得オプション
 */
export interface RankingOptions {
  tags?: string[];
  days?: number;
  year?: number;
  month?: number;
  limit?: number;
  offset?: number;
  search?: string;
}

/**
 * ランキング取得API（統一インターフェース）
 */
export const getRankings = {
  /**
   * 汎用ランキング取得（サーバーサイド検索・ページネーション対応）
   */
  get: async (options: RankingOptions = {}): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    
    if (options.tags && options.tags.length > 0) {
      params.append('tags', options.tags.join(','));
    }
    if (options.days !== undefined) {
      params.append('days', options.days.toString());
    }
    if (options.year !== undefined) {
      params.append('year', options.year.toString());
    }
    if (options.month !== undefined) {
      params.append('month', options.month.toString());
    }
    if (options.limit !== undefined) {
      params.append('limit', options.limit.toString());
    }
    if (options.offset !== undefined) {
      params.append('offset', options.offset.toString());
    }
    if (options.search) {
      params.append('search', options.search);
    }
    
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 全期間ランキング
   */
  all: async (options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get(options);
  },
  
  /**
   * 24時間のランキング
   */
  daily: async (options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get({ ...options, days: 1 });
  },
  
  /**
   * 過去30日間のランキング
   */
  monthly: async (options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get({ ...options, days: 30 });
  },
  
  /**
   * 過去365日間のランキング
   */
  yearly: async (options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get({ ...options, days: 365 });
  },
  
  /**
   * 特定の年のランキング
   */
  byYear: async (year: number, options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get({ ...options, year });
  },
  
  /**
   * 特定の年月のランキング
   */
  byMonth: async (year: number, month: number, options: RankingOptions = {}): Promise<RankingResponse> => {
    return getRankings.get({ ...options, year, month });
  },
};

/**
 * 利用可能な年のリストを取得
 */
export const getAvailableYears = async (): Promise<number[]> => {
  const response = await api.get('/api/rankings/years');
  return response.data.years || [];
};

/**
 * サイト全体の統計を取得
 */
export const getSiteStats = async (): Promise<SiteStatsResponse> => {
  const response = await api.get('/api/rankings/stats');
  return response.data;
};

/**
 * 書籍詳細を取得
 */
export const getBookDetail = async (asin: string): Promise<BookDetail> => {
  const response = await api.get(`/api/books/${asin}`);
  const data = response.data;
  
  return {
    ...data.book,
    qiita_articles: data.qiita_articles || [],
  };
};
