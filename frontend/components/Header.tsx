'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { getCurrentTheme, applyTheme, watchSystemTheme } from '@/lib/theme';
import type { Theme } from '@/lib/constants';

export default function Header() {
  const [theme, setThemeState] = useState<Theme>('auto');
  const pathname = usePathname();

  useEffect(() => {
    // DOMから現在のテーマ設定を取得
    const current = getCurrentTheme();
    console.log('[Header] Initial theme:', current);
    setThemeState(current);
  }, []);

  useEffect(() => {
    // Autoモードの場合、システム設定の変更を監視
    if (theme === 'auto') {
      const unwatch = watchSystemTheme(() => {
        // システム設定が変更されたら再適用
        applyTheme('auto');
      });
      
      return unwatch;
    }
  }, [theme]);

  const handleThemeChange = (newTheme: Theme) => {
    console.log('[Header] User clicked theme button:', newTheme);
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
          
          {/* テーマスイッチャー - 3ボタン */}
          <div className="relative inline-flex items-center bg-qiita-surface dark:bg-dark-surface-light rounded-full p-0.5 md:p-1 h-8 md:h-10">
            {/* Sliding background */}
            <div
              className={`absolute top-0.5 md:top-1 bottom-0.5 md:bottom-1 left-0.5 md:left-1 w-[calc(33.333%-0.25rem)] bg-qiita-green dark:bg-dark-green rounded-full transition-transform duration-200 ease-out shadow-md ${
                theme === 'light' 
                  ? 'translate-x-0' 
                  : theme === 'auto'
                  ? 'translate-x-[calc(100%+0.25rem)]'
                  : 'translate-x-[calc(200%+0.5rem)]'
              }`}
            />
            
            {/* Buttons */}
            <button
              onClick={() => handleThemeChange('light')}
              className={`relative z-10 h-7 md:h-8 px-2 md:px-3 flex items-center justify-center gap-0.5 text-xs md:text-sm font-semibold rounded-full ${
                theme === 'light'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text'
              }`}
              title="ライトモード"
            >
              <i className="ri-sun-line text-sm md:text-base"></i>
              <span className="hidden lg:inline text-[10px] md:text-xs">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('auto')}
              className={`relative z-10 h-7 md:h-8 px-2 md:px-3 flex items-center justify-center gap-0.5 text-xs md:text-sm font-semibold rounded-full ${
                theme === 'auto'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text'
              }`}
              title="システム設定に従う"
            >
              <i className="ri-contrast-2-line text-sm md:text-base"></i>
              <span className="hidden lg:inline text-[10px] md:text-xs">Auto</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`relative z-10 h-7 md:h-8 px-2 md:px-3 flex items-center justify-center gap-0.5 text-xs md:text-sm font-semibold rounded-full ${
                theme === 'dark'
                  ? 'text-white'
                  : 'text-qiita-text dark:text-dark-text'
              }`}
              title="ダークモード"
            >
              <i className="ri-moon-line text-sm md:text-base"></i>
              <span className="hidden lg:inline text-[10px] md:text-xs">Dark</span>
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
