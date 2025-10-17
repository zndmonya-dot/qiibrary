'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getLocale, t } from '@/lib/locale';

export default function Footer() {
  const [locale, setLocaleState] = useState<'ja' | 'en'>('ja');

  useEffect(() => {
    setLocaleState(getLocale());
    
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-youtube-dark-surface border-t-2 border-youtube-dark-hover mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* About Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="ri-book-2-line text-youtube-red text-2xl"></i>
              <span className="text-white">BookTube</span>
            </h3>
            <p className="text-sm text-secondary leading-relaxed">
              {locale === 'ja' 
                ? 'YouTubeで紹介されたIT技術書をランキング形式で紹介するサービスです。'
                : 'A service that ranks IT technical books featured on YouTube.'}
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              {locale === 'ja' ? '法的情報' : 'Legal'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-secondary hover:text-youtube-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  <i className="ri-shield-check-line text-youtube-dark-text-secondary group-hover:text-youtube-red transition-colors duration-200"></i>
                  <span>{locale === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-secondary hover:text-youtube-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  <i className="ri-file-text-line text-youtube-dark-text-secondary group-hover:text-youtube-red transition-colors duration-200"></i>
                  <span>{locale === 'ja' ? '利用規約' : 'Terms of Service'}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal" 
                  className="text-secondary hover:text-youtube-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  <i className="ri-scales-3-line text-youtube-dark-text-secondary group-hover:text-youtube-red transition-colors duration-200"></i>
                  <span>{locale === 'ja' ? '特定商取引法' : 'Transaction Act'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Site Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              {locale === 'ja' ? 'サイト情報' : 'Site Info'}
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-secondary hover:text-youtube-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  <i className="ri-information-line text-youtube-dark-text-secondary group-hover:text-youtube-red transition-colors duration-200"></i>
                  <span>{locale === 'ja' ? 'このサイトについて' : 'About'}</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-secondary hover:text-youtube-red transition-colors duration-200 flex items-center gap-2 group"
                >
                  <i className="ri-mail-line text-youtube-dark-text-secondary group-hover:text-youtube-red transition-colors duration-200"></i>
                  <span>{locale === 'ja' ? 'お問い合わせ' : 'Contact'}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              {locale === 'ja' ? 'フォロー' : 'Follow Us'}
            </h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/your_account"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-youtube-dark-bg border border-youtube-dark-hover hover:border-youtube-red hover:bg-youtube-red rounded-lg flex items-center justify-center transition-all duration-200 group"
                aria-label="X (Twitter)"
              >
                <i className="ri-twitter-x-line text-xl text-secondary group-hover:text-white transition-colors duration-200"></i>
              </a>
              <a
                href="https://github.com/your_account"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-youtube-dark-bg border border-youtube-dark-hover hover:border-youtube-red hover:bg-youtube-red rounded-lg flex items-center justify-center transition-all duration-200 group"
                aria-label="GitHub"
              >
                <i className="ri-github-line text-xl text-secondary group-hover:text-white transition-colors duration-200"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-youtube-dark-hover">
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-secondary">
            <div className="flex items-center gap-2">
              <i className="ri-copyright-line"></i>
              <span>{currentYear} BookTube. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="ri-amazon-line text-youtube-red"></i>
              <span>
                {locale === 'ja' 
                  ? 'Amazonアソシエイト・プログラム参加者'
                  : 'Amazon Associates Program Participant'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

