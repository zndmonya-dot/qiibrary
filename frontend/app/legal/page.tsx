'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-scales-3-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              特定商取引法に基づく表記
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              Commercial Transaction Act Disclosure
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            {/* 重要な注意書き */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                <i className="ri-information-line"></i>
                重要なお知らせ
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                当サイトは情報提供サービスであり、書籍や商品の直接販売は行っておりません。
                書籍の購入は、当サイトのリンク先であるAmazon.co.jpにて行われます。
                購入に関する取引条件、決済、配送、返品等はすべてAmazon.co.jpの規約に従います。
              </p>
            </div>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                事業者情報
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">サイト名:</span>
                  <span>Qiibrary（キーブラリー）</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">運営形態:</span>
                  <span>個人運営</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">運営責任者:</span>
                  <span>[運営者名]</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">所在地:</span>
                  <div>
                    <span>[所在地]</span><br />
                    <span className="text-sm text-qiita-text-light dark:text-dark-text-light">
                      ※請求があれば遅滞なく開示いたします
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                お問い合わせ
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">お問い合わせ:</span>
                  <span>
                    <Link href="/contact" className="text-qiita-green hover:underline font-semibold">
                      お問い合わせページ
                    </Link>
                    からご連絡ください
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">メール:</span>
                  <span>contact@qiibrary.com（準備中）</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">対応時間:</span>
                  <span>平日 10:00～18:00（土日祝日を除く）</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                サービス内容
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Qiitaで話題のIT技術書の情報を収集・整理し、ランキング形式で表示する情報提供サービスです。
                </p>
                <p className="font-semibold text-qiita-text-dark dark:text-white mb-2">提供する主な機能：</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>IT技術書のランキング表示（24時間・30日間・365日間・年別・全期間）</li>
                  <li>書籍の詳細情報の表示（OpenBD、Google Books APIを利用）</li>
                  <li>関連するQiita記事の紹介</li>
                  <li>Amazon.co.jpへの商品リンクの提供</li>
                  <li>書籍検索機能</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-3">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  書籍情報について
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  現在、Amazonアソシエイト・プログラムの審査中のため、Amazon Product Advertising APIは使用できません。
                  そのため、OpenBDおよびGoogle Books APIを代替として使用しており、書籍情報の精度が低い場合があります。
                  審査承認後は、速やかにAmazon APIを使用するようシステム改修を行い、より正確な情報を提供いたします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                販売価格・支払方法・配送等
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">販売価格</h3>
                  <p className="text-sm">
                    当サイトは商品の直接販売を行っておりません。
                    書籍の価格は、リンク先のAmazon.co.jpの販売ページに表示されている価格が適用されます。
                    価格は予告なく変更される場合がありますので、購入時に必ずAmazon.co.jpでご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">支払方法</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める支払方法に従います。
                    詳細はAmazon.co.jpの利用規約をご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">支払時期</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める支払時期に従います。
                    通常、商品の注文確定時に決済が行われます。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">商品の引渡時期</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める配送条件に従います。
                    配送日時、送料等の詳細はAmazon.co.jpでご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">返品・交換・キャンセル</h3>
                  <p className="text-sm">
                    返品、交換、キャンセルに関しては、すべてAmazon.co.jpの返品・交換ポリシーに従います。
                    詳細はAmazon.co.jpカスタマーサービスへお問い合わせください。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                アフィリエイトプログラムについて
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、
                  <span className="font-semibold">Amazonアソシエイト・プログラム</span>に参加申請中です。
                </p>
                <p className="mb-3">
                  審査承認後、当サイトに掲載されている書籍情報のリンクをクリックし、Amazon.co.jpで商品を購入された場合、
                  当サイトは商品価格の一定割合を紹介料として受け取ることがあります。
                </p>
                <p className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <i className="ri-information-line text-blue-600 dark:text-blue-400 mr-1"></i>
                  アフィリエイトリンクを経由した購入であっても、お客様に追加の費用が発生することはありません。
                  商品の価格や配送料は、Amazon.co.jpで直接購入した場合と同じです。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                著作権・商標について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2 text-sm">
                <p>
                  当サイトに掲載されている書籍の表紙画像、タイトル、説明文などは、各著作権者に帰属します。
                </p>
                <p>
                  「Qiita」は、Qiita株式会社の登録商標または商標です。当サイトはQiita株式会社とは関係ありません。
                </p>
                <p>
                  「Amazon」およびAmazonロゴは、Amazon.com, Inc.またはその関連会社の商標です。
                </p>
                <p>
                  当サイトで使用している商標、ロゴ、会社名、製品名などは、各権利者の商標または登録商標です。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                免責事項
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <p>
                  当サイトで提供する情報は、Qiita API、OpenBD API、Google Books API等の外部APIから取得したものです。
                </p>
                <p>
                  情報の正確性、完全性、有用性、最新性については保証いたしかねます。
                  最新の情報は、必ず各サービスの公式サイトでご確認ください。
                </p>
                <p>
                  当サイトの利用により生じたいかなる損害についても、当サイトは一切の責任を負いません。
                </p>
                <p>
                  Amazon.co.jpでの商品購入に関するトラブル、問い合わせ等については、
                  Amazon.co.jpカスタマーサービスへ直接お問い合わせください。
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <i className="ri-alert-line mr-1"></i>
                  <strong>重要:</strong> Amazonアソシエイト審査中のため、書籍情報の精度が低い場合があります。購入前に必ずAmazon.co.jpで最新情報をご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                掲載情報の削除について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-2">
                  著作権者ご本人から、書籍情報の削除または修正のご要望がある場合は、
                  <Link href="/contact" className="text-qiita-green hover:underline mx-1 font-semibold">
                    お問い合わせページ
                  </Link>
                  よりご連絡ください。
                </p>
                <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                  ※ ご連絡の際は、権利者であることを証明できる情報を添えていただきますようお願いいたします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                準拠法・管轄裁判所
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  本表記の解釈および適用については、日本法を準拠法とします。
                </p>
                <p>
                  当サイトに関する紛争については、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
                </p>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>制定日: 2025年10月20日</div>
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
    </div>
  );
}
