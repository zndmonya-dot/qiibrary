'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg animate-fade-in">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-scales-3-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              特定商取引法に基づく表記
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              Commercial Transaction Act Disclosure
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            {/* 重要なお知らせ */}
            <section>
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2 flex items-center gap-2">
                  <i className="ri-information-line"></i>
                  重要なお知らせ
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  当サイトは情報提供サービスであり、書籍や商品の直接販売は行っておりません。
                  書籍の購入はリンク先（Amazon.co.jpなど）で行われ、取引条件・決済方法・配送・返品等は各事業者の規約が適用されます。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                事業者情報
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">サイト名</span>
                  <span>Qiibrary（キーブラリー）</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">運営形態</span>
                  <span>個人事業（ITエンジニア）</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">運営責任者</span>
                  <div>
                    <span>Qiibrary 運営代表（個人事業主）</span><br />
                    <span className="text-xs text-qiita-text-light dark:text-dark-text-light">
                      ※氏名は請求時に開示します
                    </span>
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">所在地</span>
                  <div>
                    <span>東京都内（詳細所在地は請求時に開示）</span><br />
                    <span className="text-xs text-qiita-text-light dark:text-dark-text-light">
                      ※請求があれば遅滞なく開示いたします
                    </span>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                お問い合わせ
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">お問い合わせ:</span>
                  <span>
                    <Link href="/contact" className="text-qiita-green hover-underline font-semibold">
                      お問い合わせページ
                    </Link>
                    からご連絡ください
                  </span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">メール:</span>
                  <span>contact@qiibrary.com（準備中）</span>
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                  <span className="font-semibold min-w-[140px]">対応時間:</span>
                  <span>平日 10:00～18:00（土日祝日を除く）</span>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                サービス内容
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <p>
                  当サイトは、Qiitaの記事や関連するYouTube動画で取り上げられた技術書を独自に抽出し、ランキングや統計情報を表示する情報提供サービスです。
                  ランキングは24時間・30日・365日・年別・全期間の5種類で確認できます。
                </p>
                <p>
                  主な提供機能は以下のとおりです：
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Qiita言及データに基づくランキング表示</li>
                  <li>書籍詳細（著者・出版社・出版日等）の表示</li>
                  <li>関連Qiita記事およびAmazon等への外部リンク</li>
                  <li>YouTubeで紹介された書籍情報の表示（準備中を含む）</li>
                  <li>書籍名・著者名・出版社・ISBNによる検索機能</li>
                </ul>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-3">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  書籍情報について
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  書籍情報は、OpenBDおよびGoogle Books APIから取得しており、一部の書籍情報が不正確または不完全な場合があります。
                  最新かつ正確な情報は、購入前に必ずAmazon.co.jpの商品ページでご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                販売価格・支払方法・配送等
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-4">
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">販売価格</h3>
                  <p>
                    当サイトでは商品の販売を行っていません。書籍の価格はAmazon.co.jpなどリンク先の表示に従います。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">支払方法・支払時期</h3>
                  <p>
                    支払方法および支払時期はAmazon.co.jpの利用規約に準じます。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">商品の引渡時期</h3>
                  <p>
                    Amazon.co.jpが定める配送条件に従います（送料・配送日時等もAmazon.co.jpの表示を参照してください）。
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-qiita-text-dark dark:text-white mb-2">返品・交換・キャンセル</h3>
                  <p>
                    返品やキャンセルはAmazon.co.jpのポリシーに基づき、Amazon.co.jpに直接お問い合わせください。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                アフィリエイトプログラムについて
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、
                  <span className="font-semibold">Amazonアソシエイト・プログラム</span>の参加者です。
                </p>
                <p className="mb-3">
                  当サイトに掲載されている書籍情報のリンクをクリックし、Amazon.co.jpで商品を購入された場合、
                  当サイトは商品価格の一定割合を紹介料として受け取ることがあります。
                </p>
                <p className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                  <i className="ri-information-line text-blue-600 dark:text-blue-400 mr-1"></i>
                  アフィリエイトリンクを経由した購入であっても、お客様に追加の費用が発生することはありません。
                  商品の価格や配送料は、Amazon.co.jpで直接購入した場合と同じです。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                広告掲載について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3">
                <p>
                  当サイトは Google AdSense のプログラムポリシーに基づき広告を掲載します。広告配信事業者は、ユーザーの興味関心に応じた広告を表示するために Cookie や広告識別子を使用する場合があります。
                </p>
                <p>
                  また、Amazon アソシエイトの計測タグでも Cookie が利用されることがあります。いずれの Cookie も当サイト側では閲覧・保存できません。
                </p>
                <div className="text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3 space-y-2">
                  <p>
                    Cookie の利用を制限したい場合はブラウザ設定の変更、または
                    <a
                      href="https://adssettings.google.com/authenticated?hl=ja"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-qiita-green hover-underline mx-1 font-semibold"
                    >
                      Google 広告設定
                    </a>
                    からパーソナライズド広告を停止してください。
                  </p>
                  <p>
                    詳細は
                    <a
                      href="https://policies.google.com/technologies/ads?hl=ja"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-qiita-green hover-underline mx-1 font-semibold"
                    >
                      Google の広告ポリシー
                    </a>
                    および当サイトの
                    <Link href="/privacy" className="text-qiita-green hover-underline mx-1 font-semibold">
                      プライバシーポリシー
                    </Link>
                    をご参照ください。
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                著作権・商標について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-2 text-sm">
                <p>
                  当サイトに掲載されている書籍の表紙画像、タイトル、説明文などは、各著作権者に帰属します。
                </p>
                <p>
                  「Qiita」は、Qiita株式会社の登録商標または商標です。当サイトはQiita株式会社とは関係ありません。
                </p>
                <p>
                  「Amazon」およびAmazonロゴは、Amazon.com, Inc.またはその関連会社の商標です。
                </p>
                <p>
                  当サイトで使用している商標、ロゴ、会社名、製品名などは、各権利者の商標または登録商標です。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                免責事項
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4 space-y-3 text-sm">
                <p>
                  当サイトで提供する情報は、Qiita API、YouTube Data API、OpenBD API、Google Books API 等から取得したデータに基づきます。日次で統計値の更新を行いますが、完全な正確性は保証できません。
                </p>
                <p>
                  最新の情報は必ず公式サイト（Amazon.co.jp 等）でご確認ください。当サイトの利用により発生した損害について、当サイトは責任を負いません。
                </p>
                <p>
                  Amazon.co.jp での購入に関する問い合わせは、Amazon.co.jp カスタマーサービスに直接ご連絡ください。
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-3">
                <p className="text-sm text-red-700 dark:text-red-400">
                  <i className="ri-alert-line mr-1"></i>
                  <strong>重要:</strong> 書籍情報は外部APIから取得しているため、情報の精度が低い場合があります。購入前に必ずAmazon.co.jpで最新情報をご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                掲載情報の削除について
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-2">
                  著作権者ご本人から、書籍情報の削除または修正のご要望がある場合は、
                  <Link href="/contact" className="text-qiita-green hover-underline mx-1 font-semibold">
                    お問い合わせページ
                  </Link>
                  よりご連絡ください。
                </p>
                <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
                  ※ ご連絡の際は、権利者であることを証明できる情報を添えていただきますようお願いいたします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                準拠法・管轄裁判所
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  本表記の解釈および適用については、日本法を準拠法とします。
                </p>
                <p>
                  当サイトに関する紛争については、当サイト運営者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。
                </p>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>制定日: 2025年10月20日</div>
                <div>最終更新日: 2025年12月10日</div>
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
