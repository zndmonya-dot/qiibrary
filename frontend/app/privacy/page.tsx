'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-8 border border-qiita-border dark:border-dark-border">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark dark:text-white">
            <i className="ri-shield-check-line text-qiita-green dark:text-dark-green"></i>
            プライバシーポリシー
          </h1>

          <div className="space-y-6 text-qiita-text dark:text-dark-text leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">1. はじめに</h2>
              <p>
                Qiibrary（以下「当サイト」といいます）は、利用者のプライバシーを尊重し、個人情報の保護に努めます。
                本プライバシーポリシーは、当サイトが利用者の情報をどのように収集、使用、保護するかを説明するものです。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">2. 収集する情報</h2>
              <p className="mb-2">
                当サイトでは、サービスの提供および改善のために、以下の情報を収集することがあります：
              </p>
              <div className="space-y-3 ml-4">
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">2.1 自動的に収集される情報</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>IPアドレス</li>
                    <li>ブラウザの種類とバージョン</li>
                    <li>オペレーティングシステム</li>
                    <li>アクセス日時</li>
                    <li>閲覧ページのURL</li>
                    <li>リファラー情報（どのサイトから訪問したか）</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">2.2 利用者が提供する情報</h3>
                  <p className="text-sm ml-4">
                    当サイトは、現在のところ会員登録機能やお問い合わせフォームを提供していないため、
                    利用者が直接提供する個人情報は収集していません。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">3. ブラウザストレージの使用</h2>
              <p className="mb-2">
                当サイトでは、ユーザーエクスペリエンスの向上のために、ブラウザのlocalStorageおよびsessionStorageを使用しています。
              </p>
              <div className="space-y-2 ml-4">
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">localStorage（永続的な保存）</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>テーマ設定（ライトモード/ダークモード）の保存</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">sessionStorage（セッション中のみ保存）</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>ページ遷移時のスクロール位置の一時保存</li>
                    <li>ランキングページの状態（現在のページ番号、検索クエリなど）の一時保存</li>
                  </ul>
                </div>
              </div>
              <p className="mt-2 text-sm">
                これらの情報は利用者のブラウザ内にのみ保存され、当サイトのサーバーには送信されません。
                利用者はブラウザの設定でこれらのストレージをクリアすることができます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">4. アクセス解析について</h2>
              <p className="mb-2">
                当サイトでは、サービスの改善とユーザー体験の向上のために、将来的にアクセス解析ツール（Google Analytics等）を導入する可能性があります。
              </p>
              <p className="text-sm">
                アクセス解析ツールを導入した場合、収集される情報は統計的な分析のみに使用され、個人を特定する目的では使用されません。
                導入時には本ポリシーを更新し、利用者に通知いたします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">5. 外部サービスの利用</h2>
              <p className="mb-2">当サイトでは、以下の外部サービスを利用しています：</p>
              <div className="space-y-3 ml-4">
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">5.1 Qiita API</h3>
                  <p className="text-sm ml-4">
                    技術記事の情報を取得するために、Qiita株式会社が提供するAPIを利用しています。
                    当サイトからQiita APIへのリクエストには、利用者の個人情報は含まれません。
                    Qiitaのプライバシーポリシーについては、
                    <a href="https://qiita.com/privacy" target="_blank" rel="noopener noreferrer" className="text-qiita-green hover:underline mx-1">
                      Qiita公式サイト
                    </a>
                    をご確認ください。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">5.2 Amazon Product Advertising API</h3>
                  <p className="text-sm ml-4">
                    書籍情報を取得するために、Amazon.co.jpが提供するProduct Advertising APIを利用しています。
                    当サイトからAmazon APIへのリクエストには、利用者の個人情報は含まれません。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-1">5.3 Amazonアソシエイト・プログラム</h3>
                  <p className="text-sm ml-4">
                    当サイトはAmazonアソシエイト・プログラムに参加しており、書籍へのリンクはアフィリエイトリンクとなっています。
                    利用者が当サイトのリンクをクリックしてAmazon.co.jpにアクセスした場合、
                    Amazonのプライバシーポリシーが適用されます。詳しくは
                    <a href="https://www.amazon.co.jp/gp/help/customer/display.html?nodeId=201909010" target="_blank" rel="noopener noreferrer" className="text-qiita-green hover:underline mx-1">
                      Amazonプライバシー規約
                    </a>
                    をご確認ください。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">6. Amazonアソシエイトプログラムについて</h2>
              <p className="mb-2">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
              </p>
              <div className="space-y-2 ml-4 text-sm">
                <p>
                  <strong>価格と在庫について：</strong>
                  当サイトに掲載されている書籍情報や価格は、Amazon.co.jpの情報に基づいており、予告なく変更される場合があります。
                  最新の情報は、必ずAmazon.co.jpの商品ページでご確認ください。
                </p>
                <p>
                  <strong>紹介料について：</strong>
                  利用者が当サイト経由でAmazon.co.jpにアクセスし商品を購入した場合、当サイトはAmazonから紹介料を受け取ることがあります。
                  これにより利用者に追加の費用が発生することはありません。
                </p>
                <p>
                  <strong>クッキーの使用：</strong>
                  Amazonアソシエイトプログラムでは、アフィリエイトリンクのトラッキングのためにAmazonがクッキーを使用します。
                  これらのクッキーはAmazonによって管理され、当サイトはアクセスできません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">7. 情報の利用目的</h2>
              <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>サービスの提供および運営</li>
                <li>サービスの改善および新機能の開発</li>
                <li>アクセス状況の分析</li>
                <li>技術的な問題の診断と解決</li>
                <li>不正利用の防止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">8. 情報の第三者提供</h2>
              <p className="mb-2">
                当サイトは、以下の場合を除き、利用者の同意なく個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">9. 情報の安全管理</h2>
              <p>
                当サイトは、収集した情報の漏洩、滅失または毀損の防止その他の安全管理のために必要かつ適切な措置を講じます。
                ただし、インターネット上での情報伝達は完全に安全とは言えないため、当サイトは情報の絶対的な安全性を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">10. 外部リンク</h2>
              <p>
                当サイトには、Amazon.co.jp、Qiitaなどの外部サイトへのリンクが含まれています。
                これらの外部サイトには、それぞれ独自のプライバシーポリシーが適用されます。
                当サイトは、外部サイトにおける情報の取り扱いについて責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">11. 子どもの個人情報</h2>
              <p>
                当サイトは、13歳未満の子どもから故意に個人情報を収集することはありません。
                13歳未満の方が当サイトを利用する場合は、保護者の方の同意を得てください。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">12. プライバシーポリシーの変更</h2>
              <p>
                当サイトは、必要に応じて本プライバシーポリシーを変更することがあります。
                重要な変更がある場合は、当サイト上で通知いたします。
                変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じます。
              </p>
              <p className="mt-2">
                本ポリシーの変更後に当サイトを引き続き利用された場合、変更内容に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">13. お問い合わせ</h2>
              <p>
                本プライバシーポリシーに関するご質問やご不明な点がございましたら、
                <Link href="/contact" className="text-qiita-green hover:underline mx-1">
                  お問い合わせページ
                </Link>
                からご連絡ください。
              </p>
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
