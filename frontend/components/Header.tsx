'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { applySystemTheme, watchSystemTheme } from '@/lib/theme';

export default function Header() {
  const pathname = usePathname();

  useEffect(() => {
    // OSのテーマ設定を適用
    applySystemTheme();
    
    // システム設定の変更を監視
    const unwatch = watchSystemTheme(applySystemTheme);
    
    return unwatch;
  }, []);

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
        </nav>
      </div>
    </header>
  );
}
