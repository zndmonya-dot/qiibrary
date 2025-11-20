'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg animate-fade-in">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-file-text-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              利用規約
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              Terms of Service
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第1条（適用）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <p>
                  本規約は、Qiibrary（以下「当サイト」）が提供するすべてのサービスに適用されます。利用者が本サービスを利用した時点で、本規約に同意したものとみなします。
                </p>
                <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                  本規約に定めのない事項については、プライバシーポリシーその他当サイトの個別方針に従うものとします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第2条（提供内容）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <p>当サイトは以下の情報提供を目的とします。</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Qiita記事で言及された書籍のランキングおよび統計値</li>
                  <li>書籍の基本情報と関連Qiita記事・Amazon商品ページ等へのリンク</li>
                  <li>Google AdSense 等の広告枠および Amazon アソシエイト経由のリンク掲出</li>
                </ul>
                <p className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                  本サービスは情報提供を目的としており、書籍の販売・配送・決済には関与しません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第3条（利用環境）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p>
                  利用者は、自らの責任と費用において通信機器やネットワークを整備し、本サービスを利用するものとします。利用者の環境に起因する不具合について、当サイトは責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第4条（禁止事項）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">利用者は、以下の行為を行ってはなりません。</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>法令・公序良俗・本規約に違反する行為</li>
                  <li>当サイトまたは第三者の権利・財産・信用を侵害する行為</li>
                  <li>本サービスに過度な負荷を与え、運営を妨害する行為</li>
                  <li>本サービスから得た情報を不正に複製・改変・再配布する行為</li>
                  <li>その他、当サイトが不適切と判断する行為</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第5条（データと情報の取扱い）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  掲載情報はQiita API、OpenBD API、Google Books API等の外部サービスおよび当サイト独自の集計に基づきます。正確性・最新性の確保に努めますが、内容を保証するものではありません。
                </p>
                <p className="text-sm bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                  書籍購入前には必ずAmazon.co.jp等の公式情報をご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第6条（広告およびアフィリエイト）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイトは Google AdSense のプログラムポリシーに従い広告枠を設置し、Amazon アソシエイト・プログラムにも参加しています。広告配信事業者はクッキーや広告識別子を用いて利用者の興味に基づく広告を表示することがあります。
                </p>
                <p>
                  利用者が広告リンク経由で商品を購入した場合、当サイトが紹介料や広告収益を受領することがありますが、利用者に追加費用は発生しません。広告およびクッキーの取り扱いは
                  <Link href="/privacy" className="text-qiita-green hover-underline mx-1 font-semibold">
                    プライバシーポリシー
                  </Link>
                  をご確認ください。
                </p>
                <p className="text-sm">
                  書籍の価格・在庫・配送条件などの取引条件は Amazon.co.jp 等の提供元が定める内容に従い、当サイトは介在しません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第7条（サービスの変更・停止）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイトは、システム保守、障害、天災その他の理由により、事前通知なくサービス内容を変更・停止する場合があります。これにより利用者に損害が生じても、当サイトは責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第8条（知的財産）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイト上のコンテンツ（テキスト・画像・ロゴ・プログラム等）の権利は、当サイトまたは正当な権利者に帰属します。許可なく複製・転載・再配布することを禁じます。
                </p>
                <p className="text-sm">
                  「Qiita」「Amazon」等の名称・ロゴは各社の商標です。当サイトは各社と提携していません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第9条（免責事項）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイトは、本サービスの利用により利用者または第三者に生じた損害について、一切の責任を負いません。ただし、当サイトに故意または重大な過失がある場合を除きます。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第10条（規約の変更）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>
                  当サイトは、必要に応じて本規約を変更できます。変更後の規約は当サイトに掲載した時点で効力を生じ、利用者が引き続きサービスを利用した場合は変更に同意したものとみなします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第11条（準拠法・裁判管轄）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                <p>本規約は日本法に準拠します。</p>
                <p>本サービスに起因して紛争が生じた場合、当サイト運営者の所在地を管轄する裁判所を第一審の専属的合意管轄裁判所とします。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第12条（お問い合わせ）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p>
                  本規約に関するお問い合わせは、
                  <Link href="/contact" className="text-qiita-green hover-underline mx-1 font-semibold">
                    お問い合わせページ
                  </Link>
                  からご連絡ください。
                </p>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>制定日: 2024年10月20日</div>
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
    </div>
  );
}
