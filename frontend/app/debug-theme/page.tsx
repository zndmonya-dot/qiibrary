'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function DebugThemePage() {
  const [systemTheme, setSystemTheme] = useState<string>('checking...');
  const [mediaQueryMatches, setMediaQueryMatches] = useState<boolean | null>(null);
  const [storedTheme, setStoredTheme] = useState<string>('checking...');
  const [htmlHasDarkClass, setHtmlHasDarkClass] = useState<boolean>(false);
  const [mediaQuerySupported, setMediaQuerySupported] = useState<boolean>(true);

  useEffect(() => {
    // 1. メディアクエリのサポート確認
    const supported = typeof window !== 'undefined' && 'matchMedia' in window;
    setMediaQuerySupported(supported);

    if (!supported) {
      setSystemTheme('Media Query not supported');
      return;
    }

    // 2. システムのカラースキーム設定を取得
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');
    
    setMediaQueryMatches(darkModeQuery.matches);
    
    if (darkModeQuery.matches) {
      setSystemTheme('dark (OS設定: ダークモード)');
    } else if (lightModeQuery.matches) {
      setSystemTheme('light (OS設定: ライトモード)');
    } else {
      setSystemTheme('no-preference (OS設定なし)');
    }

    // 3. localStorageの値を確認
    const stored = localStorage.getItem('qiibrary-theme');
    setStoredTheme(stored || 'null (未設定)');

    // 4. HTMLタグのクラスを確認
    const hasDark = document.documentElement.classList.contains('dark');
    setHtmlHasDarkClass(hasDark);

    // 5. システム設定の変更を監視
    const listener = (e: MediaQueryListEvent) => {
      setMediaQueryMatches(e.matches);
      setSystemTheme(e.matches ? 'dark (OS設定: ダークモード)' : 'light (OS設定: ライトモード)');
    };

    darkModeQuery.addEventListener('change', listener);

    return () => darkModeQuery.removeEventListener('change', listener);
  }, []);

  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-qiita-green dark:text-dark-green hover:underline mb-8 inline-block">
          ← トップに戻る
        </Link>

        <h1 className="text-3xl font-bold text-qiita-text-dark dark:text-white mb-8">
          テーマ設定デバッグ
        </h1>

        <div className="space-y-6">
          {/* 1. メディアクエリのサポート */}
          <div className="bg-qiita-card dark:bg-dark-surface p-6 rounded-lg border border-qiita-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4">
              1. メディアクエリのサポート
            </h2>
            <div className="space-y-2">
              <p className="text-qiita-text dark:text-dark-text">
                <span className="font-semibold">window.matchMedia:</span>{' '}
                <span className={mediaQuerySupported ? 'text-green-600' : 'text-red-600'}>
                  {mediaQuerySupported ? '✅ サポートされています' : '❌ サポートされていません'}
                </span>
              </p>
            </div>
          </div>

          {/* 2. OSのカラースキーム設定 */}
          <div className="bg-qiita-card dark:bg-dark-surface p-6 rounded-lg border border-qiita-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4">
              2. OSのカラースキーム設定
            </h2>
            <div className="space-y-2">
              <p className="text-qiita-text dark:text-dark-text">
                <span className="font-semibold">prefers-color-scheme:</span>{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {systemTheme}
                </span>
              </p>
              <p className="text-qiita-text dark:text-dark-text">
                <span className="font-semibold">matchMedia('(prefers-color-scheme: dark)').matches:</span>{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {mediaQueryMatches === null ? 'checking...' : mediaQueryMatches.toString()}
                </span>
              </p>
            </div>
          </div>

          {/* 3. localStorage */}
          <div className="bg-qiita-card dark:bg-dark-surface p-6 rounded-lg border border-qiita-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4">
              3. localStorage
            </h2>
            <div className="space-y-2">
              <p className="text-qiita-text dark:text-dark-text">
                <span className="font-semibold">qiibrary-theme:</span>{' '}
                <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                  {storedTheme}
                </span>
              </p>
              <button
                onClick={() => {
                  localStorage.removeItem('qiibrary-theme');
                  setStoredTheme('null (削除しました)');
                  setTimeout(() => location.reload(), 1000);
                }}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                localStorageをクリア（1秒後にリロード）
              </button>
            </div>
          </div>

          {/* 4. 現在のDOM状態 */}
          <div className="bg-qiita-card dark:bg-dark-surface p-6 rounded-lg border border-qiita-border dark:border-dark-border">
            <h2 className="text-xl font-bold text-qiita-text-dark dark:text-white mb-4">
              4. 現在のDOM状態
            </h2>
            <div className="space-y-2">
              <p className="text-qiita-text dark:text-dark-text">
                <span className="font-semibold">{'<html class="dark">'}:</span>{' '}
                <span className={htmlHasDarkClass ? 'text-yellow-600' : 'text-blue-600'}>
                  {htmlHasDarkClass ? '✅ dark クラスあり（ダークモード）' : '❌ dark クラスなし（ライトモード）'}
                </span>
              </p>
            </div>
          </div>

          {/* 5. 期待される動作 */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-300 mb-4">
              📋 期待される動作
            </h2>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
              <p>
                <strong>OSがライトモードの場合:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>prefers-color-scheme: light (OS設定: ライトモード)</li>
                <li>matchMedia.matches: false</li>
                <li>Auto選択時、サイトはライトモードで表示される</li>
              </ul>
              <p className="mt-4">
                <strong>OSがダークモードの場合:</strong>
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>prefers-color-scheme: dark (OS設定: ダークモード)</li>
                <li>matchMedia.matches: true</li>
                <li>Auto選択時、サイトはダークモードで表示される</li>
              </ul>
            </div>
          </div>

          {/* Windowsの設定方法 */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-300 mb-4">
              💡 Windowsでのテーマ設定方法
            </h2>
            <div className="text-sm text-yellow-800 dark:text-yellow-200 space-y-2">
              <p><strong>Windows 10/11:</strong></p>
              <ol className="list-decimal list-inside ml-4 space-y-1">
                <li>設定 → 個人用設定 → 色</li>
                <li>「色を選択する」で「ライト」または「ダーク」を選択</li>
                <li>ブラウザをリロード</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

