'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-4xl relative z-10">
        <div className="bg-black border-2 border-green-500 p-6 md:p-8 shadow-[8px_8px_0_#39ff14] animate-fade-in">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b-2 border-green-900/50">
            <h1 className="text-2xl md:text-3xl font-pixel text-green-500 mb-3 flex items-center gap-2 md:gap-3 text-shadow-glow">
              <i className="ri-shield-check-line text-3xl md:text-4xl"></i>
              プライバシーポリシー
            </h1>
            <p className="text-sm font-mono text-gray-400">
              Privacy Policy
            </p>
          </div>

          <div className="space-y-8 text-gray-300 leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-information-line"></i>
                1. はじめに
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>
                  当サイト Qiibrary（以下「当サイト」）は、利用者のプライバシー保護を重要な責務と考えています。本ポリシーでは、
                  取得する情報の種類、利用目的、第三者提供、情報の管理方法等について説明します。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-database-2-line"></i>
                2. 収集する情報
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p className="mb-3">当サイトは、サービスの提供および改善のために、以下の情報を取得することがあります。</p>
                <div className="space-y-4 mt-4">
                  <div className="border border-gray-700 p-4 bg-gray-900">
                    <h3 className="font-pixel text-cyan-400 mb-2">2.1 自動的に取得する情報</h3>
                    <ul className="list-none space-y-1 ml-4">
                      <li className="flex items-start gap-2"><span className="text-green-500">►</span>IP アドレス</li>
                      <li className="flex items-start gap-2"><span className="text-green-500">►</span>ブラウザの種類・バージョンおよび利用端末のOS</li>
                      <li className="flex items-start gap-2"><span className="text-green-500">►</span>アクセス日時・閲覧ページのURL・リファラー情報</li>
                    </ul>
                  </div>
                  <div className="border border-gray-700 p-4 bg-gray-900">
                    <h3 className="font-pixel text-cyan-400 mb-2">2.2 利用者が提供する情報</h3>
                    <p>現時点では会員登録機能を設けていないため、利用者から直接個人情報を取得することは原則ありません。お問い合わせいただいた場合、メールアドレス等の連絡先情報をご提供いただくことがあります。</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-palette-line"></i>
                3. テーマ設定について
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>当サイトはダークテーマのみで構成されており、テーマ設定情報をブラウザに保存することはありません。テーマ設定に伴う個人情報の取得・保存は行っていません。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-cookie-line"></i>
                4. クッキーおよび広告識別子
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 space-y-3 text-sm">
                <p>当サイトは、サービス提供に不可欠な範囲でのみファーストパーティクッキーを使用します。ログイン機能などは設けておらず、当サイト側で個人を特定するための識別子を保持しません。</p>
                <p>ただし、Google AdSense 等の第三者配信事業者や Amazon アソシエイトの計測タグは、パーソナライズド広告表示や不正防止のためにクッキーや広告識別子を利用します。</p>
                <ul className="list-none space-y-1 ml-4">
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>閲覧履歴に基づく広告表示の最適化</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>広告表示回数・クリック数の計測と不正防止</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>アフィリエイト成果の判断</li>
                </ul>
                <p>クッキーの使用を希望されない場合は、ブラウザの設定で無効化するか、<a href="https://adssettings.google.com/authenticated?hl=ja" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 mx-1">Google 広告設定</a>でパーソナライズド広告を停止してください。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-links-line"></i>
                5. 外部サービスの利用
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 space-y-4 text-sm">
                <div className="bg-cyan-900/20 border border-cyan-800 p-3">現在、Google Analytics などのアクセス解析ツールは利用していません。導入する場合は本ポリシーを改訂しお知らせします。</div>
                <div className="border border-gray-700 p-4 bg-gray-900">
                  <p className="font-pixel text-cyan-400 mb-1">Qiita API</p>
                  <p>Qiita 株式会社が提供する API を通じて記事情報を取得します。リクエストに利用者の個人情報は含まれません。</p>
                </div>
                <div className="border border-gray-700 p-4 bg-gray-900">
                  <p className="font-pixel text-cyan-400 mb-1">OpenBD / Google Books API</p>
                  <p>書籍の基本情報や表紙画像を取得するために利用します。これらのリクエストにも利用者の個人情報は含まれません。</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-advertisement-line"></i>
                6. 広告およびアフィリエイト
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 space-y-3 text-sm">
                <p>当サイトは Google AdSense の審査および配信ポリシーに従い広告枠を設けます。広告枠では第三者配信事業者がクッキーや広告識別子を使用する場合があります。</p>
                <p>また、Amazon アソシエイト・プログラムに参加しており、リンク経由で購入が発生した場合に紹介料を受領します。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-target-line"></i>
                7. 情報の利用目的
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <ul className="list-none space-y-1 ml-4">
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>サービスの提供・運営</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>機能改善や不具合対応</li>
                  <li className="flex items-start gap-2"><span className="text-green-500">►</span>アクセス状況の把握と不正利用防止</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-share-line"></i>
                8. 情報の第三者提供
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p className="mb-2">当サイトは、以下の場合を除き、利用者の同意なく個人情報を第三者に提供することはありません：</p>
                <ul className="list-none space-y-1 ml-4">
                  <li className="flex items-start gap-2"><span className="text-yellow-500">!</span>法令に基づく場合</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-500">!</span>人の生命、身体または財産の保護のために必要がある場合</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-500">!</span>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合</li>
                  <li className="flex items-start gap-2"><span className="text-yellow-500">!</span>法令の定める事務を遂行することに対して協力する必要がある場合</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-lock-line"></i>
                9. 情報の安全管理
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>取得した情報は、漏洩・滅失・毀損を防ぐために適切な管理措置を講じます。ただし、インターネット通信は完全には安全でないことをご理解ください。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-external-link-line"></i>
                10. 外部リンク
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>Amazon.co.jp、Qiita 等の外部サイトには、それぞれのプライバシーポリシーが適用されます。リンク先での情報管理について当サイトは責任を負いません。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-parent-line"></i>
                11. 子どもの個人情報
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>13 歳未満の方から個人情報を取得することは意図していません。該当する場合は保護者の同意を得たうえでご利用ください。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-edit-line"></i>
                12. プライバシーポリシーの変更
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>必要に応じて内容を更新します。重要な変更はサイト上で告知し、掲載時点から効力を生じます。</p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-pixel text-green-400 mb-4 pb-2 border-b border-green-900/50 flex items-center gap-2">
                <i className="ri-mail-line"></i>
                13. お問い合わせ
              </h2>
              <div className="bg-gray-900/50 border border-gray-800 p-5 text-sm">
                <p>本ポリシーに関するご相談は<Link href="/contact" className="text-green-400 hover:text-green-300 mx-1 font-pixel">お問い合わせページ</Link>からご連絡ください。</p>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t-2 border-green-900/50 text-sm text-gray-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="font-mono">
                <div>制定日: 2025年10月20日</div>
                <div>最終更新日: 2025年12月10日</div>
              </div>
              <Link href="/" className="text-green-500 hover:text-green-400 flex items-center gap-2 font-pixel">
                <i className="ri-home-line"></i>
                [ HOME ]
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
