/**
 * エラーハンドリングユーティリティ
 */

export interface APIError {
  message: string;
  statusCode?: number;
  code?: string;
}

/**
 * APIエラーから人間が読めるメッセージを生成
 */
export function getErrorMessage(err: any): string {
  if (err.response?.status === 429) {
    return 'アクセスが集中しています。しばらく待ってから再試行してください。';
  }
  
  if (err.response?.status === 500) {
    return 'サーバーエラーが発生しました。しばらく待ってから再試行してください。';
  }
  
  if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
    return '接続がタイムアウトしました。ネットワーク接続を確認してください。';
  }
  
  if (!navigator.onLine) {
    return 'インターネット接続がありません。接続を確認してください。';
  }
  
  if (err.response?.status === 404) {
    return 'データが見つかりませんでした。';
  }
  
  if (err.response?.status === 403) {
    return 'アクセスが拒否されました。';
  }
  
  // デフォルトメッセージ
  return err.message || 'エラーが発生しました。ページを再読み込みしてください。';
}

/**
 * エラーをログに記録（本番環境ではSentryなどに送信）
 */
export function logError(error: any, context?: string): void {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', errorInfo);
  }
  
  // 本番環境では Sentry などに送信
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { contexts: { custom: errorInfo } });
  // }
}

