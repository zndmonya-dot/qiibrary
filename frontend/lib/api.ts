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
  total_likes: number;
  avg_likes: number;
  score: number;
  latest_mention_at: string | null;
  total_views?: number; // YouTube動画用（オプション）
}

/**
 * ランキングアイテム
 */
export interface RankingItem {
  rank: number;
  book: Book;
  stats: BookStats;
}

/**
 * ランキングAPIレスポンス
 */
export interface RankingResponse {
  rankings: RankingItem[];
  period: {
    type: 'daily' | 'monthly' | 'yearly';
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
 * ランキング取得API
 */
export const getRankings = {
  /**
   * 全期間ランキング（全件取得）
   * @param tags フィルタリングするタグ
   */
  all: async (tags?: string[]): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    if (tags && tags.length > 0) {
      params.append('tags', tags.join(','));
    }
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 24時間のランキング（latest_mention_at基準、全件取得）
   */
  daily: async (): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    params.append('days', '1');
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 過去30日間のランキング（latest_mention_at基準、全件取得）
   */
  monthly: async (): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    params.append('days', '30');
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 過去365日間のランキング（latest_mention_at基準、全件取得）
   */
  yearly: async (): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    params.append('days', '365');
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 特定の年のランキング（全件取得）
   * @param year 年（例: 2024）
   */
  byYear: async (year: number): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
  },
  
  /**
   * 特定の年月のランキング（全件取得）
   * @param year 年（例: 2024）
   * @param month 月（1-12）
   */
  byMonth: async (year: number, month: number): Promise<RankingResponse> => {
    const params = new URLSearchParams();
    params.append('year', year.toString());
    params.append('month', month.toString());
    const response = await api.get(`/api/rankings/?${params}`);
    return response.data;
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
      channel_name: 'YouTube',
      thumbnail_url: link.thumbnail_url || getYouTubeThumbnailUrl(videoId),
      video_url: link.youtube_url || getYouTubeVideoUrl(videoId),
      view_count: 0,
      like_count: 0,
      published_at: new Date().toISOString(),
    };
  });
  
  return {
    ...data.book,
    qiita_articles: data.qiita_articles || [],
    youtube_videos,
  };
};

