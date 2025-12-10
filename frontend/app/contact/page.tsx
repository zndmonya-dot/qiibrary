'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      {/* Scanline Effect */}
      <div className="crt-flicker"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12 max-w-3xl relative z-10">
        <div className="bg-black border-2 border-green-500 p-6 md:p-8 shadow-[4px_4px_0_#39ff14]">
          {/* Header */}
          <div className="mb-8 pb-6 border-b-2 border-green-900">
            <h1 className="text-2xl md:text-3xl font-pixel mb-3 flex items-center gap-3 text-green-500 text-shadow-glow">
              <i className="ri-mail-line text-3xl md:text-4xl"></i>
              CONTACT
            </h1>
            <p className="text-sm text-gray-500 font-pixel">
              SEND MESSAGE
            </p>
          </div>

          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p>
              Qiibraryに関するご質問、ご要望、バグ報告、掲載内容に関するお問い合わせなどがございましたら、
              以下のいずれかの方法でお気軽にお問い合わせください。
            </p>

            {/* Email */}
            <div className="bg-gray-900 border border-gray-800 p-5 hover:border-green-500 transition-colors">
              <h2 className="text-lg font-pixel text-green-400 mb-3 flex items-center gap-2">
                <i className="ri-mail-line text-xl"></i>
                EMAIL
              </h2>
              <p className="mb-4 text-sm text-gray-300">
                お問い合わせ全般につきましては、メールでご連絡ください。
                通常、2～3営業日以内に返信いたします。
              </p>
              <a
                href="mailto:contact@qiibrary.com"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-black px-4 py-2.5 font-pixel text-xs border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
              >
                <i className="ri-mail-send-line"></i>
                SEND EMAIL
              </a>
              <p className="text-xs mt-3 text-yellow-400 bg-yellow-900/30 border border-yellow-700 p-2">
                <i className="ri-time-line mr-1"></i>
                メールアドレスは準備中です。SNSでご連絡ください。
              </p>
            </div>

            {/* Twitter/X */}
            <div className="bg-gray-900 border border-gray-800 p-5 hover:border-cyan-500 transition-colors">
              <h2 className="text-lg font-pixel text-cyan-400 mb-3 flex items-center gap-2">
                <i className="ri-twitter-x-line text-xl"></i>
                X (TWITTER)
              </h2>
              <p className="mb-4 text-sm text-gray-300">
                最も早く返信できる可能性が高い方法です。
                DMまたは@メンションでお気軽にご連絡ください。
              </p>
              <a
                href="https://x.com/Rasenooon"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gray-800 text-cyan-400 px-4 py-2.5 border border-cyan-700 hover:bg-cyan-900/30 font-pixel text-xs transition-all"
              >
                <i className="ri-external-link-line"></i>
                FOLLOW / DM
              </a>
            </div>

            {/* よくある質問 */}
            <div className="pt-6 border-t-2 border-green-900">
              <h2 className="text-xl font-pixel text-green-400 mb-4 flex items-center gap-2">
                <i className="ri-question-line"></i>
                FAQ
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-900/50 border border-gray-800 p-4 hover:border-green-500/50 transition-colors">
                  <h3 className="font-pixel text-green-400 mb-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">Q:</span>
                    ランキングはいつ更新されますか？
                  </h3>
                  <div className="text-sm ml-4 text-gray-300">
                    <span className="text-pink-400 font-pixel text-xs">A:</span> ランキングは以下の期間で表示されます：
                    <ul className="mt-2 space-y-1 list-none ml-2">
                      <li><span className="text-green-500">►</span> 24時間: 過去24時間のランキング（常に最新）</li>
                      <li><span className="text-green-500">►</span> 30日間: 過去30日間のランキング（常に最新）</li>
                      <li><span className="text-green-500">►</span> 365日間: 過去365日間のランキング（常に最新）</li>
                      <li><span className="text-green-500">►</span> 年別: 特定の年のランキング（2015年以降）</li>
                      <li><span className="text-green-500">►</span> 全期間: すべての期間を含むランキング</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-4 hover:border-green-500/50 transition-colors">
                  <h3 className="font-pixel text-green-400 mb-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">Q:</span>
                    書籍情報が間違っているか不完全です
                  </h3>
                  <p className="text-sm ml-4 text-gray-300">
                    <span className="text-pink-400 font-pixel text-xs">A:</span> 現在、Amazonアソシエイト・プログラムの審査中のため、Amazon Product Advertising APIは使用できません。
                    OpenBDおよびGoogle Books APIを代替として使用しているため、一部の書籍情報が不正確または不完全な場合があります。
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-4 hover:border-green-500/50 transition-colors">
                  <h3 className="font-pixel text-green-400 mb-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">Q:</span>
                    特定の書籍をランキングから削除してほしい
                  </h3>
                  <p className="text-sm ml-4 text-gray-300">
                    <span className="text-pink-400 font-pixel text-xs">A:</span> 著作権者ご本人からのご要請の場合、対応いたします。
                    お問い合わせの際は、権利者であることを証明できる情報を添えてご連絡ください。
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-4 hover:border-green-500/50 transition-colors">
                  <h3 className="font-pixel text-green-400 mb-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">Q:</span>
                    データの正確性はどうですか？
                  </h3>
                  <p className="text-sm ml-4 text-gray-300">
                    <span className="text-pink-400 font-pixel text-xs">A:</span> Qiita API、OpenBD、Google Books APIから取得したデータを使用していますが、
                    100%の正確性は保証できません。最新情報は各サービスの公式サイトでご確認ください。
                  </p>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 p-4 hover:border-green-500/50 transition-colors">
                  <h3 className="font-pixel text-green-400 mb-2 flex items-center gap-2 text-xs">
                    <span className="text-cyan-400">Q:</span>
                    広告やアフィリエイトについて
                  </h3>
                  <p className="text-sm ml-4 text-gray-300">
                    <span className="text-pink-400 font-pixel text-xs">A:</span> 当サイトはAmazonアソシエイト・プログラムに参加申請中であり、審査承認後は
                    書籍購入リンクからの紹介料によって運営されます。詳しくは
                    <Link href="/privacy" className="text-green-400 hover:underline mx-1">プライバシーポリシー</Link>
                    をご覧ください。
                  </p>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="bg-yellow-900/30 border border-yellow-700 p-4">
              <h3 className="font-pixel text-yellow-400 mb-3 flex items-center gap-2 text-sm">
                <i className="ri-error-warning-line"></i>
                WARNING
              </h3>
              <ul className="text-sm text-yellow-300/80 space-y-2 ml-4">
                <li><span className="text-yellow-500">►</span> お問い合わせの内容によっては、回答にお時間をいただく場合がございます</li>
                <li><span className="text-yellow-500">►</span> お問い合わせの内容によっては、回答できない場合がございます</li>
                <li><span className="text-yellow-500">►</span> 土日祝日のお問い合わせは、翌営業日以降の対応となります</li>
                <li><span className="text-yellow-500">►</span> 書籍の購入や配送に関するお問い合わせは、Amazon.co.jpへ直接お問い合わせください</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-green-900 text-sm text-gray-500">
            <div className="flex items-center justify-between font-pixel text-xs">
              <div>LAST UPDATE: 2025.10.20</div>
              <Link href="/" className="text-green-500 hover:text-green-400 flex items-center gap-1">
                <i className="ri-home-line"></i>
                HOME
              </Link>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
