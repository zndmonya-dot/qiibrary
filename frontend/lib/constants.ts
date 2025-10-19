/**
 * アプリケーション全体で使用する定数
 */

// ========================================
// ページネーション設定
// ========================================
export const ITEMS_PER_PAGE = 25;

// ========================================
// API設定
// ========================================
export const API_TIMEOUT = 30000; // 30秒
export const DEFAULT_RANKING_LIMIT = 50;

// ========================================
// テーマ設定
// ========================================
export const THEME_STORAGE_KEY = 'theme';
export const VALID_THEMES = ['system', 'dark'] as const;
export type Theme = typeof VALID_THEMES[number];

// ========================================
// ローカルストレージキー
// ========================================
export const STORAGE_KEYS = {
  THEME: THEME_STORAGE_KEY,
} as const;

// ========================================
// カラー設定
// ========================================
export const COLORS = {
  // ライトモード
  QIITA_GREEN: '#357a00',
  
  // ダークモード
  DARK_GREEN: '#55c500',
  DARK_BG: '#1d2020',
  DARK_SURFACE: '#2f3232',
  DARK_HEADER_FOOTER: '#3a3c3c',
} as const;

// ========================================
// 外部リンク
// ========================================
export const EXTERNAL_LINKS = {
  AMAZON_ASSOCIATE_TAG: 'booktuber-22',
  GITHUB: 'https://github.com/your_account',
  TWITTER: 'https://twitter.com/your_account',
} as const;

