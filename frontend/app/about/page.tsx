'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { getLocale } from '@/lib/locale';

export default function AboutPage() {
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

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-youtube-dark-surface rounded-lg p-8 border border-youtube-dark-hover">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-information-line text-youtube-red"></i>
                BookTuberについて
              </h1>

              <div className="space-y-8 text-secondary leading-relaxed">
                {/* サイトの目的 */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-youtube-red"></i>
                    サイトの目的
                  </h2>
                  <p className="mb-3">
                    BookTuberは、YouTubeで紹介されたIT技術書をランキング形式で表示するサービスです。
                  </p>
                  <p className="mb-3">
                    技術書選びに迷ったとき、「YouTubeで人気の本は何だろう？」と思ったことはありませんか？
                    BookTuberは、そんな疑問を解決するために生まれました。
                  </p>
                  <p>
                    YouTubeのエンジニア系チャンネルで紹介された技術書を集計し、
                    今最も注目されている技術書をランキング形式でお届けします。
                  </p>
                </section>

                {/* 機能紹介 */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-function-line text-youtube-red"></i>
                    主な機能
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-trophy-line text-youtube-red"></i>
                        日次・月次・年次ランキング
                      </h3>
                      <p className="text-sm">
                        今日、今月、今年の人気技術書をそれぞれランキング形式で確認できます。
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-global-line text-youtube-red"></i>
                        日本語・英語対応
                      </h3>
                      <p className="text-sm">
                        日本語圏と英語圏の技術書を別々にランキング表示。地域に応じた情報を提供します。
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-youtube-line text-youtube-red"></i>
                        紹介動画へのリンク
                      </h3>
                      <p className="text-sm">
                        各書籍を紹介しているYouTube動画へ直接アクセスできます。
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-book-open-line text-youtube-red"></i>
                        詳細な書籍情報
                      </h3>
                      <p className="text-sm">
                        Amazon APIを使用し、価格、レビュー、出版日などの詳細情報を表示します。
                      </p>
                    </div>
                  </div>
                </section>

                {/* データソース */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-database-2-line text-youtube-red"></i>
                    データソース
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-youtube-line text-youtube-red text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-white mb-1">YouTube Data API v3</h3>
                        <p className="text-sm">
                          エンジニア系チャンネルの動画情報を取得し、
                          動画の説明欄やコメントからIT技術書の情報を抽出しています。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-amazon-line text-youtube-red text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Amazon Product Advertising API</h3>
                        <p className="text-sm">
                          書籍の詳細情報（価格、画像、レビューなど）をAmazon APIから取得しています。
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 更新頻度 */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-refresh-line text-youtube-red"></i>
                    更新頻度
                  </h2>
                  <p className="mb-2">ランキングデータは以下の頻度で更新されます：</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="ri-time-line text-youtube-red"></i>
                      <span><strong>日次ランキング:</strong> 毎日午前3時（JST）に更新</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-calendar-line text-youtube-red"></i>
                      <span><strong>月次ランキング:</strong> 毎月1日に更新</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-calendar-check-line text-youtube-red"></i>
                      <span><strong>年次ランキング:</strong> 毎年1月1日に更新</span>
                    </li>
                  </ul>
                </section>

                {/* 技術スタック */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-code-box-line text-youtube-red"></i>
                    技術スタック
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">フロントエンド</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Next.js 14 (App Router)</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• Remix Icon</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">バックエンド</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• FastAPI (Python)</li>
                        <li>• PostgreSQL</li>
                        <li>• Redis</li>
                        <li>• Celery</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* 作成者情報 */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-youtube-red"></i>
                    作成者について
                  </h2>
                  <p className="mb-4">
                    このサイトは、技術書好きなエンジニアによって個人で運営されています。
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://twitter.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                    >
                      <i className="ri-twitter-x-line text-xl"></i>
                      <span>X (Twitter)</span>
                    </a>
                    <a
                      href="https://github.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                    >
                      <i className="ri-github-line text-xl"></i>
                      <span>GitHub</span>
                    </a>
                  </div>
                </section>

                {/* お問い合わせ */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-mail-line text-youtube-red"></i>
                    お問い合わせ
                  </h2>
                  <p className="mb-3">
                    ご質問、ご要望、バグ報告などがございましたら、お気軽にお問い合わせください。
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 btn-youtube"
                  >
                    <i className="ri-mail-send-line"></i>
                    お問い合わせページへ
                  </a>
                </section>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-information-line text-youtube-red"></i>
                About BookTuber
              </h1>

              <div className="space-y-8 text-secondary leading-relaxed">
                {/* Purpose */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-youtube-red"></i>
                    Our Purpose
                  </h2>
                  <p className="mb-3">
                    BookTuber is a service that displays IT technical books featured on YouTube in a ranking format.
                  </p>
                  <p className="mb-3">
                    Ever wondered "What books are popular on YouTube?" when choosing technical books?
                    BookTuber was created to answer that question.
                  </p>
                  <p>
                    We aggregate technical books introduced on engineering YouTube channels
                    and deliver the most notable technical books in a ranking format.
                  </p>
                </section>

                {/* Features */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-function-line text-youtube-red"></i>
                    Main Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-trophy-line text-youtube-red"></i>
                        Daily, Monthly, Yearly Rankings
                      </h3>
                      <p className="text-sm">
                        Check popular technical books for today, this month, and this year in ranking format.
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-global-line text-youtube-red"></i>
                        Japanese & English Support
                      </h3>
                      <p className="text-sm">
                        Separate rankings for Japanese and English technical books, providing region-specific information.
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-youtube-line text-youtube-red"></i>
                        Links to Featured Videos
                      </h3>
                      <p className="text-sm">
                        Direct access to YouTube videos featuring each book.
                      </p>
                    </div>
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-4 border border-youtube-dark-surface/50">
                      <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                        <i className="ri-book-open-line text-youtube-red"></i>
                        Detailed Book Information
                      </h3>
                      <p className="text-sm">
                        Using Amazon API to display detailed information including price, reviews, and publication date.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Sources */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-database-2-line text-youtube-red"></i>
                    Data Sources
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-youtube-line text-youtube-red text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-white mb-1">YouTube Data API v3</h3>
                        <p className="text-sm">
                          We retrieve video information from engineering channels
                          and extract IT technical book information from video descriptions and comments.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-amazon-line text-youtube-red text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-white mb-1">Amazon Product Advertising API</h3>
                        <p className="text-sm">
                          We retrieve detailed book information (price, images, reviews, etc.) from Amazon API.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Update Frequency */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-refresh-line text-youtube-red"></i>
                    Update Frequency
                  </h2>
                  <p className="mb-2">Ranking data is updated at the following intervals:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="ri-time-line text-youtube-red"></i>
                      <span><strong>Daily Rankings:</strong> Updated daily at 3:00 AM JST</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-calendar-line text-youtube-red"></i>
                      <span><strong>Monthly Rankings:</strong> Updated on the 1st of each month</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-calendar-check-line text-youtube-red"></i>
                      <span><strong>Yearly Rankings:</strong> Updated on January 1st each year</span>
                    </li>
                  </ul>
                </section>

                {/* Tech Stack */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-code-box-line text-youtube-red"></i>
                    Tech Stack
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Frontend</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Next.js 14 (App Router)</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• Remix Icon</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">Backend</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• FastAPI (Python)</li>
                        <li>• PostgreSQL</li>
                        <li>• Redis</li>
                        <li>• Celery</li>
                      </ul>
                    </div>
                  </div>
                </section>

                {/* Creator */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-youtube-red"></i>
                    About the Creator
                  </h2>
                  <p className="mb-4">
                    This site is individually operated by an engineer who loves technical books.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href="https://twitter.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                    >
                      <i className="ri-twitter-x-line text-xl"></i>
                      <span>X (Twitter)</span>
                    </a>
                    <a
                      href="https://github.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                    >
                      <i className="ri-github-line text-xl"></i>
                      <span>GitHub</span>
                    </a>
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-mail-line text-youtube-red"></i>
                    Contact
                  </h2>
                  <p className="mb-3">
                    If you have questions, requests, or bug reports, please feel free to contact us.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 btn-youtube"
                  >
                    <i className="ri-mail-send-line"></i>
                    Go to Contact Page
                  </a>
                </section>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

