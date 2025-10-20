'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {

  return (
    <div className="min-h-screen bg-qiita-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card rounded-lg p-8 border border-qiita-border shadow-sm">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark">
                <i className="ri-information-line text-qiita-green"></i>
                Qiibraryについて
              </h1>

              <div className="space-y-8 text-secondary leading-relaxed">
                {/* サイトの目的 */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-qiita-green"></i>
                    サイトの目的
                  </h2>
                  <p className="mb-3">
                    Qiibraryは、Qiita記事で言及されたIT技術書をランキング形式で表示するサービスです。
                  </p>
                  <p className="mb-3">
                    技術書選びに迷ったとき、「Qiitaで人気の本は何だろう？」と思ったことはありませんか？
                    Qiibraryは、そんな疑問を解決するために生まれました。
                  </p>
                  <p>
                    Qiitaの技術記事で紹介・言及された技術書を集計し、
                    今最も注目されている技術書をランキング形式でお届けします。
                  </p>
                </section>

                {/* 機能紹介 */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-function-line text-qiita-green"></i>
                    主な機能
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-trophy-line text-qiita-green"></i>
                        人気・月次・年次ランキング
                      </h3>
                      <p className="text-sm">
                        今日、今月、今年の人気技術書をそれぞれランキング形式で確認できます。
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-price-tag-3-line text-qiita-green"></i>
                        タグベースフィルタリング
                      </h3>
                      <p className="text-sm">
                        Python、JavaScript、Dockerなど、Qiitaのタグでランキングを絞り込めます。
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-article-line text-qiita-green"></i>
                        紹介記事へのリンク
                      </h3>
                      <p className="text-sm">
                        各書籍を言及しているQiita記事へ直接アクセスできます。
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-book-open-line text-qiita-green"></i>
                        詳細な書籍情報
                      </h3>
                      <p className="text-sm">
                        openBD APIを使用し、著者、出版社、出版日などの詳細情報を表示します。
                      </p>
                    </div>
                  </div>
                </section>

                {/* データソース */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-database-2-line text-qiita-green"></i>
                    データソース
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-article-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">Qiita API</h3>
                        <p className="text-sm">
                          Qiitaの技術記事から書籍情報（ISBN、Amazon ASIN）を抽出し、
                          記事のいいね数やタグ情報も取得しています。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-book-2-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">openBD API</h3>
                        <p className="text-sm">
                          書籍の詳細情報（タイトル、著者、出版社、説明文など）をopenBD APIから取得しています。
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-amazon-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">Amazon アフィリエイト</h3>
                        <p className="text-sm">
                          書籍の購入リンクにAmazonアフィリエイトを使用しています。
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 更新頻度 */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-refresh-line text-qiita-green"></i>
                    更新頻度
                  </h2>
                  <p className="mb-2">ランキングデータは定期的に更新されます：</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="ri-time-line text-qiita-green"></i>
                      <span><strong>データ収集:</strong> Qiita記事から定期的に書籍情報を収集</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-database-line text-qiita-green"></i>
                      <span><strong>ランキング:</strong> 記事での言及回数に基づいてリアルタイムで算出</span>
                    </li>
                  </ul>
                </section>

                {/* 技術スタック */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-code-box-line text-qiita-green"></i>
                    技術スタック
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark mb-2">フロントエンド</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Next.js 14 (App Router)</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• Remix Icon</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark mb-2">バックエンド</h3>
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
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-qiita-green"></i>
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
                      className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2 rounded transition-colors duration-200 border border-qiita-border dark:border-dark-border hover-primary"
                    >
                      <i className="ri-twitter-x-line text-xl"></i>
                      <span>X (Twitter)</span>
                    </a>
                    <a
                      href="https://github.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2 rounded transition-colors duration-200 border border-qiita-border dark:border-dark-border hover-primary"
                    >
                      <i className="ri-github-line text-xl"></i>
                      <span>GitHub</span>
                    </a>
                  </div>
                </section>

                {/* お問い合わせ */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-mail-line text-qiita-green"></i>
                    お問い合わせ
                  </h2>
                  <p className="mb-3">
                    ご質問、ご要望、バグ報告などがございましたら、お気軽にお問い合わせください。
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 btn-primary"
                  >
                    <i className="ri-mail-send-line"></i>
                    お問い合わせページへ
                  </a>
                </section>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark">
                <i className="ri-information-line text-qiita-green"></i>
                About Qiibrary
              </h1>

              <div className="space-y-8 text-secondary leading-relaxed">
                {/* Purpose */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-qiita-green"></i>
                    Our Purpose
                  </h2>
                  <p className="mb-3">
                    Qiibrary is a service that displays IT technical books mentioned in Qiita articles in a ranking format.
                  </p>
                  <p className="mb-3">
                    Ever wondered "What books are popular on Qiita?" when choosing technical books?
                    Qiibrary was created to answer that question.
                  </p>
                  <p>
                    We aggregate technical books mentioned in Qiita articles
                    and deliver the most notable technical books in a ranking format.
                  </p>
                </section>

                {/* Features */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-function-line text-qiita-green"></i>
                    Main Features
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-trophy-line text-qiita-green"></i>
                        Popular, Monthly, Yearly Rankings
                      </h3>
                      <p className="text-sm">
                        Check popular technical books for today, this month, and this year in ranking format.
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-price-tag-3-line text-qiita-green"></i>
                        Tag-based Filtering
                      </h3>
                      <p className="text-sm">
                        Filter rankings by Qiita tags like Python, JavaScript, Docker, etc.
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-article-line text-qiita-green"></i>
                        Links to Articles
                      </h3>
                      <p className="text-sm">
                        Direct access to Qiita articles mentioning each book.
                      </p>
                    </div>
                    <div className="bg-qiita-surface rounded-lg p-4 border border-qiita-border">
                      <h3 className="font-semibold text-qiita-text-dark mb-2 flex items-center gap-2">
                        <i className="ri-book-open-line text-qiita-green"></i>
                        Detailed Book Information
                      </h3>
                      <p className="text-sm">
                        Using openBD API to display detailed information including author, publisher, and publication date.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Data Sources */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-database-2-line text-qiita-green"></i>
                    Data Sources
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <i className="ri-article-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">Qiita API</h3>
                        <p className="text-sm">
                          We extract book information (ISBN, Amazon ASIN) from Qiita technical articles
                          and retrieve article likes and tag information.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-book-2-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">openBD API</h3>
                        <p className="text-sm">
                          We retrieve detailed book information (title, author, publisher, description, etc.) from openBD API.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-amazon-line text-qiita-green text-2xl mt-1"></i>
                      <div>
                        <h3 className="font-semibold text-qiita-text-dark mb-1">Amazon Affiliate</h3>
                        <p className="text-sm">
                          We use Amazon affiliate links for book purchase links.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Update Frequency */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-refresh-line text-qiita-green"></i>
                    Update Frequency
                  </h2>
                  <p className="mb-2">Ranking data is updated regularly:</p>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <i className="ri-time-line text-qiita-green"></i>
                      <span><strong>Data Collection:</strong> Regularly collect book information from Qiita articles</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <i className="ri-database-line text-qiita-green"></i>
                      <span><strong>Rankings:</strong> Calculated in real-time based on mention count in articles</span>
                    </li>
                  </ul>
                </section>

                {/* Tech Stack */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-code-box-line text-qiita-green"></i>
                    Tech Stack
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark mb-2">Frontend</h3>
                      <ul className="space-y-1 text-sm">
                        <li>• Next.js 14 (App Router)</li>
                        <li>• TypeScript</li>
                        <li>• Tailwind CSS</li>
                        <li>• Remix Icon</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-qiita-text-dark mb-2">Backend</h3>
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
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-user-line text-qiita-green"></i>
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
                      className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2 rounded transition-colors duration-200 border border-qiita-border dark:border-dark-border hover-primary"
                    >
                      <i className="ri-twitter-x-line text-xl"></i>
                      <span>X (Twitter)</span>
                    </a>
                    <a
                      href="https://github.com/your_account"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white px-4 py-2 rounded transition-colors duration-200 border border-qiita-border dark:border-dark-border hover-primary"
                    >
                      <i className="ri-github-line text-xl"></i>
                      <span>GitHub</span>
                    </a>
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h2 className="text-2xl font-semibold text-qiita-text-dark mb-4 flex items-center gap-2">
                    <i className="ri-mail-line text-qiita-green"></i>
                    Contact
                  </h2>
                  <p className="mb-3">
                    If you have questions, requests, or bug reports, please feel free to contact us.
                  </p>
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 btn-primary"
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
      
      <Footer />
    </div>
  );
}
