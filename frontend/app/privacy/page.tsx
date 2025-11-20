'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg animate-fade-in">
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
                当サイト Qiibrary（以下「当サイト」）は、利用者のプライバシー保護を重要な責務と考えています。本ポリシーでは、
                取得する情報の種類、利用目的、第三者提供、情報の管理方法等について説明します。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                2. 収集する情報
              </h2>
              <p className="mb-3">当サイトは、サービスの提供および改善のために、以下の情報を取得することがあります。</p>
              <div className="space-y-4 ml-4">
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white">2.1 自動的に取得する情報</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                    <li>IP アドレス</li>
                    <li>ブラウザの種類・バージョンおよび利用端末のOS</li>
                    <li>アクセス日時・閲覧ページのURL・リファラー情報</li>
                  </ul>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white">2.2 利用者が提供する情報</h3>
                  <p className="text-sm">
                    現時点では会員登録や問い合わせフォームを設けていないため、利用者から直接個人情報を取得することはありません。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                3. テーマ設定について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="text-sm">
                  当サイトではダーク/ライトテーマの設定情報をブラウザに保存していません。利用者の OS 設定を参照して表示を切り替えますので、テーマ設定に伴う個人情報の取得・保存は行っていません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                4. クッキーおよび広告識別子
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <p>
                  当サイトは、サービス提供に不可欠な範囲でのみファーストパーティクッキーを使用します。ログイン機能などは設けておらず、当サイト側で個人を特定するための識別子を保持しません。
                </p>
                <p>
                  ただし、Google AdSense 等の第三者配信事業者や Amazon アソシエイトの計測タグは、パーソナライズド広告表示や不正防止のためにクッキーや広告識別子を利用します。これらのクッキー情報は各事業者が管理し、当サイトが閲覧・保存することはありません。
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>閲覧履歴に基づく広告表示の最適化</li>
                  <li>広告表示回数・クリック数の計測と不正防止</li>
                  <li>アフィリエイト成果の判断</li>
                </ul>
                <p>
                  クッキーの使用を希望されない場合は、ブラウザの設定で無効化するか、
                  <a
                    href="https://adssettings.google.com/authenticated?hl=ja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-qiita-green hover-underline mx-1 font-semibold"
                  >
                    Google 広告設定
                  </a>
                  でパーソナライズド広告を停止してください。詳細は
                  <a
                    href="https://policies.google.com/technologies/ads?hl=ja"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-qiita-green hover-underline mx-1 font-semibold"
                  >
                    Google の広告ポリシー
                  </a>
                  をご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                5. 外部サービスの利用
              </h2>
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  現在、Google Analytics などのアクセス解析ツールは利用していません。導入する場合は本ポリシーを改訂しお知らせします。
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <p className="font-semibold text-qiita-text-dark dark:text-white">Qiita API</p>
                  <p>Qiita 株式会社が提供する API を通じて記事情報を取得します。リクエストに利用者の個人情報は含まれません。</p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <p className="font-semibold text-qiita-text-dark dark:text-white">YouTube Data API</p>
                  <p>Google LLC が提供する API を利用し、技術書を紹介する動画情報を取得する場合があります。利用者情報は送信しません。</p>
                </div>
                <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                  <p className="font-semibold text-qiita-text-dark dark:text-white">OpenBD / Google Books API</p>
                  <p>書籍の基本情報や表紙画像を取得するために利用します。これらのリクエストにも利用者の個人情報は含まれません。</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                6. 広告およびアフィリエイト
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <p>当サイトは Google AdSense の審査および配信ポリシーに従い広告枠を設けます。広告枠では第三者配信事業者がクッキーや広告識別子を使用する場合があります。</p>
                <p>また、Amazon アソシエイト・プログラムに参加しており、リンク経由で購入が発生した場合に紹介料を受領します。利用者に追加費用は発生せず、書籍情報は OpenBD / Google Books API を基に掲載しているため Amazon.co.jp の最新情報と差異が生じることがあります。</p>
                <p>Google AdSense のデータ利用については Google ポリシーをご確認ください。Amazon アソシエイトで使用されるクッキーは Amazon が管理し、当サイトでは閲覧できません。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                7. 情報の利用目的
              </h2>
              <ul className="list-disc list-inside space-y-1 ml-4 bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 text-sm">
                <li>サービスの提供・運営</li>
                <li>機能改善や不具合対応</li>
                <li>アクセス状況の把握と不正利用防止</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                8. 情報の第三者提供
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
                9. 情報の安全管理
              </h2>
              <p className="text-sm">
                取得した情報は、漏洩・滅失・毀損を防ぐために適切な管理措置を講じます。ただし、インターネット通信は完全には安全でないことをご理解ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                10. 外部リンク
              </h2>
              <p className="text-sm">
                Amazon.co.jp、Qiita、YouTube 等の外部サイトには、それぞれのプライバシーポリシーが適用されます。リンク先での情報管理について当サイトは責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                11. 子どもの個人情報
              </h2>
              <p className="text-sm">
                13 歳未満の方から個人情報を取得することは意図していません。該当する場合は保護者の同意を得たうえでご利用ください。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                12. プライバシーポリシーの変更
              </h2>
              <p className="text-sm">
                必要に応じて内容を更新します。重要な変更はサイト上で告知し、掲載時点から効力を生じます。変更後も利用を継続した場合、更新内容に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                13. お問い合わせ
              </h2>
              <p className="text-sm">
                本ポリシーに関するご相談は
                <Link href="/contact" className="text-qiita-green hover-underline mx-1 font-semibold">お問い合わせページ</Link>
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
