import axios from 'axios';
import { API_TIMEOUT, DEFAULT_RANKING_LIMIT } from './constants';
import { getYouTubeThumbnailUrl, getYouTubeVideoUrl, buildQueryParams } from './utils';

// API設定
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: API_TIMEOUT,
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
  article_count: number;
  unique_user_count: number; // ユニークユーザー数
  total_likes: number;
  avg_likes: number;
  score: number;
  latest_mention_at: string | null;
  is_new: boolean; // NEWバッジ表示フラグ（初登場から30日以内）
  total_views?: number; // YouTube動画用（オプション）
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
  total: number;           // 総件数（サーバーサイドページネーション用）
  limit: number;           // 取得件数
  offset: number;          // オフセット
  period: {
    type?: 'daily' | 'monthly' | 'yearly';
    date?: string;
    year?: number;
    month?: number;
  };
}

/**
 * YouTube動画情報
 */
export interface YouTubeVideo {
  video_id: string;
  title: string;
  channel_name: string;
  thumbnail_url: string | null;
  video_url: string;
  view_count: number;
  like_count: number;
  subscriber_count: number;
  popularity_score: number;
  published_at: string;
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
 * 書籍詳細情報（Qiita記事とYouTube動画を含む）
 */
export interface BookDetail extends Book {
  qiita_articles: QiitaArticle[];
  youtube_videos: YouTubeVideo[];
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
 * @returns 年のリスト（降順）
 */
export const getAvailableYears = async (): Promise<number[]> => {
  const response = await api.get('/api/rankings/years');
  return response.data.years || [];
};

/**
 * 書籍詳細を取得
 * @param asin 書籍のISBN/ASIN
 * @returns 書籍詳細情報
 */
export const getBookDetail = async (asin: string): Promise<BookDetail> => {
  const response = await api.get(`/api/books/${asin}`);
  const data = response.data;
  
  // youtube_linksをyoutube_videosに変換
  const youtube_videos = (data.youtube_links || []).map((link: any) => {
    const videoId = link.youtube_video_id || '';
    return {
      video_id: videoId,
      title: link.title || '動画タイトル',
      channel_name: link.channel_name || 'YouTube',
      thumbnail_url: link.thumbnail_url || getYouTubeThumbnailUrl(videoId),
      video_url: link.youtube_url || getYouTubeVideoUrl(videoId),
      view_count: link.view_count || 0,
      like_count: link.like_count || 0,
      subscriber_count: link.subscriber_count || 0,
      popularity_score: link.popularity_score || 0,
      published_at: link.published_at || new Date().toISOString(),
    };
  });
  
  return {
    ...data.book,
    qiita_articles: data.qiita_articles || [],
    youtube_videos,
  };
};

