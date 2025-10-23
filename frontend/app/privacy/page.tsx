'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-shield-check-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              プライバシーポリシー
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              Privacy Policy
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                1. はじめに
              </h2>
              <p>
                Qiibrary（以下「当サイト」といいます）は、利用者のプライバシーを尊重し、個人情報の保護に努めます。
                本プライバシーポリシーは、当サイトが利用者の情報をどのように収集、使用、保護するかを説明するものです。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                2. 収集する情報
              </h2>
              <p className="mb-3">
                当サイトでは、サービスの提供および改善のために、以下の情報を収集することがあります：
              </p>
              <div className="space-y-4 ml-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">2.1 自動的に収集される情報</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>IPアドレス</li>
                    <li>ブラウザの種類とバージョン</li>
                    <li>オペレーティングシステム</li>
                    <li>アクセス日時</li>
                    <li>閲覧ページのURL</li>
                    <li>リファラー情報（どのサイトから訪問したか）</li>
                  </ul>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">2.2 利用者が提供する情報</h3>
                  <p className="text-sm">
                    当サイトは、現在のところ会員登録機能やお問い合わせフォームを提供していないため、
                    利用者が直接提供する個人情報は収集していません。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                3. テーマ設定について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-2">
                  当サイトでは、ダークモード/ライトモードの表示設定について、ブラウザストレージ（localStorageやsessionStorage）は使用していません。
                </p>
                <p className="text-sm">
                  テーマ設定は、利用者のデバイスのシステム設定（OSのダークモード設定）を自動的に検出して適用します。
                  これにより、利用者の情報をブラウザに保存することなく、快適な表示環境を提供しています。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                4. 外部サービスの利用
              </h2>
              <p className="mb-3">当サイトでは、以下の外部サービスを利用しています：</p>
              <p className="mb-3 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <i className="ri-information-line text-blue-600 dark:text-blue-400 mr-1"></i>
                <strong>アクセス解析について:</strong> 現在、Google Analytics等のアクセス解析ツールは使用していません。
                将来的に導入する場合は、本ポリシーを更新し、利用者に通知いたします。
              </p>
              <div className="space-y-4 ml-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-article-line text-qiita-green dark:text-dark-green"></i>
                    4.1 Qiita API
                  </h3>
                  <p className="text-sm">
                    技術記事の情報を取得するために、Qiita株式会社が提供するAPIを利用しています。
                    当サイトからQiita APIへのリクエストには、利用者の個人情報は含まれません。
                    Qiitaのプライバシーポリシーについては、
                    <a href="https://qiita.com/privacy" target="_blank" rel="noopener noreferrer" className="text-qiita-green hover-underline mx-1">
                      Qiita公式サイト
                    </a>
                    をご確認ください。
                  </p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-youtube-line text-red-500"></i>
                    4.2 YouTube Data API
                  </h3>
                  <p className="text-sm">
                    技術書を紹介するYouTube動画の情報を取得するために、Google LLCが提供するYouTube Data APIを利用しています。
                    当サイトからYouTube Data APIへのリクエストには、利用者の個人情報は含まれません。
                    YouTubeのプライバシーポリシーについては、
                    <a href="https://www.youtube.com/intl/ja/howyoutubeworks/our-commitments/protecting-user-data/" target="_blank" rel="noopener noreferrer" className="text-qiita-green hover-underline mx-1">
                      YouTube公式サイト
                    </a>
                    をご確認ください。
                  </p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-book-line text-qiita-green dark:text-dark-green"></i>
                    4.3 書籍情報の取得
                  </h3>
                  <p className="text-sm mb-2">
                    書籍情報を取得するために、以下のサービスを利用しています：
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li><strong>OpenBD API</strong>: 日本の書籍データベースから書籍情報を取得</li>
                    <li><strong>Google Books API</strong>: 書籍の詳細情報や表紙画像を取得</li>
                  </ul>
                  <p className="text-sm mt-2 text-qiita-text-light dark:text-dark-text-light">
                    当サイトからこれらのAPIへのリクエストには、利用者の個人情報は含まれません。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                5. Amazonアソシエイトプログラムについて
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 mb-3">
                <p className="mb-3">
                  当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
                </p>
                <div className="space-y-3 text-sm">
                  <div>
                    <strong className="text-qiita-text-dark dark:text-white">価格と在庫について：</strong>
                    <span className="ml-2">当サイトに掲載されている書籍情報は、OpenBDおよびGoogle Books APIから取得しており、Amazon.co.jpの最新の価格や在庫状況とは異なる場合があります。
                    最新の情報は、必ずAmazon.co.jpの商品ページでご確認ください。</span>
                  </div>
                  <div>
                    <strong className="text-qiita-text-dark dark:text-white">紹介料について：</strong>
                    <span className="ml-2">利用者が当サイト経由でAmazon.co.jpにアクセスし商品を購入した場合、当サイトはAmazonから紹介料を受け取ることがあります。
                    これにより利用者に追加の費用が発生することはありません。</span>
                  </div>
                  <div>
                    <strong className="text-qiita-text-dark dark:text-white">クッキーの使用：</strong>
                    <span className="ml-2">Amazonアソシエイトプログラムでは、アフィリエイトリンクのトラッキングのためにAmazonがクッキーを使用します。
                    これらのクッキーはAmazonによって管理され、当サイトはアクセスできません。</span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                6. 情報の利用目的
              </h2>
              <p className="mb-2">収集した情報は、以下の目的で利用します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4 bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <li>サービスの提供および運営</li>
                <li>サービスの改善および新機能の開発</li>
                <li>アクセス状況の分析</li>
                <li>技術的な問題の診断と解決</li>
                <li>不正利用の防止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                7. 情報の第三者提供
              </h2>
              <p className="mb-2">
                当サイトは、以下の場合を除き、利用者の同意なく個人情報を第三者に提供することはありません：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4 bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 text-sm">
                <li>法令に基づく場合</li>
                <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
                <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                8. 情報の安全管理
              </h2>
              <p>
                当サイトは、収集した情報の漏洩、滅失または毀損の防止その他の安全管理のために必要かつ適切な措置を講じます。
                ただし、インターネット上での情報伝達は完全に安全とは言えないため、当サイトは情報の絶対的な安全性を保証するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                9. 外部リンク
              </h2>
              <p>
                当サイトには、Amazon.co.jp、Qiita、YouTubeなどの外部サイトへのリンクが含まれています。
                これらの外部サイトには、それぞれ独自のプライバシーポリシーが適用されます。
                当サイトは、外部サイトにおける情報の取り扱いについて責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                10. 子どもの個人情報
              </h2>
              <p>
                当サイトは、13歳未満の子どもから故意に個人情報を収集することはありません。
                13歳未満の方が当サイトを利用する場合は、保護者の方の同意を得てください。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                11. プライバシーポリシーの変更
              </h2>
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
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                12. お問い合わせ
              </h2>
              <p>
                本プライバシーポリシーに関するご質問やご不明な点がございましたら、
                <Link href="/contact" className="text-qiita-green hover-underline mx-1 font-semibold">
                  お問い合わせページ
                </Link>
                からご連絡ください。
              </p>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>制定日: 2024年10月20日</div>
                <div>最終更新日: 2024年10月23日</div>
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
