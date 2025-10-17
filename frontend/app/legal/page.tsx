'use client';

import Header from '@/components/Header';
import { useState, useEffect } from 'react';
import { getLocale } from '@/lib/locale';

export default function LegalPage() {
  const [locale, setLocaleState] = useState<'ja' | 'en'>('ja');

  useEffect(() => {
    setLocaleState(getLocale());
    
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-youtube-dark-surface rounded-lg p-8 border border-youtube-dark-hover">
          {locale === 'ja' ? (
            <>
              <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <i className="ri-scales-3-line text-youtube-red"></i>
                特定商取引法に基づく表記
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">販売事業者</h2>
                  <p>個人運営（屋号なし）</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">運営責任者</h2>
                  <p>[運営者名を記載してください]</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">所在地</h2>
                  <p>
                    [所在地を記載してください]<br />
                    ※請求があれば遅滞なく開示いたします。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">お問い合わせ</h2>
                  <p>
                    お問い合わせページからご連絡ください。<br />
                    メールアドレス: [メールアドレスを記載してください]
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">販売価格</h2>
                  <p>
                    当サイトは情報提供サービスであり、商品の直接販売は行っておりません。<br />
                    書籍の価格は、リンク先のAmazon.co.jp / Amazon.comでご確認ください。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">支払方法・支払時期</h2>
                  <p>
                    当サイトでは商品の直接販売を行っておりません。<br />
                    購入はAmazon.co.jp / Amazon.comで行われ、支払方法・時期は各サイトの規約に従います。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">商品の引渡時期</h2>
                  <p>
                    当サイトでは商品の直接販売を行っておりません。<br />
                    商品の引渡時期は、購入先（Amazon.co.jp / Amazon.com）の規約に従います。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">返品・交換</h2>
                  <p>
                    当サイトでは商品の直接販売を行っておりません。<br />
                    返品・交換については、購入先（Amazon.co.jp / Amazon.com）の規約に従います。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">アフィリエイトプログラムについて</h2>
                  <p className="mb-2">
                    当サイトは、以下のアフィリエイトプログラムの参加者です：
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Amazon.co.jpアソシエイト・プログラム</li>
                    <li>Amazon.com Associates Program</li>
                  </ul>
                  <p className="mt-2">
                    当サイトが紹介する商品リンクを経由して商品が購入された場合、
                    Amazon.co.jp / Amazon.comより紹介料を受け取ることがあります。
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">免責事項</h2>
                  <p>
                    当サイトで提供する情報は、Amazon Product Advertising APIおよびYouTube Data APIから取得したものです。
                    情報の正確性については保証いたしかねます。最新の情報は、各サービスの公式サイトでご確認ください。
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
                <i className="ri-scales-3-line text-youtube-red"></i>
                Commercial Transaction Act Disclosure
              </h1>

              <div className="space-y-6 text-secondary leading-relaxed">
                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Business Operator</h2>
                  <p>Individual Operation (No trade name)</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Operator Name</h2>
                  <p>[Please enter operator name]</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Address</h2>
                  <p>
                    [Please enter address]<br />
                    *Will be disclosed without delay upon request.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
                  <p>
                    Please contact us through the contact page.<br />
                    Email: [Please enter email address]
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Prices</h2>
                  <p>
                    This site is an information service and does not directly sell products.<br />
                    Please check book prices on Amazon.co.jp / Amazon.com.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Payment Method and Timing</h2>
                  <p>
                    This site does not directly sell products.<br />
                    Purchases are made on Amazon.co.jp / Amazon.com, and payment methods/timing follow their terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Product Delivery</h2>
                  <p>
                    This site does not directly sell products.<br />
                    Product delivery timing follows the terms of the purchase site (Amazon.co.jp / Amazon.com).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Returns and Exchanges</h2>
                  <p>
                    This site does not directly sell products.<br />
                    Returns and exchanges follow the terms of the purchase site (Amazon.co.jp / Amazon.com).
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">About Affiliate Programs</h2>
                  <p className="mb-2">
                    This site is a participant in the following affiliate programs:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Amazon.co.jp Associates Program</li>
                    <li>Amazon.com Associates Program</li>
                  </ul>
                  <p className="mt-2">
                    When products are purchased through product links introduced on this site,
                    this site may receive referral fees from Amazon.co.jp / Amazon.com.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold text-white mb-3">Disclaimer</h2>
                  <p>
                    Information provided on this site is obtained from Amazon Product Advertising API and YouTube Data API.
                    We cannot guarantee the accuracy of the information. Please check the official sites of each service for the latest information.
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

