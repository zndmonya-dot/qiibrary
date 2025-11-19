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
// アニメーション設定
// ========================================
export const ANIMATION = {
  FADE_IN_DELAY: 0.2, // 基本遅延時間（秒）
  FADE_IN_INCREMENT: 0.05, // 各アイテムの遅延増分（秒）
  DURATION: 0.4, // アニメーション時間（秒）
} as const;

// ========================================
// 書籍詳細ページ設定
// ========================================
export const BOOK_DETAIL = {
  INITIAL_ARTICLES_COUNT: 20,
  SHOW_MORE_INCREMENT: 20,
  ANIMATION_TIMEOUT_MORE: 1200, // ms
  ANIMATION_TIMEOUT_ALL: 2000, // ms
  MIN_LOADING_DELAY: 300, // ms
  INITIAL_VIDEOS_COUNT: 8,
} as const;

// ========================================
// 検索設定
// ========================================
export const SEARCH = {
  DEBOUNCE_DELAY: 500, // ms
  MAX_QUERY_LENGTH: 100,
} as const;

// ========================================
// キャッシュ設定
// ========================================
export const CACHE = {
  YEARS_TTL: 3600000, // 1時間（ms）
} as const;

// ========================================
// レスポンシブ設定
// ========================================
export const BREAKPOINTS = {
  MOBILE: 768, // px
  TABLET: 1024, // px
  DESKTOP: 1280, // px
} as const;

// ========================================
// ランク表示設定
// ========================================
export const RANK_STYLES = {
  GOLD: {
    text: 'text-yellow-500',
    shadow: 'drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]',
  },
  SILVER: {
    text: 'text-gray-400',
    shadow: 'drop-shadow-[0_0_8px_rgba(156,163,175,0.5)]',
  },
  BRONZE: {
    text: 'text-orange-500',
    shadow: 'drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]',
  },
  DEFAULT: {
    text: 'text-qiita-green',
    shadow: '',
  },
} as const;

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

