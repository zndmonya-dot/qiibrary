'use client';

import Header from '@/components/Header';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-8 border border-qiita-border dark:border-dark-border">
          <h1 className="text-3xl font-bold mb-6 flex items-center gap-2 text-qiita-text-dark dark:text-white">
            <i className="ri-file-text-line text-qiita-green dark:text-dark-green"></i>
            利用規約
          </h1>

          <div className="space-y-6 text-qiita-text dark:text-dark-text leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第1条（適用）</h2>
              <p>
                本規約は、当サイト「Qiibrary」（以下「当サイト」といいます）が提供するサービス（以下「本サービス」といいます）の利用条件を定めるものです。
                利用者の皆様（以下「利用者」といいます）には、本規約に従って本サービスをご利用いただきます。
              </p>
              <p className="mt-2">
                本サービスを利用することにより、利用者は本規約に同意したものとみなされます。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第2条（サービスの内容）</h2>
              <p className="mb-2">本サービスは、以下の機能を提供します：</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Qiita記事で言及されたIT技術書のランキング表示</li>
                <li>書籍の詳細情報の提供</li>
                <li>関連するQiita記事の紹介</li>
                <li>Amazon.co.jpへのアフィリエイトリンクの提供</li>
                <li>書籍検索機能</li>
              </ul>
              <p className="mt-2">
                当サイトは情報提供サービスであり、書籍の販売や配送は行っておりません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第3条（利用上の注意）</h2>
              <p className="mb-2">利用者は、本サービスの利用にあたり、以下の行為を行ってはならないものとします：</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>法令または公序良俗に違反する行為</li>
                <li>犯罪行為に関連する行為</li>
                <li>本サービスの運営を妨害するおそれのある行為</li>
                <li>他の利用者または第三者の権利利益を侵害する行為</li>
                <li>当サイトのサーバーまたはネットワークの機能を破壊したり、妨害したりする行為</li>
                <li>本サービスによって得られた情報を商業的に利用する行為</li>
                <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
                <li>不正アクセスをし、またはこれを試みる行為</li>
                <li>他の利用者に関する個人情報等を収集または蓄積する行為</li>
                <li>不正な目的を持って本サービスを利用する行為</li>
                <li>当サイトの他の利用者または第三者に不利益、損害、不快感を与える行為</li>
                <li>当サイトの提供するサービスに関連して、反社会的勢力に対して直接または間接に利益を供与する行為</li>
                <li>その他、当サイトが不適切と判断する行為</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第4条（本サービスの提供の停止等）</h2>
              <p className="mb-2">
                当サイトは、以下のいずれかの事由があると判断した場合、利用者に事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                <li>地震、落雷、火災、停電または天災などの不可抗力により、本サービスの提供が困難となった場合</li>
                <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                <li>その他、当サイトが本サービスの提供が困難と判断した場合</li>
              </ul>
              <p className="mt-2">
                当サイトは、本サービスの提供の停止または中断により、利用者または第三者が被ったいかなる不利益または損害についても、一切の責任を負わないものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第5条（著作権）</h2>
              <p>
                本サービスで提供されるコンテンツ（テキスト、画像、ロゴ、デザイン、プログラムなど）の著作権またはその他の知的財産権は、当サイトまたは正当な権利者に帰属します。
              </p>
              <p className="mt-2">
                利用者は、当サイトおよび正当な権利者の承諾を得ることなく、いかなる方法においても複製、転載、公衆送信、翻訳、販売、貸与などの行為をすることはできません。
              </p>
              <p className="mt-2">
                ただし、Qiita記事の情報、Amazon.co.jpの書籍情報など、外部サービスから取得した情報の著作権は、それぞれの権利者に帰属します。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第6条（免責事項）</h2>
              <p className="mb-2">
                当サイトは、本サービスに関して以下の事項について一切の責任を負わないものとします：
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>本サービスで提供される情報の正確性、完全性、有用性、最新性、適法性</li>
                <li>本サービスに事実上または法律上の瑕疵（安全性、信頼性、正確性、完全性、有効性、特定の目的への適合性、セキュリティなどに関する欠陥、エラーやバグ、権利侵害などを含みます）がないこと</li>
                <li>本サービスの中断、停止、終了、利用不能または変更</li>
                <li>本サービスの利用により利用者に発生したいかなる損害</li>
                <li>外部サービス（Amazon.co.jp、Qiitaなど）で発生したトラブル</li>
                <li>アフィリエイトリンクを通じた購入取引に関する一切の事項</li>
                <li>利用者間または利用者と第三者との間で生じたトラブル</li>
              </ul>
              <p className="mt-2">
                当サイトは、本サービスに関して、利用者と他の利用者または第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第7条（アフィリエイトプログラム）</h2>
              <p className="mb-2">
                当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
              </p>
              <p className="mt-2">
                当サイトのリンクを通じて商品を購入された場合、当サイトは紹介料を受け取ることがあります。これにより利用者に追加の費用が発生することはありません。
              </p>
              <p className="mt-2">
                書籍の価格、在庫状況、配送などの取引条件は、すべてAmazon.co.jpが定めるものであり、当サイトは一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第8条（サービス内容の変更等）</h2>
              <p>
                当サイトは、利用者への事前の告知なく、本サービスの内容を変更、追加または廃止することがあり、利用者はこれを承諾するものとします。
              </p>
              <p className="mt-2">
                当サイトは、本サービスの変更、追加、廃止により利用者に生じた損害について一切の責任を負いません。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第9条（利用規約の変更）</h2>
              <p>
                当サイトは、必要と判断した場合には、利用者に通知することなくいつでも本規約を変更することができるものとします。
              </p>
              <p className="mt-2">
                変更後の本規約は、当サイトに掲載したときから効力を生じるものとします。
              </p>
              <p className="mt-2">
                本規約の変更後に本サービスを利用した利用者は、変更後の規約に同意したものとみなします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第10条（個人情報の取扱い）</h2>
              <p>
                当サイトは、本サービスの利用によって取得する個人情報については、当サイト「プライバシーポリシー」に従い適切に取り扱うものとします。
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-qiita-text-dark dark:text-white mb-3">第11条（準拠法・裁判管轄）</h2>
              <p>
                本規約の解釈にあたっては、日本法を準拠法とします。
              </p>
              <p className="mt-2">
                本サービスに関して紛争が生じた場合には、当サイトの所在地を管轄する裁判所を専属的合意管轄とします。
              </p>
            </section>

            <p className="text-sm pt-6 border-t border-qiita-border dark:border-dark-border text-qiita-text dark:text-dark-text">
              制定日: 2025年10月20日<br />
              最終更新日: 2025年10月20日
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
