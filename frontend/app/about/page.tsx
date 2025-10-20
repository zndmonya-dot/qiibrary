'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-information-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              Qiibraryについて
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              About Qiibrary
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            {/* サイトの目的 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-lightbulb-line text-qiita-green dark:text-dark-green"></i>
                サイトの目的
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5">
                <p className="mb-3">
                  Qiibraryは、<span className="font-semibold text-qiita-text-dark dark:text-white">Qiita記事で言及されたIT技術書をランキング形式で表示する</span>サービスです。
                </p>
                <p className="mb-3">
                  技術書選びに迷ったとき、「Qiitaで人気の本は何だろう？」と思ったことはありませんか？
                  Qiibraryは、そんな疑問を解決するために生まれました。
                </p>
                <p>
                  Qiitaの技術記事で紹介・言及された技術書を集計し、
                  今最も注目されている技術書をランキング形式でお届けします。
                </p>
              </div>
            </section>

            {/* 機能紹介 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-function-line text-qiita-green dark:text-dark-green"></i>
                主な機能
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-trophy-line text-qiita-green dark:text-dark-green"></i>
                    多様なランキング期間
                  </h3>
                  <p className="text-sm">
                    24時間、30日間、365日間、年別、全期間の5つの期間でランキングを確認できます。
                  </p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-search-line text-qiita-green dark:text-dark-green"></i>
                    書籍検索機能
                  </h3>
                  <p className="text-sm">
                    書籍名、著者、出版社、ISBNで素早く検索できます。
                  </p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-article-line text-qiita-green dark:text-dark-green"></i>
                    紹介記事へのリンク
                  </h3>
                  <p className="text-sm">
                    各書籍を言及しているQiita記事へ直接アクセスでき、実際の開発者の声を確認できます。
                  </p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-book-open-line text-qiita-green dark:text-dark-green"></i>
                    詳細な書籍情報
                  </h3>
                  <p className="text-sm">
                    著者、出版社、出版日などの詳細情報を表示します。
                  </p>
                </div>
              </div>
            </section>

            {/* データソース */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-database-2-line text-qiita-green dark:text-dark-green"></i>
                データソース
              </h2>
              <div className="space-y-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <div className="flex items-start gap-3">
                    <i className="ri-article-line text-qiita-green dark:text-dark-green text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">Qiita API</h3>
                      <p className="text-sm">
                        Qiitaの技術記事から書籍情報（ISBN、Amazon ASIN）を抽出し、
                        記事のいいね数やストック数、タグ情報も取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <div className="flex items-start gap-3">
                    <i className="ri-book-2-line text-qiita-green dark:text-dark-green text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">OpenBD API</h3>
                      <p className="text-sm">
                        日本の書籍データベースopenBDから、書籍の基本情報（タイトル、著者、出版社など）を取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <div className="flex items-start gap-3">
                    <i className="ri-book-line text-qiita-green dark:text-dark-green text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">Google Books API</h3>
                      <p className="text-sm">
                        書籍の詳細情報や表紙画像を補完的に取得しています。
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <i className="ri-amazon-line text-yellow-700 dark:text-yellow-400 text-2xl mt-1"></i>
                    <div>
                      <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1 flex items-center gap-2">
                        Amazon Product Advertising API（準備中）
                        <span className="text-xs bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded">審査中</span>
                      </h3>
                      <p className="text-sm text-yellow-700 dark:text-yellow-400">
                        現在、Amazonアソシエイト・プログラムの審査中です。
                        審査承認後は、Amazon Product Advertising APIを使用して、より正確な書籍情報と価格情報を提供する予定です。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* 技術スタック */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-code-box-line text-qiita-green dark:text-dark-green"></i>
                技術スタック
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-3">フロントエンド</h3>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      Next.js 14 (App Router)
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      TypeScript
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      Tailwind CSS
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      Remix Icon
                    </li>
                  </ul>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 border border-qiita-border dark:border-dark-border">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-3">バックエンド</h3>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      FastAPI (Python)
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      PostgreSQL
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      SQLAlchemy ORM
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-checkbox-circle-fill text-qiita-green dark:text-dark-green text-xs"></i>
                      Alembic (マイグレーション)
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* 作成者情報 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-user-line text-qiita-green dark:text-dark-green"></i>
                運営について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5">
                <p className="mb-4">
                  このサイトは、技術書好きなエンジニアによって個人で運営されています。
                  より良い技術書選びの一助となることを目指して、日々改善を続けています。
                </p>
                <div className="flex gap-3">
                  <a
                    href="https://twitter.com/qiibrary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2.5 rounded-lg transition-all duration-200 border border-qiita-border dark:border-dark-border hover-primary font-semibold shadow-sm"
                  >
                    <i className="ri-twitter-x-line text-lg"></i>
                    <span>X (Twitter)</span>
                  </a>
                  <a
                    href="https://github.com/yourusername/qiibrary"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2.5 rounded-lg transition-all duration-200 border border-qiita-border dark:border-dark-border hover-primary font-semibold shadow-sm"
                  >
                    <i className="ri-github-line text-lg"></i>
                    <span>GitHub</span>
                  </a>
                </div>
                <p className="text-xs mt-3 text-qiita-text-light dark:text-dark-text-light">
                  ※ SNSアカウントとGitHubリポジトリは準備中です
                </p>
              </div>
            </section>

            {/* お問い合わせ */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-mail-line text-qiita-green dark:text-dark-green"></i>
                お問い合わせ
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5">
                <p className="mb-4">
                  ご質問、ご要望、バグ報告、掲載内容に関するお問い合わせなど、お気軽にご連絡ください。
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 bg-qiita-green hover:bg-qiita-green-dark text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-semibold shadow-sm"
                >
                  <i className="ri-mail-send-line"></i>
                  お問い合わせページへ
                </Link>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>最終更新日: 2025年10月20日</div>
              </div>
              <Link href="/" className="text-qiita-green hover:underline flex items-center gap-1">
                <i className="ri-home-line"></i>
                トップに戻る
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
