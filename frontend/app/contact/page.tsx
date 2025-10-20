'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-8 border border-qiita-border dark:border-dark-border">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark dark:text-white">
            <i className="ri-mail-line text-qiita-green dark:text-dark-green"></i>
            お問い合わせ
          </h1>

          <div className="space-y-6 text-qiita-text dark:text-dark-text leading-relaxed">
            <p>
              Qiibraryに関するご質問、ご要望、バグ報告、掲載内容に関するお問い合わせなどがございましたら、
              以下のいずれかの方法でお気軽にお問い合わせください。
            </p>

            {/* Email */}
            <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-6 border border-qiita-border dark:border-dark-border">
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-2">
                <i className="ri-mail-line text-qiita-green dark:text-dark-green"></i>
                メール
              </h2>
              <p className="mb-4">
                お問い合わせ全般につきましては、メールでご連絡ください。
                通常、2～3営業日以内に返信いたします。
              </p>
              <a
                href="mailto:contact@qiibrary.com"
                className="inline-flex items-center gap-2 bg-qiita-green hover:bg-qiita-green-dark text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <i className="ri-mail-send-line"></i>
                メールを送る
              </a>
              <p className="text-sm mt-3 text-qiita-text-light dark:text-dark-text-light">
                ※ メールアドレスは準備中です。お問い合わせフォームをご利用いただくか、SNSでご連絡ください。
              </p>
            </div>

            {/* Twitter/X */}
            <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-6 border border-qiita-border dark:border-dark-border">
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-2">
                <i className="ri-twitter-x-line text-qiita-green dark:text-dark-green"></i>
                X (Twitter)
              </h2>
              <p className="mb-4">
                最も早く返信できる可能性が高い方法です。
                DMまたは@メンションでお気軽にご連絡ください。
              </p>
              <a
                href="https://twitter.com/qiibrary"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 border border-qiita-border dark:border-dark-border text-qiita-text-dark dark:text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <i className="ri-external-link-line"></i>
                Xでフォロー / 連絡する
              </a>
              <p className="text-sm mt-3 text-qiita-text-light dark:text-dark-text-light">
                ※ SNSアカウントは準備中です。
              </p>
            </div>

            {/* GitHub Issues */}
            <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-6 border border-qiita-border dark:border-dark-border">
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3 flex items-center gap-2">
                <i className="ri-github-line text-qiita-green dark:text-dark-green"></i>
                GitHub Issues
              </h2>
              <p className="mb-4">
                バグ報告や機能要望は、GitHubのIssuesでも受け付けています。
                技術的な内容や詳細な説明が必要な場合はこちらが便利です。
              </p>
              <a
                href="https://github.com/yourusername/qiibrary/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-qiita-surface dark:bg-dark-surface-light hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 border border-qiita-border dark:border-dark-border text-qiita-text-dark dark:text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
              >
                <i className="ri-external-link-line"></i>
                Issueを作成する
              </a>
              <p className="text-sm mt-3 text-qiita-text-light dark:text-dark-text-light">
                ※ GitHubリポジトリは準備中です。
              </p>
            </div>

            {/* よくある質問 */}
            <div className="pt-6 border-t border-qiita-border dark:border-dark-border">
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-4 flex items-center gap-2">
                <i className="ri-question-line text-qiita-green dark:text-dark-green"></i>
                よくある質問
              </h2>
              <div className="space-y-5">
                <div className="bg-qiita-surface/50 dark:bg-dark-surface-light/50 rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-question-answer-line text-qiita-green dark:text-dark-green text-sm"></i>
                    Q. ランキングはいつ更新されますか？
                  </h3>
                  <p className="text-sm ml-6 text-qiita-text dark:text-dark-text">
                    A. 日次ランキングは毎日、月次ランキングは毎月1日、年次ランキングは毎年1月1日に更新されます。
                    全期間ランキングは常に最新の状態を反映しています。
                  </p>
                </div>

                <div className="bg-qiita-surface/50 dark:bg-dark-surface-light/50 rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-question-answer-line text-qiita-green dark:text-dark-green text-sm"></i>
                    Q. 掲載されている書籍情報が間違っています
                  </h3>
                  <p className="text-sm ml-6 text-qiita-text dark:text-dark-text">
                    A. 書籍情報はAmazon Product Advertising APIから自動取得しています。
                    情報に誤りがある場合は、お問い合わせフォームよりご連絡ください。確認の上、修正いたします。
                  </p>
                </div>

                <div className="bg-qiita-surface/50 dark:bg-dark-surface-light/50 rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-question-answer-line text-qiita-green dark:text-dark-green text-sm"></i>
                    Q. 特定の書籍をランキングから削除してほしい
                  </h3>
                  <p className="text-sm ml-6 text-qiita-text dark:text-dark-text">
                    A. 著作権者ご本人からのご要請の場合、対応いたします。
                    お問い合わせの際は、権利者であることを証明できる情報を添えてご連絡ください。
                  </p>
                </div>

                <div className="bg-qiita-surface/50 dark:bg-dark-surface-light/50 rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-question-answer-line text-qiita-green dark:text-dark-green text-sm"></i>
                    Q. データの正確性はどうですか？
                  </h3>
                  <p className="text-sm ml-6 text-qiita-text dark:text-dark-text">
                    A. Qiita APIとAmazon Product Advertising APIから取得したデータを使用していますが、
                    100%の正確性は保証できません。最新情報は各サービスの公式サイトでご確認ください。
                  </p>
                </div>

                <div className="bg-qiita-surface/50 dark:bg-dark-surface-light/50 rounded-lg p-4">
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2 flex items-center gap-2">
                    <i className="ri-question-answer-line text-qiita-green dark:text-dark-green text-sm"></i>
                    Q. 広告やアフィリエイトについて
                  </h3>
                  <p className="text-sm ml-6 text-qiita-text dark:text-dark-text">
                    A. 当サイトはAmazonアソシエイト・プログラムに参加しており、
                    書籍購入リンクからの紹介料によって運営されています。詳しくは
                    <Link href="/privacy" className="text-qiita-green hover:underline mx-1">プライバシーポリシー</Link>
                    をご覧ください。
                  </p>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                <i className="ri-error-warning-line"></i>
                ご注意
              </h3>
              <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1 ml-6 list-disc">
                <li>お問い合わせの内容によっては、回答にお時間をいただく場合がございます</li>
                <li>お問い合わせの内容によっては、回答できない場合がございます</li>
                <li>土日祝日のお問い合わせは、翌営業日以降の対応となります</li>
                <li>書籍の購入や配送に関するお問い合わせは、Amazon.co.jpへ直接お問い合わせください</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
