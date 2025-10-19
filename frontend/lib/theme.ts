'use client';

import { Theme, STORAGE_KEYS } from './constants';

/**
 * テーマをlocalStorageから取得
 */
export function getTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.THEME);
    if (stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (e) {
    console.error('Failed to get theme from localStorage:', e);
  }
  
  return 'system';
}

/**
 * テーマをlocalStorageに保存
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    applyTheme(theme);
    
    // カスタムイベントを発火してコンポーネントに通知
    window.dispatchEvent(new Event('themeChange'));
  } catch (e) {
    console.error('Failed to set theme to localStorage:', e);
  }
}

/**
 * テーマをDOMに適用
 */
function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    // system = ライトモード固定
    document.documentElement.classList.remove('dark');
  }
}

/**
 * テーマを初期化（ページロード時に呼び出す）
 */
export function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}

