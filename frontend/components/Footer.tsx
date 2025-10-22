'use client';

import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-qiita-footer dark:bg-[#2f3232] border-t-2 border-qiita-footer dark:border-dark-border mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          {/* About Section */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <i className="ri-book-2-line text-qiita-green dark:text-dark-green text-2xl"></i>
              <span className="text-white">Qiibrary</span>
            </h3>
            <p className="text-sm text-gray-300 dark:text-dark-text leading-relaxed">
              Qiitaで話題のIT技術書をランキング形式でまとめたサービスです。
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              法的情報
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/privacy" 
                  className="text-gray-300 hover-text-white flex items-center gap-2"
                >
                  <i className="ri-shield-check-line text-gray-400"></i>
                  <span>プライバシーポリシー</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-gray-300 hover-text-white flex items-center gap-2"
                >
                  <i className="ri-file-text-line text-gray-400"></i>
                  <span>利用規約</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/legal" 
                  className="text-gray-300 hover-text-white flex items-center gap-2"
                >
                  <i className="ri-scales-3-line text-gray-400"></i>
                  <span>特定商取引法</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Site Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              サイト情報
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  href="/about" 
                  className="text-gray-300 hover-text-white flex items-center gap-2"
                >
                  <i className="ri-information-line text-gray-400"></i>
                  <span>このサイトについて</span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact" 
                  className="text-gray-300 hover-text-white flex items-center gap-2"
                >
                  <i className="ri-mail-line text-gray-400"></i>
                  <span>お問い合わせ</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-bold mb-4 text-white uppercase tracking-wider">
              フォロー
            </h4>
            <div className="flex gap-3">
              <a
                href="https://twitter.com/your_account"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-700 hover-footer-icon rounded-lg flex items-center justify-center"
                aria-label="X (Twitter)"
              >
                <i className="ri-twitter-x-line text-xl text-white"></i>
              </a>
              <a
                href="https://github.com/your_account"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 bg-gray-700 hover-footer-icon rounded-lg flex items-center justify-center"
                aria-label="GitHub"
              >
                <i className="ri-github-line text-xl text-white"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Amazon Associates Disclosure */}
        <div className="pt-8 pb-6 border-t border-gray-600">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-4 border-t border-gray-600">
          <div className="flex justify-center items-center gap-2 text-xs text-gray-400">
            <i className="ri-copyright-line"></i>
            <span>{currentYear} Qiibrary. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
