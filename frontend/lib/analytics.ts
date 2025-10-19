/**
 * アクセス解析ユーティリティ
 * 将来的にGoogle Analytics 4やPlausibleに切り替え可能な設計
 */

// イベントの型定義
export type AnalyticsEvent = {
  category: string;
  action: string;
  label?: string;
  value?: number;
};

// ページビューの記録
export const trackPageView = (url: string) => {
  if (typeof window === 'undefined') return;
  
  // Google Analytics 4 の場合
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID || '', {
      page_path: url,
    });
  }
  
  // 将来的に独自の分析APIにも送信可能
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT + '/pageview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        timestamp: new Date().toISOString(),
        referrer: document.referrer,
        locale: localStorage.getItem('locale') || 'ja',
      }),
    }).catch(() => {
      // エラーは無視（分析は非クリティカル）
    });
  }
};

// イベントの記録
export const trackEvent = ({ category, action, label, value }: AnalyticsEvent) => {
  if (typeof window === 'undefined') return;
  
  // Google Analytics 4
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
  
  // 将来的に独自の分析APIにも送信
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT + '/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        action,
        label,
        value,
        timestamp: new Date().toISOString(),
        locale: localStorage.getItem('locale') || 'ja',
      }),
    }).catch(() => {});
  }
};

// 特定のイベントのヘルパー関数
export const analytics = {
  // 書籍クリック
  clickBook: (asin: string, title: string, rank: number) => {
    trackEvent({
      category: 'Book',
      action: 'click',
      label: `${rank}位: ${title}`,
      value: rank,
    });
  },
  
  // Amazon購入ボタンクリック
  clickAmazonLink: (asin: string, title: string) => {
    trackEvent({
      category: 'Affiliate',
      action: 'click_amazon',
      label: title,
    });
  },
  
  // YouTube動画視聴
  clickYouTubeVideo: (videoId: string, bookTitle: string) => {
    trackEvent({
      category: 'YouTube',
      action: 'click_video',
      label: `${bookTitle} - ${videoId}`,
    });
  },
  
  // ランキング期間切り替え
  changeRankingPeriod: (period: string) => {
    trackEvent({
      category: 'Ranking',
      action: 'change_period',
      label: period,
    });
  },
  
  // 言語切り替え
  changeLocale: (locale: 'ja' | 'en') => {
    trackEvent({
      category: 'UI',
      action: 'change_locale',
      label: locale,
    });
  },
  
  // 検索機能（将来実装時）
  search: (query: string, resultsCount: number) => {
    trackEvent({
      category: 'Search',
      action: 'search',
      label: query,
      value: resultsCount,
    });
  },
};

// TypeScript用のwindow拡張
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

