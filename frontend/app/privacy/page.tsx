'use client';

import Header from '@/components/Header';

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
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">1. 個人情報の取得</h2>
              <p>
                当サイトでは、ユーザーが当サイトを閲覧する際に、IPアドレス、ブラウザの種類、アクセス日時などの情報を自動的に取得します。
                これらの情報は、サービスの改善や統計的な分析のために使用されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">2. Cookieの使用</h2>
              <p className="mb-2">
                    当サイトでは、ユーザーエクスペリエンスの向上のためにCookieを使用しています。
                    Cookieは、以下の目的で使用されます：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>言語設定の保存</li>
                <li>アクセス解析</li>
                <li>広告の表示</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">3. アクセス解析ツール</h2>
              <p>
                    当サイトでは、Google Analyticsを使用してアクセス状況を分析しています。
                    Google Analyticsは、Cookieを使用してユーザーの情報を収集します。
                    収集された情報は匿名で処理され、個人を特定するものではありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">4. 外部サービスの利用</h2>
              <p className="mb-2">当サイトでは、以下の外部サービスを利用しています：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>YouTube Data API（動画情報の取得）</li>
                <li>Amazon Product Advertising API（書籍情報の取得）</li>
                <li>Amazonアソシエイト・プログラム（アフィリエイトリンク）</li>
              </ul>
              <p className="mt-2">
                    これらのサービスには、それぞれ独自のプライバシーポリシーが適用されます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">5. Amazonアソシエイトプログラムについて</h2>
              <p className="mb-2">
                    当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
              </p>
              <p className="mb-2">
                    当サイトに掲載されている書籍情報や価格は、Amazon.co.jpの情報に基づいており、予告なく変更される場合があります。
                    最新の情報は、必ずAmazon.co.jpの商品ページでご確認ください。
              </p>
              <p>
                    ユーザーが当サイト経由でAmazon.co.jpにアクセスし商品を購入した場合、当サイトはAmazonから紹介料を受け取ることがあります。
                    これによりユーザーに追加の費用が発生することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">6. 個人情報の第三者提供</h2>
              <p>
                    当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">7. プライバシーポリシーの変更</h2>
              <p>
                    当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
                    変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">8. お問い合わせ</h2>
              <p>
                    プライバシーポリシーに関するご質問は、お問い合わせページからご連絡ください。
              </p>
            </section>

            <p className="text-sm pt-6 border-t border-qiita-border dark:border-dark-border text-qiita-text dark:text-dark-text">
              最終更新日: 2025年10月20日
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

