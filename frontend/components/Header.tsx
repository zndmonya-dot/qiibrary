'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getCurrentTheme, toggleTheme } from '@/lib/theme';
import type { Theme } from '@/lib/constants';

export default function Header() {
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    // DOMから現在のテーマを取得
    setThemeState(getCurrentTheme());
  }, []);

  const handleToggleTheme = () => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
  };

  return (
    <header className="sticky top-0 z-50 bg-qiita-card/95 dark:bg-dark-header-footer/95 backdrop-blur-md border-b border-qiita-border dark:border-dark-border shadow-sm transition-colors duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" prefetch={true} className="flex items-center space-x-2 transition-opacity duration-150 hover:opacity-90">
              <i className="ri-book-2-line text-2xl text-qiita-green dark:text-dark-green"></i>
              <h1 className="text-xl font-bold">
                <span className="text-qiita-green dark:text-dark-green">Book</span>
                <span className="text-qiita-text dark:text-dark-text">Tuber</span>
              </h1>
            </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            href="/" 
            prefetch={true}
            className="text-qiita-text dark:text-dark-text hover:text-qiita-text-dark dark:hover:text-white transition-colors duration-150 font-semibold"
          >
            ランキング
          </Link>
          <Link 
            href="/about" 
            prefetch={true}
            className="text-qiita-text dark:text-dark-text hover:text-qiita-text-dark dark:hover:text-white transition-colors duration-150 font-semibold"
          >
            このサイトについて
          </Link>
          
          {/* テーマトグルボタン - シンプルなクリックで反転 */}
          <button
            onClick={handleToggleTheme}
            className="relative flex items-center justify-center gap-2 px-4 py-2 bg-qiita-surface dark:bg-dark-surface-light rounded-full transition-all duration-200 hover:bg-qiita-green/10 dark:hover:bg-dark-green/20 group"
            title={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
          >
            {/* アイコン - ダークモードの時は太陽、ライトモードの時は月 */}
            {theme === 'dark' ? (
              <i className="ri-sun-line text-xl text-qiita-green dark:text-dark-green transition-transform duration-200 group-hover:scale-110"></i>
            ) : (
              <i className="ri-moon-line text-xl text-qiita-green dark:text-dark-green transition-transform duration-200 group-hover:scale-110"></i>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
