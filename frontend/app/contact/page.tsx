'use client';

import Header from '@/components/Header';

export default function ContactPage() {

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-youtube-dark-surface rounded-lg p-8 border border-youtube-dark-hover">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-mail-line text-youtube-red"></i>
                お問い合わせ
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <p>
                  Qiibraryに関するご質問、ご要望、バグ報告などがございましたら、
                  以下のいずれかの方法でお気軽にお問い合わせください。
                </p>

                {/* Twitter/X */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-twitter-x-line text-youtube-red"></i>
                    X (Twitter)
                  </h2>
                  <p className="mb-4">
                    最も早く返信できる可能性が高い方法です。
                    DMまたは@メンションでお気軽にご連絡ください。
                  </p>
                  <a
                    href="https://twitter.com/your_account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-external-link-line"></i>
                    Xで連絡する
                  </a>
                </div>

                {/* GitHub Issues */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-github-line text-youtube-red"></i>
                    GitHub Issues
                  </h2>
                  <p className="mb-4">
                    バグ報告や機能要望は、GitHubのIssuesでも受け付けています。
                    技術的な内容はこちらの方が詳しく説明できます。
                  </p>
                  <a
                    href="https://github.com/your_account/booktube/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-external-link-line"></i>
                    Issueを作成する
                  </a>
                </div>

                {/* Email */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-mail-line text-youtube-red"></i>
                    メール
                  </h2>
                  <p className="mb-4">
                    プライベートな内容や、公開したくない情報がある場合は、
                    メールでご連絡ください。
                  </p>
                  <a
                    href="mailto:contact@example.com"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-mail-send-line"></i>
                    メールを送る
                  </a>
                </div>

                {/* よくある質問 */}
                <div className="pt-6 border-t border-youtube-dark-hover">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-question-line text-youtube-red"></i>
                    よくある質問
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. ランキングはいつ更新されますか？
                      </h3>
                      <p className="text-sm ml-4">
                        A. 日次ランキングは毎日午前3時（JST）、月次ランキングは毎月1日、
                        年次ランキングは毎年1月1日に更新されます。
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. 書籍のリクエストはできますか？
                      </h3>
                      <p className="text-sm ml-4">
                        A. 現在、手動での書籍追加は行っておりません。
                        YouTubeで紹介された書籍は自動的にランキングに反映されます。
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. データの正確性はどうですか？
                      </h3>
                      <p className="text-sm ml-4">
                        A. YouTube Data APIとAmazon APIから取得したデータを使用していますが、
                        100%の正確性は保証できません。最新情報は各サービスの公式サイトでご確認ください。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-mail-line text-youtube-red"></i>
                Contact Us
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <p>
                  If you have questions, requests, or bug reports about Qiibrary,
                  please feel free to contact us through any of the following methods.
                </p>

                {/* Twitter/X */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-twitter-x-line text-youtube-red"></i>
                    X (Twitter)
                  </h2>
                  <p className="mb-4">
                    The fastest way to get a response.
                    Feel free to contact us via DM or @mention.
                  </p>
                  <a
                    href="https://twitter.com/your_account"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-external-link-line"></i>
                    Contact on X
                  </a>
                </div>

                {/* GitHub Issues */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-github-line text-youtube-red"></i>
                    GitHub Issues
                  </h2>
                  <p className="mb-4">
                    We also accept bug reports and feature requests through GitHub Issues.
                    This is better for detailed technical discussions.
                  </p>
                  <a
                    href="https://github.com/your_account/booktube/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-external-link-line"></i>
                    Create an Issue
                  </a>
                </div>

                {/* Email */}
                <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50">
                  <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <i className="ri-mail-line text-youtube-red"></i>
                    Email
                  </h2>
                  <p className="mb-4">
                    For private matters or information you don't want to make public,
                    please contact us via email.
                  </p>
                  <a
                    href="mailto:contact@example.com"
                    className="inline-flex items-center gap-2 bg-youtube-dark-hover hover:bg-youtube-red px-4 py-2 rounded transition-colors duration-200"
                  >
                    <i className="ri-mail-send-line"></i>
                    Send Email
                  </a>
                </div>

                {/* FAQ */}
                <div className="pt-6 border-t border-youtube-dark-hover">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <i className="ri-question-line text-youtube-red"></i>
                    FAQ
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. When are rankings updated?
                      </h3>
                      <p className="text-sm ml-4">
                        A. Daily rankings are updated daily at 3:00 AM JST, monthly rankings on the 1st of each month,
                        and yearly rankings on January 1st each year.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. Can I request books to be added?
                      </h3>
                      <p className="text-sm ml-4">
                        A. We do not currently accept manual book additions.
                        Books featured on YouTube are automatically reflected in the rankings.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-2">
                        Q. How accurate is the data?
                      </h3>
                      <p className="text-sm ml-4">
                        A. We use data from YouTube Data API and Amazon API,
                        but we cannot guarantee 100% accuracy. Please check the official sites of each service for the latest information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

