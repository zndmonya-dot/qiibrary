'use client';

import { Theme, DEFAULT_THEME } from './constants';

const THEME_STORAGE_KEY = 'qiibrary-theme';

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
 * ローカルストレージからテーマを読み込む
 */
function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'auto') {
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
  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  
  // ローカルストレージに保存
  saveTheme(theme);
}

/**
 * 現在のテーマ設定を取得（auto含む）
 */
export function getCurrentTheme(): Theme {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  
  // ローカルストレージから取得（auto, light, dark）
  const stored = getStoredTheme();
  return stored || DEFAULT_THEME;
}

/**
 * 実効的なテーマを取得（autoの場合はシステム設定を返す）
 */
export function getEffectiveTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  
  const theme = getCurrentTheme();
  if (theme === 'auto') {
    return getSystemTheme();
  }
  return theme;
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
  const effectiveTheme = theme === 'auto' ? getSystemTheme() : theme;
  
  if (effectiveTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * システム設定の変更を監視
 */
export function watchSystemTheme(callback: (theme: 'light' | 'dark') => void): () => void {
  if (typeof window === 'undefined') return () => {};
  
  try {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      callback(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', listener);
    
    // クリーンアップ関数を返す
    return () => mediaQuery.removeEventListener('change', listener);
  } catch (e) {
    return () => {};
  }
}
