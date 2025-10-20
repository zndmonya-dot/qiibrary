'use client';

import Header from '@/components/Header';

export default function TermsPage() {

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-youtube-dark-surface rounded-lg p-8 border border-youtube-dark-hover">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-file-text-line text-youtube-red"></i>
                利用規約
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第1条（適用）</h2>
                  <p>
                    本規約は、当サイト（Qiibrary）が提供するサービス（以下「本サービス」といいます）の利用条件を定めるものです。
                    利用者は、本サービスを利用することにより、本規約に同意したものとみなされます。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第2条（サービスの内容）</h2>
                  <p className="mb-2">本サービスは、以下の機能を提供します：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>YouTubeで紹介されたIT技術書のランキング表示</li>
                    <li>書籍の詳細情報の提供</li>
                    <li>関連するYouTube動画の紹介</li>
                    <li>Amazon.co.jp / Amazon.comへのアフィリエイトリンクの提供</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第3条（利用上の注意）</h2>
                  <p className="mb-2">利用者は、本サービスの利用にあたり、以下の行為を行ってはならないものとします：</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>法令または公序良俗に違反する行為</li>
                    <li>犯罪行為に関連する行為</li>
                    <li>本サービスの運営を妨害するおそれのある行為</li>
                    <li>他の利用者または第三者の権利を侵害する行為</li>
                    <li>本サービスのネットワークまたはシステムに過度な負荷をかける行為</li>
                    <li>本サービスの情報を不正に取得または収集する行為</li>
                    <li>その他、当サイトが不適切と判断する行為</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第4条（免責事項）</h2>
                  <p className="mb-2">
                    当サイトは、本サービスに関して以下の事項について一切の責任を負わないものとします：
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>本サービスで提供される情報の正確性、完全性、有用性</li>
                    <li>本サービスの中断、停止、終了、利用不能または変更</li>
                    <li>本サービスの利用により発生したいかなる損害</li>
                    <li>外部サイト（Amazon、YouTubeなど）で発生したトラブル</li>
                    <li>アフィリエイトリンクを通じた購入に関する問題</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第5条（著作権）</h2>
                  <p>
                    本サービスで提供されるコンテンツ（テキスト、画像、デザインなど）の著作権は、当サイトまたは正当な権利者に帰属します。
                    利用者は、これらのコンテンツを無断で複製、転載、配布することはできません。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第6条（アフィリエイトプログラム）</h2>
                  <p>
                    本サービスは、Amazon.co.jpアソシエイト・プログラムおよびAmazon.com Associates Programの参加者です。
                    当サイトのリンクを通じて商品を購入された場合、当サイトは紹介料を受け取ることがあります。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第7条（サービスの変更・終了）</h2>
                  <p>
                    当サイトは、利用者への事前通知なく、本サービスの内容を変更または終了することができるものとします。
                    これにより利用者に生じた損害について、当サイトは一切の責任を負いません。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第8条（規約の変更）</h2>
                  <p>
                    当サイトは、必要に応じて本規約を変更することができるものとします。
                    変更後の規約は、当サイトに掲載した時点で効力を生じます。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">第9条（準拠法・管轄裁判所）</h2>
                  <p>
                    本規約の解釈にあたっては、日本法を準拠法とします。
                    本サービスに関して紛争が生じた場合には、東京地方裁判所を第一審の専属的合意管轄裁判所とします。
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
                <i className="ri-file-text-line text-youtube-red"></i>
                Terms of Service
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 1 (Application)</h2>
                  <p>
                    These Terms of Service define the conditions for using the services provided by this site (Qiibrary) (hereinafter referred to as "the Service").
                    By using the Service, users are deemed to have agreed to these Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 2 (Service Content)</h2>
                  <p className="mb-2">The Service provides the following features:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Rankings of IT technical books featured on YouTube</li>
                    <li>Detailed information about books</li>
                    <li>Introduction to related YouTube videos</li>
                    <li>Affiliate links to Amazon.co.jp / Amazon.com</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 3 (Prohibited Actions)</h2>
                  <p className="mb-2">Users must not engage in the following actions when using the Service:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Actions that violate laws or public order and morals</li>
                    <li>Actions related to criminal activities</li>
                    <li>Actions that may interfere with the operation of the Service</li>
                    <li>Actions that infringe on the rights of other users or third parties</li>
                    <li>Actions that place excessive load on the Service's network or system</li>
                    <li>Actions to illegally obtain or collect information from the Service</li>
                    <li>Other actions deemed inappropriate by this site</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 4 (Disclaimer)</h2>
                  <p className="mb-2">
                    This site assumes no responsibility for the following matters regarding the Service:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Accuracy, completeness, or usefulness of information provided by the Service</li>
                    <li>Interruption, suspension, termination, unavailability, or changes to the Service</li>
                    <li>Any damages resulting from the use of the Service</li>
                    <li>Troubles occurring on external sites (Amazon, YouTube, etc.)</li>
                    <li>Issues related to purchases through affiliate links</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 5 (Copyright)</h2>
                  <p>
                    The copyright of content provided by the Service (text, images, design, etc.) belongs to this site or the legitimate rights holder.
                    Users may not reproduce, repost, or distribute this content without permission.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 6 (Affiliate Program)</h2>
                  <p>
                    This Service is a participant in the Amazon.co.jp Associates Program and Amazon.com Associates Program.
                    When products are purchased through links on this site, this site may receive referral fees.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 7 (Service Changes and Termination)</h2>
                  <p>
                    This site may change or terminate the Service without prior notice to users.
                    This site assumes no responsibility for any damages caused to users as a result.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 8 (Changes to Terms)</h2>
                  <p>
                    This site may change these Terms as necessary.
                    The revised Terms will take effect when posted on this site.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Article 9 (Governing Law and Jurisdiction)</h2>
                  <p>
                    Japanese law shall govern the interpretation of these Terms.
                    In the event of a dispute regarding the Service, the Tokyo District Court shall have exclusive jurisdiction as the court of first instance.
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

