'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLocale, setLocale, t, type Locale } from '@/lib/locale';

export default function Header() {
  const [locale, setLocaleState] = useState<Locale>('ja');

  useEffect(() => {
    setLocaleState(getLocale());
    
    // 言語変更イベントをリッスン
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  };

  return (
    <header className="sticky top-0 z-50 bg-youtube-dark-bg border-b border-youtube-dark-surface">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" prefetch={true} className="flex items-center space-x-2 transition-opacity duration-200 hover:opacity-80">
              <i className="ri-book-2-line text-2xl text-youtube-red"></i>
              <h1 className="text-xl font-bold">
                <span className="text-youtube-red">Book</span>
                <span className="text-white">Tube</span>
              </h1>
            </Link>
        
        <nav className="flex items-center space-x-6">
          <Link 
            href="/" 
            prefetch={true}
            className="text-youtube-dark-text-secondary hover:text-white transition-colors duration-200"
          >
            {t('rankings')}
          </Link>
          <Link 
            href="/about" 
            prefetch={true}
            className="text-youtube-dark-text-secondary hover:text-white transition-colors duration-200"
          >
            {t('about')}
          </Link>
          
              {/* Language Switcher - Modern Toggle */}
              <div className="relative inline-flex items-center bg-youtube-dark-hover rounded-full p-1 h-10">
                {/* Sliding background */}
                <div
                  className={`absolute top-1 bottom-1 left-1 w-[calc(50%-0.125rem)] bg-youtube-red rounded-full transition-all duration-300 ease-in-out shadow-md ${
                    locale === 'en' ? 'translate-x-full' : 'translate-x-0'
                  }`}
                  style={{ willChange: 'transform' }}
                />
                
                {/* Buttons */}
                <button
                  onClick={() => handleLocaleChange('ja')}
                  className={`relative z-10 h-8 px-4 flex items-center justify-center gap-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                    locale === 'ja'
                      ? 'text-white'
                      : 'text-youtube-dark-text-secondary hover:text-white'
                  }`}
                >
                  <i className="ri-global-line text-base"></i>
                  <span>JP</span>
                </button>
                <button
                  onClick={() => handleLocaleChange('en')}
                  className={`relative z-10 h-8 px-4 flex items-center justify-center gap-1 text-sm font-medium rounded-full transition-colors duration-200 ${
                    locale === 'en'
                      ? 'text-white'
                      : 'text-youtube-dark-text-secondary hover:text-white'
                  }`}
                >
                  <i className="ri-global-line text-base"></i>
                  <span>EN</span>
                </button>
              </div>
        </nav>
      </div>
    </header>
  );
}

