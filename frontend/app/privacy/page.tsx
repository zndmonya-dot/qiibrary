'use client';

import Header from '@/components/Header';

export default function PrivacyPage() {

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-youtube-dark-surface rounded-lg p-8 border border-youtube-dark-hover">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-shield-check-line text-youtube-red"></i>
                プライバシーポリシー
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. 個人情報の取得</h2>
                  <p>
                    当サイトでは、ユーザーが当サイトを閲覧する際に、IPアドレス、ブラウザの種類、アクセス日時などの情報を自動的に取得します。
                    これらの情報は、サービスの改善や統計的な分析のために使用されます。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Cookieの使用</h2>
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
                  <h2 className="text-xl font-semibold text-white mb-3">3. アクセス解析ツール</h2>
                  <p>
                    当サイトでは、Google Analyticsを使用してアクセス状況を分析しています。
                    Google Analyticsは、Cookieを使用してユーザーの情報を収集します。
                    収集された情報は匿名で処理され、個人を特定するものではありません。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. 外部サービスの利用</h2>
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
                  <h2 className="text-xl font-semibold text-white mb-3">5. 個人情報の第三者提供</h2>
                  <p>
                    当サイトは、法令に基づく場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">6. プライバシーポリシーの変更</h2>
                  <p>
                    当サイトは、必要に応じてプライバシーポリシーを変更することがあります。
                    変更後のプライバシーポリシーは、当サイトに掲載した時点で効力を生じます。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">7. お問い合わせ</h2>
                  <p>
                    プライバシーポリシーに関するご質問は、お問い合わせページからご連絡ください。
                  </p>
                </section>

                <p className="text-sm pt-6 border-t border-youtube-dark-hover">
                  最終更新日: 2025年10月17日
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-shield-check-line text-youtube-red"></i>
                Privacy Policy
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">1. Collection of Personal Information</h2>
                  <p>
                    When you browse this site, we automatically collect information such as your IP address, browser type, and access time.
                    This information is used to improve our services and for statistical analysis.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">2. Use of Cookies</h2>
                  <p className="mb-2">
                    This site uses cookies to improve user experience. Cookies are used for the following purposes:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Storing language preferences</li>
                    <li>Access analysis</li>
                    <li>Advertising display</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">3. Analytics Tools</h2>
                  <p>
                    This site uses Google Analytics to analyze access patterns.
                    Google Analytics collects user information using cookies.
                    The collected information is processed anonymously and does not identify individuals.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">4. Use of External Services</h2>
                  <p className="mb-2">This site uses the following external services:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>YouTube Data API (for video information)</li>
                    <li>Amazon Product Advertising API (for book information)</li>
                    <li>Amazon Associates Program (for affiliate links)</li>
                  </ul>
                  <p className="mt-2">
                    These services have their own privacy policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">5. Disclosure to Third Parties</h2>
                  <p>
                    We do not provide personal information to third parties without user consent, except as required by law.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Privacy Policy</h2>
                  <p>
                    We may update this privacy policy as necessary.
                    The updated privacy policy will take effect when posted on this site.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
                  <p>
                    For questions about this privacy policy, please contact us through the contact page.
                  </p>
                </section>

                <p className="text-sm pt-6 border-t border-youtube-dark-hover">
                  Last Updated: October 17, 2025
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

