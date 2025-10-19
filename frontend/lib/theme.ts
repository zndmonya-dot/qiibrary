'use client';

import { Theme, DEFAULT_THEME } from './constants';

/**
 * テーマをDOMに適用（ユーザー設定は保存しない）
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * 現在のテーマを取得（DOMから）
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? 'dark' : 'light';
}

/**
 * テーマを切り替え
 */
export function toggleTheme(): Theme {
  const current = getCurrentTheme();
  const newTheme: Theme = current === 'dark' ? 'light' : 'dark';
  applyTheme(newTheme);
  return newTheme;
}

/**
 * テーマを初期化（ページロード時に呼び出す）
 */
export function initTheme(): void {
  applyTheme(DEFAULT_THEME);
}
