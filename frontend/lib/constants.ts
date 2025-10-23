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
// テーマは常にOSの設定に従います（自動）

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
  AMAZON_ASSOCIATE_TAG: '', // Amazonアソシエイトタグ（審査中）
  GITHUB: 'https://github.com/zndmonya-dot/qiibrary',
  TWITTER: 'https://x.com/qiibrary', // X（旧Twitter）アカウント
} as const;

