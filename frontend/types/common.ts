/**
 * 共通型定義
 */

/**
 * ページネーション情報
 */
export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

/**
 * ローディング状態
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isFromCache?: boolean;
}

/**
 * 期間タイプ
 */
export type PeriodType = 'daily' | 'monthly' | 'yearly' | 'all' | 'year';

/**
 * ソート順
 */
export type SortOrder = 'asc' | 'desc';

/**
 * APIレスポンスの基本型
 */
export interface APIResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * エラーレスポンス
 */
export interface APIErrorResponse {
  error: string;
  statusCode: number;
  message?: string;
  details?: Record<string, any>;
}

