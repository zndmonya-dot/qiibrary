'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      {/* Scanline Effect */}
      <div className="crt-flicker"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl relative z-10">
        <div className="bg-black border-2 border-green-500 p-6 md:p-8 shadow-[4px_4px_0_#39ff14]">
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-green-900">
            <h1 className="text-2xl md:text-3xl font-pixel mb-3 flex items-center gap-3 text-green-500 text-shadow-glow">
              <i className="ri-information-line text-3xl md:text-4xl"></i>
              ABOUT QIibrary
            </h1>
            <p className="text-sm text-gray-500 font-pixel">
              SYSTEM INFO
            </p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            {/* サービス概要 */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-lightbulb-line"></i>
                SERVICE OVERVIEW
              </h2>
              <div className="bg-gray-900 border border-gray-800 p-5 space-y-4 text-sm">
                <p className="text-base text-gray-200">
                  Qiibraryは、Qiitaで扱われた技術書の言及データを整理し、選書や研修計画の判断材料を素早く揃えられるようにしたリサーチサービスです。
                  現場で支持される書籍を短時間で把握し、学習計画や推奨図書の更新に伴う検証コストを下げることを目的としています。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-cyan-800 bg-cyan-900/20">
                    <p className="font-pixel text-cyan-400 mb-1 text-xs">QUICK DECISION</p>
                    <p className="text-sm text-gray-300">
                      24時間・30日・365日・年別・全期間の指標を切り替え、短期トレンドと長期定番を同時に確認できます。
                    </p>
                  </div>
                  <div className="p-4 border border-pink-800 bg-pink-900/20">
                    <p className="font-pixel text-pink-400 mb-1 text-xs">DATA EVIDENCE</p>
                    <p className="text-sm text-gray-300">
                      初出日・最新言及日・累計言及数を併記し、書籍の熟成度や勢いを数値で添えて提案できます。
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-400">
                  主な利用シーンとしては、新人研修の教材選定、スキルアップ施策の企画、個人の学習計画づくり、書店での棚づくり検討などを想定しています。
                </p>
              </div>
            </section>

            {/* 主な機能 */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-function-line"></i>
                FEATURES
              </h2>
              <div className="space-y-3 text-sm">
                <div className="bg-gray-900 border border-gray-800 p-4 hover:border-green-500 transition-colors">
                  <p className="font-pixel text-green-400 mb-1 text-xs">► PERIOD RANKING</p>
                  <p className="text-gray-300">24時間・30日・365日・年別・全期間を切り替え、目的に応じた視点で比較できます。</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 hover:border-green-500 transition-colors">
                  <p className="font-pixel text-green-400 mb-1 text-xs">► SEARCH</p>
                  <p className="text-gray-300">書籍名・著者名・出版社・ISBNのいずれでも検索でき、必要な書籍に迅速にアクセスできます。</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 hover:border-green-500 transition-colors">
                  <p className="font-pixel text-green-400 mb-1 text-xs">► ARTICLE LINKS</p>
                  <p className="text-gray-300">ランキングからQiita記事へ遷移し、実際の使用事例や背景を確認できます。</p>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4 hover:border-green-500 transition-colors">
                  <p className="font-pixel text-green-400 mb-1 text-xs">► BOOK PROFILE</p>
                  <p className="text-gray-300">著者・出版社・出版日などの基本情報を一画面に集約し、チーム内共有に適した形式で提示します。</p>
                </div>
              </div>
            </section>

            {/* データソース */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-database-2-line"></i>
                DATA SOURCES
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-900 border border-gray-800 p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-article-line text-green-500 text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-pixel text-green-400 mb-1 text-sm">QIITA API</h3>
                      <p className="text-sm text-gray-300">
                        Qiitaの技術記事から書籍情報（ISBN、Amazon ASIN）を抽出し、記事のいいね数やストック数、タグ情報も取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-book-2-line text-cyan-500 text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-pixel text-cyan-400 mb-1 text-sm">OPENBD API</h3>
                      <p className="text-sm text-gray-300">
                        日本の書籍データベースopenBDから、書籍の基本情報（タイトル、著者、出版社など）を取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-900 border border-gray-800 p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-book-line text-pink-500 text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-pixel text-pink-400 mb-1 text-sm">GOOGLE BOOKS API</h3>
                      <p className="text-sm text-gray-300">
                        書籍の詳細情報や表紙画像を補完的に取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-900/30 border border-yellow-700 p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-amazon-line text-yellow-500 text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-pixel text-yellow-400 mb-1 text-sm flex items-center gap-2">
                        AMAZON PA API
                        <span className="text-[10px] bg-yellow-800 px-2 py-0.5">PENDING</span>
                      </h3>
                      <p className="text-sm text-yellow-300/70">
                        現在、Amazonアソシエイト・プログラムの審査中です。
                        審査承認後は、より正確な書籍情報と価格情報を提供する予定です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* データの新鮮さと信頼性 */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-shield-check-line"></i>
                DATA QUALITY
              </h2>
              <div className="bg-gray-900 border border-gray-800 p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <i className="ri-time-line text-green-500 text-lg"></i>
                  <div>
                    <p className="font-pixel text-green-400 text-xs">DAILY UPDATE</p>
                    <p className="text-gray-300">毎日00:00（日本時間）に前日分のQiita記事を取り込み、ランキングへ反映します。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-database-line text-green-500 text-lg"></i>
                  <div>
                    <p className="font-pixel text-green-400 text-xs">AUTO CHECK</p>
                    <p className="text-gray-300">書籍ごとの初出日・最新言及日・累計件数を定期的に再計算し、欠損や異常値があれば公開前に弾いています。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* 運営について */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-user-line"></i>
                OPERATOR
              </h2>
              <div className="bg-gray-900 border border-gray-800 p-5">
                <p className="mb-4 text-gray-300">
                  Qiibraryは国内在住のソフトウェアエンジニアが個人事業として運営しています。
                  データ収集・審査・お問い合わせ対応まで一貫して担当し、透明性の高い改善サイクルを維持しています。
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://x.com/Rasenooon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-gray-800 text-gray-300 px-4 py-2.5 border border-gray-700 hover:border-green-500 hover:text-green-400 transition-colors font-pixel text-xs"
                  >
                    <i className="ri-twitter-x-line text-lg"></i>
                    X (Twitter)
                  </a>
                </div>
              </div>
            </section>

            {/* お問い合わせ */}
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900 flex items-center gap-2">
                <i className="ri-mail-line"></i>
                CONTACT
              </h2>
              <div className="bg-gray-900 border border-gray-800 p-5">
                <p className="mb-4 text-gray-300">
                  ご質問、ご要望、バグ報告、掲載内容に関するお問い合わせなど、お気軽にご連絡ください。
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2.5 font-pixel text-xs border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
                >
                  <i className="ri-mail-send-line"></i>
                  CONTACT PAGE
                </Link>
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-green-900 text-sm text-gray-500">
            <div className="flex items-center justify-between font-pixel text-xs">
              <div>LAST UPDATE: 2025.11.20</div>
              <Link href="/" className="text-green-500 hover:text-green-400 flex items-center gap-1">
                <i className="ri-home-line"></i>
                HOME
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
