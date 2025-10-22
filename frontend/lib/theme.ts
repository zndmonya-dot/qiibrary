'use client';

import { Theme, DEFAULT_THEME } from './constants';

const THEME_STORAGE_KEY = 'qiibrary-theme';

/**
 * ローカルストレージからテーマを読み込む
 */
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch (e) {
    // ローカルストレージが使えない場合は無視
  }
  
  return null;
}

/**
 * ローカルストレージにテーマを保存
 */
function saveTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    // ローカルストレージが使えない場合は無視
  }
}

/**
 * テーマをDOMに適用してローカルストレージに保存
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // ローカルストレージに保存
  saveTheme(theme);
}

/**
 * 現在のテーマを取得（ローカルストレージ → DOM の順）
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  // まずローカルストレージから取得
  const stored = getStoredTheme();
  if (stored) return stored;
  
  // なければDOMから取得
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
 * ローカルストレージに保存された設定があればそれを使用
 */
export function initTheme(): void {
  const stored = getStoredTheme();
  const theme = stored || DEFAULT_THEME;
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
