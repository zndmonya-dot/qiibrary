'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-8 border border-qiita-border dark:border-dark-border">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark dark:text-white">
            <i className="ri-scales-3-line text-qiita-green dark:text-dark-green"></i>
            特定商取引法に基づく表記
          </h1>

          <div className="space-y-6 text-qiita-text dark:text-dark-text leading-relaxed">
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
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">事業者情報</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">サイト名:</span>
                  <span>Qiibrary（キーブラリー）</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">運営形態:</span>
                  <span>個人運営</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">運営責任者:</span>
                  <span>[運営者名]</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">所在地:</span>
                  <span>[所在地]<br />
                  <span className="text-sm text-qiita-text-light dark:text-dark-text-light">
                    ※請求があれば遅滞なく開示いたします
                  </span>
                  </span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">お問い合わせ</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">お問い合わせ:</span>
                  <span>
                    <Link href="/contact" className="text-qiita-green hover:underline">
                      お問い合わせページ
                    </Link>
                    からご連絡ください
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">メール:</span>
                  <span>contact@qiibrary.com（準備中）</span>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold min-w-[120px]">対応時間:</span>
                  <span>平日 10:00～18:00（土日祝日を除く）</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">サービス内容</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Qiita記事で言及されたIT技術書の情報を収集・整理し、ランキング形式で表示する情報提供サービスです。
                </p>
                <p className="font-semibold text-qiita-text-dark dark:text-white mb-2">提供する主な機能：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IT技術書のランキング表示（日次・月次・年次・全期間）</li>
                  <li>書籍の詳細情報の表示</li>
                  <li>関連するQiita記事の紹介</li>
                  <li>Amazon.co.jpへの商品リンクの提供</li>
                  <li>書籍検索機能</li>
                </ul>
                <p className="mt-3 text-sm text-qiita-text-light dark:text-dark-text-light">
                  ※ 当サイトは書籍の販売や配送は一切行っておりません
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">販売価格・支払方法・配送等</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="font-semibold mb-1">販売価格</h3>
                  <p className="text-sm">
                    当サイトは商品の直接販売を行っておりません。
                    書籍の価格は、リンク先のAmazon.co.jpの販売ページに表示されている価格が適用されます。
                    価格は予告なく変更される場合がありますので、購入時に必ずAmazon.co.jpでご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">支払方法</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める支払方法に従います。
                    詳細はAmazon.co.jpの利用規約をご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">支払時期</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める支払時期に従います。
                    通常、商品の注文確定時に決済が行われます。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">商品の引渡時期</h3>
                  <p className="text-sm">
                    Amazon.co.jpが定める配送条件に従います。
                    配送日時、送料等の詳細はAmazon.co.jpでご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">返品・交換・キャンセル</h3>
                  <p className="text-sm">
                    返品、交換、キャンセルに関しては、すべてAmazon.co.jpの返品・交換ポリシーに従います。
                    詳細はAmazon.co.jpカスタマーサービスへお問い合わせください。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">アフィリエイトプログラムについて</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、
                  <span className="font-semibold">Amazonアソシエイト・プログラム</span>の参加者です。
                </p>
                <p className="mb-3">
                  当サイトに掲載されている書籍情報のリンクをクリックし、Amazon.co.jpで商品を購入された場合、
                  当サイトは商品価格の一定割合を紹介料として受け取ることがあります。
                </p>
                <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                  ※ アフィリエイトリンクを経由した購入であっても、お客様に追加の費用が発生することはありません。
                  商品の価格や配送料は、Amazon.co.jpで直接購入した場合と同じです。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">著作権・商標について</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
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
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">免責事項</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイトで提供する情報は、Qiita API、Amazon Product Advertising API等の外部APIから取得したものです。
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
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">掲載情報の削除について</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-2">
                  著作権者ご本人から、書籍情報の削除または修正のご要望がある場合は、
                  <Link href="/contact" className="text-qiita-green hover:underline mx-1">
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
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">準拠法・管轄裁判所</h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p>
                  本表記の解釈および適用については、日本法を準拠法とします。
                </p>
                <p className="mt-2">
                  当サイトに関する紛争については、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
                </p>
              </div>
            </section>

            <p className="text-sm pt-6 border-t border-qiita-border dark:border-dark-border text-qiita-text dark:text-dark-text">
              制定日: 2025年10月20日<br />
              最終更新日: 2025年10月20日
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
