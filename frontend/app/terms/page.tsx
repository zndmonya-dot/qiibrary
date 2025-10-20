'use client';

import Header from '@/components/Header';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-6 md:p-8 border border-qiita-border dark:border-dark-border shadow-lg">
          {/* ヘッダー */}
          <div className="mb-8 pb-6 border-b border-qiita-border dark:border-dark-border">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
              <i className="ri-file-text-line text-qiita-green dark:text-dark-green text-3xl md:text-4xl"></i>
              利用規約
            </h1>
            <p className="text-sm text-qiita-text-light dark:text-dark-text-light">
              Terms of Service
            </p>
          </div>

          <div className="space-y-8 text-qiita-text dark:text-dark-text leading-relaxed">
            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第1条（適用）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  本規約は、当サイト「Qiibrary」（以下「当サイト」といいます）が提供するサービス（以下「本サービス」といいます）の利用条件を定めるものです。
                  利用者の皆様（以下「利用者」といいます）には、本規約に従って本サービスをご利用いただきます。
                </p>
                <p>
                  本サービスを利用することにより、利用者は本規約に同意したものとみなされます。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第2条（サービスの内容）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">本サービスは、以下の機能を提供します：</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Qiita記事で言及されたIT技術書のランキング表示</li>
                  <li>書籍の詳細情報の提供（OpenBD、Google Books APIを利用）</li>
                  <li>関連するQiita記事の紹介</li>
                  <li>Amazon.co.jpへのアフィリエイトリンクの提供</li>
                  <li>書籍検索機能</li>
                </ul>
                <p className="mt-3 text-sm bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-2">
                  <i className="ri-information-line text-blue-600 dark:text-blue-400 mr-1"></i>
                  当サイトは情報提供サービスであり、書籍の販売や配送は行っておりません。
                </p>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-3">
                <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-2 flex items-center gap-2">
                  <i className="ri-error-warning-line"></i>
                  書籍情報の精度について
                </h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  現在、Amazonアソシエイト・プログラムの審査中のため、Amazon Product Advertising APIは使用できません。
                  そのため、OpenBDおよびGoogle Books APIを代替として使用しており、一部の書籍情報が不正確または不完全な場合があります。
                  審査承認後は、速やかにAmazon APIを使用するようシステム改修を行い、より正確な情報を提供いたします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第3条（利用上の注意）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">利用者は、本サービスの利用にあたり、以下の行為を行ってはならないものとします：</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>法令または公序良俗に違反する行為</li>
                  <li>犯罪行為に関連する行為</li>
                  <li>本サービスの運営を妨害するおそれのある行為</li>
                  <li>他の利用者または第三者の権利利益を侵害する行為</li>
                  <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                  <li>本サービスによって得られた情報を商業的に利用する行為</li>
                  <li>不正アクセスをし、またはこれを試みる行為</li>
                  <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                  <li>不正な目的を持って本サービスを利用する行為</li>
                  <li>当サイトの他の利用者または第三者に不利益、損害、不快感を与える行為</li>
                  <li>当サイトの提供するサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                  <li>その他、当サイトが不適切と判断する行為</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第4条（本サービスの提供の停止等）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                  <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                  <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                  <li>その他、当サイトが本サービスの提供が困難と判断した場合</li>
                </ul>
                <p className="mt-3 text-sm">
                  当サイトは、本サービスの提供の停止または中断により、利用者または第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第5条（著作権）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  本サービスで提供されるコンテンツ（テキスト、画像、ロゴ、デザイン、プログラムなど）の著作権またはその他の知的財産権は、当サイトまたは正当な権利者に帰属します。
                </p>
                <p className="mb-3">
                  利用者は、当サイトおよび正当な権利者の承諾を得ることなく、いかなる方法においても複製、転載、公衆送信、翻訳、販売、貸与などの行為をすることはできません。
                </p>
                <p className="text-sm">
                  ただし、Qiita記事の情報、書籍情報など、外部サービスから取得した情報の著作権は、それぞれの権利者に帰属します。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第6条（免責事項）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、本サービスに関して以下の事項について一切の責任を負わないものとします：
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>本サービスで提供される情報の正確性、完全性、有用性、最新性、適法性</li>
                  <li>本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないこと</li>
                  <li>本サービスの中断、停止、終了、利用不能または変更</li>
                  <li>本サービスの利用により利用者に発生したいかなる損害</li>
                  <li>外部サービス（Amazon.co.jp、Qiita、OpenBD、Google Booksなど）で発生したトラブル</li>
                  <li>アフィリエイトリンクを通じた購入取引に関する一切の事項</li>
                  <li>利用者間または利用者と第三者との間で生じたトラブル</li>
                </ul>
                <p className="mt-3 text-sm bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
                  <i className="ri-alert-line text-red-600 dark:text-red-400 mr-1"></i>
                  特に、Amazonアソシエイト審査中のため、書籍情報の精度が低い場合があります。購入前に必ずAmazon.co.jpで最新情報をご確認ください。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第7条（アフィリエイトプログラム）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムに参加申請中です。
                </p>
                <p className="mb-3">
                  審査承認後、利用者が当サイトのリンクを通じて商品を購入された場合、当サイトは紹介料を受け取ることがあります。これにより利用者に追加の費用が発生することはありません。
                </p>
                <p className="text-sm">
                  書籍の価格、在庫状況、配送などの取引条件は、すべてAmazon.co.jpが定めるものであり、当サイトは一切の責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第8条（サービス内容の変更等）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、利用者への事前の告知なく、本サービスの内容を変更、追加または廃止することがあり、利用者はこれを承諾するものとします。
                </p>
                <p className="text-sm">
                  当サイトは、本サービスの変更、追加、廃止により利用者に生じた損害について一切の責任を負いません。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第9条（利用規約の変更）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  当サイトは、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
                </p>
                <p className="mb-3">
                  変更後の本規約は、当サイトに掲載したときから効力を生じるものとします。
                </p>
                <p className="text-sm">
                  本規約の変更後に本サービスを利用した利用者は、変更後の規約に同意したものとみなします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第10条（個人情報の取扱い）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p>
                  当サイトは、本サービスの利用によって取得する個人情報については、当サイト
                  <Link href="/privacy" className="text-qiita-green hover:underline mx-1 font-semibold">
                    「プライバシーポリシー」
                  </Link>
                  に従い適切に取り扱うものとします。
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-lg md:text-xl font-bold text-qiita-text-dark dark:text-white mb-4 pb-2 border-b border-qiita-border/50 dark:border-dark-border/50">
                第11条（準拠法・裁判管轄）
              </h2>
              <div className="bg-qiita-surface dark:bg-dark-surface-light rounded-lg p-4">
                <p className="mb-3">
                  本規約の解釈にあたっては、日本法を準拠法とします。
                </p>
                <p>
                  本サービスに関して紛争が生じた場合には、当サイトの所在地を管轄する裁判所を専属的合意管轄とします。
                </p>
              </div>
            </section>
          </div>

          {/* フッター */}
          <div className="mt-8 pt-6 border-t border-qiita-border dark:border-dark-border text-sm text-qiita-text-light dark:text-dark-text-light">
            <div className="flex items-center justify-between">
              <div>
                <div>制定日: 2025年10月20日</div>
                <div>最終更新日: 2025年10月20日</div>
              </div>
              <Link href="/" className="text-qiita-green hover:underline flex items-center gap-1">
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
