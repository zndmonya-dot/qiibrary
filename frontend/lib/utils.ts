/**
 * 数値を見やすい形式にフォーマット
 * 例: 1234567 -> "1.2M"
 */
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * 日付をフォーマット（JST）
 * 例: "2025-10-17T10:00:00+09:00" -> "2025年10月17日"
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Tokyo',
  }).format(date);
}

/**
 * 相対時間を表示
 * 例: "3日前", "2ヶ月前"
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)}ヶ月前`;
  return `${Math.floor(diffDays / 365)}年前`;
}

/**
 * 価格をフォーマット
 * 例: 2640 -> "¥2,640"
 */
export function formatPrice(price: number | null): string {
  if (!price) return '価格情報なし';
  
  return new Intl.NumberFormat('ja-JP', {
    style: 'currency',
    currency: 'JPY',
  }).format(price);
}

/**
 * 発売日をフォーマット
 * 例: "2012-06-23" -> "2012年6月23日"
 */
export function formatPublicationDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * YouTubeサムネイルURLを生成
 * @param videoId YouTube動画ID
 * @param quality サムネイル品質（default, mqdefault, hqdefault, sddefault, maxresdefault）
 */
export function getYouTubeThumbnailUrl(videoId: string, quality: string = 'mqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * YouTube動画URLを生成
 * @param videoId YouTube動画ID
 */
export function getYouTubeVideoUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

/**
 * 安全にクエリパラメータを構築
 * @param params パラメータオブジェクト
 */
export function buildQueryParams(params: Record<string, string | number | undefined>): string {
  const urlParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      urlParams.append(key, value.toString());
    }
  });
  return urlParams.toString();
}

