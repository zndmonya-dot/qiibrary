'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg animate-fade-in">
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
            {/* サイト概要 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-lightbulb-line text-qiita-green dark:text-dark-green"></i>
                Qiibraryとは
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5 space-y-4">
                <p>
                  Qiibraryは、Qiitaでの書籍言及データをもとに「現場でいま読まれている技術書」を可視化するサービスです。
                  書籍探しにかける時間を最小化し、学習計画やチーム推奨図書のアップデートを支援します。
                </p>
                <p className="text-sm bg-white/70 dark:bg-dark-surface rounded-lg p-4 border border-qiita-border/40 dark:border-dark-border/40">
                  <span className="font-semibold text-qiita-text-dark dark:text-white">提供価値</span><br />
                  ・Qiita記事を毎日クロールし、AmazonリンクからASIN/ISBNを抽出<br />
                  ・Neon DBで履歴管理し、24h / 30d / 365d / 年別 / 全期間ランキングを生成<br />
                  ・各書籍の初出日・最新言及日・累計言及数を自動で補正
                </p>
                <p>
                  ユースケースは、開発チームの教材リスト刷新、個人のスキルマップ策定、法人の研修コンテンツ選定など。
                  エンジニアリングマネージャーや技術顧問の定例資料にもそのまま転用できる粒度を意識しています。
                </p>
              </div>
            </section>

            {/* 他のサイトとの違い */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-star-line text-qiita-green dark:text-dark-green"></i>
                Qiibraryが選ばれる理由
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-qiita-green/10 to-qiita-green/5 dark:from-dark-green/20 dark:to-dark-green/10 rounded-lg p-5 border-2 border-qiita-green/30 dark:border-dark-green/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">📚</div>
                    <div>
                      <h3 className="font-bold text-qiita-text-dark dark:text-white mb-2">
                        圧倒的なデータ量
                      </h3>
                      <p className="text-sm mb-2">
                        <span className="font-bold text-qiita-green dark:text-dark-green text-lg">17,399冊</span>の技術書データを継続的に更新
                      </p>
                      <p className="text-xs text-qiita-text-light dark:text-dark-text-light">
                        他サイト: 数百〜数千冊程度
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-qiita-green/10 to-qiita-green/5 dark:from-dark-green/20 dark:to-dark-green/10 rounded-lg p-5 border-2 border-qiita-green/30 dark:border-dark-green/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">📈</div>
                    <div>
                      <h3 className="font-bold text-qiita-text-dark dark:text-white mb-2">
                        10年分の履歴データ
                      </h3>
                      <p className="text-sm mb-2">
                        <span className="font-bold text-qiita-green dark:text-dark-green">2015年〜現在</span>までの全記録を日次で更新
                      </p>
                      <p className="text-xs text-qiita-text-light dark:text-dark-text-light">
                        他サイト: 直近数年のみ
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-qiita-green/10 to-qiita-green/5 dark:from-dark-green/20 dark:to-dark-green/10 rounded-lg p-5 border-2 border-qiita-green/30 dark:border-dark-green/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">🔍</div>
                    <div>
                      <h3 className="font-bold text-qiita-text-dark dark:text-white mb-2">
                        高速検索機能
                      </h3>
                      <p className="text-sm mb-2">
                        17,000冊超から<span className="font-bold text-qiita-green dark:text-dark-green">瞬時に検索</span>
                      </p>
                      <p className="text-xs text-qiita-text-light dark:text-dark-text-light">
                        他サイト: 検索機能なし or 基本的な検索のみ
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-qiita-green/10 to-qiita-green/5 dark:from-dark-green/20 dark:to-dark-green/10 rounded-lg p-5 border-2 border-qiita-green/30 dark:border-dark-green/30">
                  <div className="flex items-start gap-3">
                    <div className="text-3xl">✨</div>
                    <div>
                      <h3 className="font-bold text-qiita-text-dark dark:text-white mb-2">
                        最高のUI/UX
                      </h3>
                      <p className="text-sm mb-2">
                        PageSpeed Insights <span className="font-bold text-qiita-green dark:text-dark-green">99点</span>、モバイル利用でも快適
                      </p>
                      <p className="text-xs text-qiita-text-light dark:text-dark-text-light">
                        他サイト: 古いデザイン、動作が重い
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5 border border-qiita-border dark:border-dark-border">
                <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-2">
                  <i className="ri-time-line text-qiita-green dark:text-dark-green"></i>
                  柔軟な期間設定
                </h3>
                <p className="text-sm mb-3">
                  日次・月次・年次・全期間、さらに<span className="font-bold">2015年〜2025年の各年</span>で集計できます。
                  直近のトレンドと長期的な定番を同時に把握できる設計です。
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-qiita-green/20 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green rounded-full text-xs font-medium">
                    24時間
                  </span>
                  <span className="px-3 py-1 bg-qiita-green/20 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green rounded-full text-xs font-medium">
                    30日間
                  </span>
                  <span className="px-3 py-1 bg-qiita-green/20 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green rounded-full text-xs font-medium">
                    365日間
                  </span>
                  <span className="px-3 py-1 bg-qiita-green/20 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green rounded-full text-xs font-medium">
                    全期間
                  </span>
                  <span className="px-3 py-1 bg-qiita-green/20 dark:bg-dark-green/20 text-qiita-green dark:text-dark-green rounded-full text-xs font-medium">
                    2015年〜2025年（各年）
                  </span>
                </div>
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

            {/* 運用と品質管理 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-shield-check-line text-qiita-green dark:text-dark-green"></i>
                運用と品質管理
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <i className="ri-time-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">日次ジョブ + 速報検知</p>
                    <p>Renderで動作するFastAPIジョブが毎日00:00 JSTに前日分の記事を取得し、GitHub Actionsがバックアップ収集を担当します。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-database-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">統計値の自動補正</p>
                    <p>first_mentioned_at / latest_mention_at / total_mentions をバッチで再計算し、欠損や異常値が出た書籍は隔離テーブルで検査します。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-eye-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">手動レビュー</p>
                    <p>大きな順位変動や新規カテゴリが増えた際は、運営者が元記事を確認し、補足コメントやタグ調整を行います。</p>
                  </div>
                </div>
              </div>
            </section>

            {/* データ更新と品質管理 */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-refresh-line text-qiita-green dark:text-dark-green"></i>
                データ更新と品質管理
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5 border border-qiita-border dark:border-dark-border space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <i className="ri-time-line text-qiita-green dark:text-dark-green text-xl mt-0.5"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">24時間ごとの自動収集</p>
                    <p>Render上で稼働するFastAPIバッチとGitHub Actionsにより、毎日00:00 JSTに前日分の記事を取り込みます。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-database-2-line text-qiita-green dark:text-dark-green text-xl mt-0.5"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">Neon DBでの整合性チェック</p>
                    <p>first_mentioned_at / latest_mention_at / total_mentions を必ず埋める統計ジョブを通し、欠損や重複を検知します。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-file-check-line text-qiita-green dark:text-dark-green text-xl mt-0.5"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">人手によるレビュー</p>
                    <p>新しく追加されたID帯は、Amazonリンクの抽出精度・著者表記（「著者情報なし」等）を確認した上で公開しています。</p>
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

            {/* 安心してご利用いただくために */}
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50 flex items-center gap-2">
                <i className="ri-hand-heart-line text-qiita-green dark:text-dark-green"></i>
                安心してご利用いただくために
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-5 space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <i className="ri-lock-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">個人情報の取扱い</p>
                    <p>会員登録機能はなく、アクセスログは利用動向分析に必要な範囲でのみ保存します。詳細はプライバシーポリシーをご参照ください。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-megaphone-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">広告・アフィリエイト</p>
                    <p>Amazonアソシエイト・プログラムおよびGoogle AdSenseの審査完了後、明示的に区分した形で掲載します。書籍の価格や配送条件はAmazon.co.jpに準じます。</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <i className="ri-customer-service-2-line text-qiita-green dark:text-dark-green text-lg"></i>
                  <div>
                    <p className="font-semibold text-qiita-text-dark dark:text-white">コンテンツの修正依頼</p>
                    <p>掲載内容に誤りがある場合や削除をご希望の場合は、お問い合わせフォームからご連絡ください。権利者確認のうえ速やかに対応します。</p>
                  </div>
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
                  Qiibraryは国内在住のソフトウェアエンジニアが個人事業として運営しています。
                  データ収集・審査・お問い合わせ対応まで一貫して担当し、透明性の高い改善サイクルを維持しています。
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
                </div>
                <p className="text-xs mt-3 text-qiita-text-light dark:text-dark-text-light">
                  ※ SNSアカウントは順次公開予定です
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
                  className="inline-flex items-center gap-2 bg-qiita-green hover-bg-green-dark text-white px-4 py-2.5 rounded-lg font-semibold shadow-sm"
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
                <div>最終更新日: 2025年11月20日</div>
              </div>
              <Link href="/" className="text-qiita-green hover-underline flex items-center gap-1">
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
