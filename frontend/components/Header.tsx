'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getTheme, setTheme, type Theme } from '@/lib/theme';

export default function Header() {
  // 初期値をlocalStorageから直接取得（SSR対応）
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return getTheme();
    }
    return 'system';
  });

  useEffect(() => {
    // マウント時に一度だけテーマを確認
    const currentTheme = getTheme();
    if (currentTheme !== theme) {
      setThemeState(currentTheme);
    }
    
    // テーマ変更イベントをリッスン
    const handleThemeChangeEvent = () => {
      setThemeState(getTheme());
    };
    
    window.addEventListener('themeChange', handleThemeChangeEvent);
    
    return () => {
      window.removeEventListener('themeChange', handleThemeChangeEvent);
    };
  }, []); // 空の依存配列で初回のみ実行

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
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
          
          {/* テーマスイッチャー - Modern Toggle */}
          <div className="relative inline-flex items-center bg-qiita-surface dark:bg-dark-surface-light rounded-full p-1 h-10 transition-colors duration-300">
            {/* Sliding background */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.125rem)] bg-qiita-green dark:bg-dark-green rounded-full transition-transform duration-150 ease-out shadow-md ${
                theme === 'dark' ? 'translate-x-full' : 'translate-x-0'
              }`}
              style={{ willChange: 'transform' }}
            />
            
            {/* Buttons */}
            <button
              onClick={() => handleThemeChange('system')}
              className={`relative z-10 h-8 px-4 flex items-center justify-center gap-1 text-sm font-semibold rounded-full transition-colors duration-150 ${
                theme === 'system'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text hover:text-qiita-text-dark dark:hover:text-white'
              }`}
              title="ライトモード"
            >
              <i className="ri-sun-line text-base"></i>
              <span>Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`relative z-10 h-8 px-4 flex items-center justify-center gap-1 text-sm font-semibold rounded-full transition-colors duration-150 ${
                theme === 'dark'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text hover:text-qiita-text-dark dark:hover:text-white'
              }`}
              title="ダークモード"
            >
              <i className="ri-moon-line text-base"></i>
              <span>Dark</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
