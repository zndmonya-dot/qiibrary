'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentTheme, applyTheme } from '@/lib/theme';
import type { Theme } from '@/lib/constants';

export default function Header() {
  const [theme, setThemeState] = useState<Theme>('dark');
  const pathname = usePathname();

  useEffect(() => {
    // DOMから現在のテーマを取得
    setThemeState(getCurrentTheme());
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // トップページにいる場合はページトップにスクロール
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-qiita-card/95 dark:bg-[#2f3232]/95 backdrop-blur-md border-b border-qiita-border dark:border-dark-border shadow-sm">
      <div className="container mx-auto px-2 md:px-4 py-2 md:py-3 flex items-center justify-between">
            <Link href="/" prefetch={true} onClick={handleLogoClick} className="flex items-center space-x-1.5 md:space-x-2">
              <i className="ri-book-2-line text-xl md:text-2xl text-qiita-green dark:text-dark-green"></i>
              <h1 className="text-lg md:text-xl font-bold">
                <span className="text-qiita-green dark:text-dark-green">Qii</span>
                <span className="text-qiita-text dark:text-dark-text">brary</span>
              </h1>
            </Link>
        
        <nav className="flex items-center space-x-3 md:space-x-6">
          <Link 
            href="/about" 
            prefetch={true}
            className="hidden md:block text-qiita-text dark:text-dark-text font-semibold"
          >
            このサイトについて
          </Link>
          
          {/* テーマスイッチャー - 2ボタン */}
          <div className="relative inline-flex items-center bg-qiita-surface dark:bg-dark-surface-light rounded-full p-0.5 md:p-1 h-8 md:h-10">
            {/* Sliding background */}
            <div
              className={`absolute top-0.5 md:top-1 bottom-0.5 md:bottom-1 left-0.5 md:left-1 w-[calc(50%-0.125rem)] bg-qiita-green dark:bg-dark-green rounded-full transition-transform duration-150 ease-out shadow-md ${
                theme === 'dark' ? 'translate-x-full' : 'translate-x-0'
              }`}
            />
            
            {/* Buttons */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`relative z-10 h-7 md:h-8 px-2 md:px-4 flex items-center justify-center gap-0.5 md:gap-1 text-xs md:text-sm font-semibold rounded-full ${
                theme === 'light'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text'
              }`}
              title="ライトモード"
            >
              <i className="ri-sun-line text-sm md:text-base"></i>
              <span className="hidden sm:inline">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`relative z-10 h-7 md:h-8 px-2 md:px-4 flex items-center justify-center gap-0.5 md:gap-1 text-xs md:text-sm font-semibold rounded-full ${
                theme === 'dark'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text'
              }`}
              title="ダークモード"
            >
              <i className="ri-moon-line text-sm md:text-base"></i>
              <span className="hidden sm:inline">Dark</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
