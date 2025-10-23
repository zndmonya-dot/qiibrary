'use client';

/**
 * システムのカラースキーム設定を取得
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch (e) {
    return 'dark';
  }
}

/**
 * OSのテーマ設定をDOMに適用
 */
export function applySystemTheme(): void {
  const theme = getSystemTheme();
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * システム設定の変更を監視
 * @param callback システム設定が変更されたときに呼ばれる関数
 * @returns クリーンアップ関数
 */
export function watchSystemTheme(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = () => callback();
    
    mediaQuery.addEventListener('change', listener);
    
    return () => mediaQuery.removeEventListener('change', listener);
  } catch (e) {
    return () => {};
  }
}
