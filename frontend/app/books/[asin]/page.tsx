'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import StarRating from '@/components/StarRating';
import PriceDisplay from '@/components/PriceDisplay';
import { getBookDetail, BookDetail } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';
import { getLocale, type Locale } from '@/lib/locale';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const asin = params.asin as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locale, setLocaleState] = useState<Locale>('ja');

  useEffect(() => {
    setLocaleState(getLocale());
    
    // 言語変更イベントをリッスン
    const handleLocaleChangeEvent = () => {
      setLocaleState(getLocale());
    };
    
    window.addEventListener('localeChange', handleLocaleChangeEvent);
    
    return () => {
      window.removeEventListener('localeChange', handleLocaleChangeEvent);
    };
  }, []);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const data = await getBookDetail(asin);
        // 最小表示時間を設けて急な表示変化を防ぐ
        const minDelay = new Promise(resolve => setTimeout(resolve, 300));
        await Promise.all([data, minDelay]);
        setBook(data);
      } catch (err) {
        setError('書籍情報の取得に失敗しました');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBook();
  }, [asin]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex flex-col justify-center items-center py-20 animate-fade-in">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-youtube-red mb-4"></div>
          <p className="text-white text-lg font-medium mb-2 animate-pulse">書籍情報を読み込み中...</p>
          <p className="text-secondary text-sm">少々お待ちください</p>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="bg-red-900/20 border border-red-500 text-red-500 px-4 py-3 rounded animate-slide-down">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-xl"></i>
              <span>{error || '書籍が見つかりませんでした'}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-youtube-red hover:text-red-400 transition-colors duration-200 inline-flex items-center gap-1"
          >
            <i className="ri-arrow-left-line"></i>
            ランキングに戻る
          </button>
        </div>
      </div>
    );
  }

      return (
        <div className="min-h-screen">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            {/* 戻るボタン */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-secondary hover:text-youtube-red mb-6 transition-all duration-200 group"
            >
              <i className="ri-arrow-left-line group-hover:-translate-x-1 transition-transform duration-200"></i>
              <span>ランキングに戻る</span>
            </button>
            
            {/* タイトルエリア */}
            <div className="mb-6">
              <div className="bg-gradient-to-r from-youtube-dark-surface/50 to-transparent rounded-lg p-6 border-l-4 border-youtube-red">
                <h1 className="text-4xl font-bold flex items-center gap-3">
                  <i className="ri-book-marked-line text-youtube-red"></i>
                  {book.title}
                </h1>
              </div>
            </div>
            
            {/* 書籍情報セクション */}
            <div className="card-youtube mb-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* 左側: 画像 + 基本情報 */}
                <div className="flex-shrink-0 lg:w-80">
                  {/* 書籍画像 */}
                  <div className="mb-6 flex justify-center lg:justify-start">
                    {book.image_url ? (
                      <div className="relative w-[240px] h-[360px]">
                        <Image
                          src={book.image_url}
                          alt={book.title}
                          width={240}
                          height={360}
                          className="rounded-lg shadow-2xl"
                          priority
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjM2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQwIiBoZWlnaHQ9IjM2MCIgZmlsbD0iIzJCMkIyQiIvPjwvc3ZnPg=="
                        />
                      </div>
                    ) : (
                      <div className="w-[240px] h-[360px] bg-youtube-dark-hover rounded-lg flex items-center justify-center">
                        <i className="ri-book-line text-6xl text-youtube-dark-text-secondary"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* 基本情報 */}
                  <div className="space-y-3 mb-6">
                    {book.author && (
                      <div className="flex items-start gap-3 p-3 bg-youtube-dark-bg/50 rounded-lg">
                        <i className="ri-user-line text-youtube-red text-lg mt-0.5"></i>
                        <div>
                          <div className="text-xs text-secondary mb-1">著者</div>
                          <div className="text-sm text-white font-medium">{book.author}</div>
                        </div>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="flex items-start gap-3 p-3 bg-youtube-dark-bg/50 rounded-lg">
                        <i className="ri-building-line text-youtube-red text-lg mt-0.5"></i>
                        <div>
                          <div className="text-xs text-secondary mb-1">出版社</div>
                          <div className="text-sm text-white font-medium">{book.publisher}</div>
                        </div>
                      </div>
                    )}
                    {book.publication_date && (
                      <div className="flex items-start gap-3 p-3 bg-youtube-dark-bg/50 rounded-lg">
                        <i className="ri-calendar-line text-youtube-red text-lg mt-0.5"></i>
                        <div>
                          <div className="text-xs text-secondary mb-1">発売日</div>
                          <div className="text-sm text-white font-medium">
                            {formatPublicationDate(book.publication_date, locale)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 星評価 */}
                  {book.rating && (
                    <div className="mb-4">
                      <StarRating
                        rating={book.rating}
                        reviewCount={book.review_count || undefined}
                        amazonUrl={book.amazon_url}
                        size="lg"
                      />
                    </div>
                  )}
                  
                  {/* 価格情報 */}
                  {book.price && (
                    <div className="p-4 bg-youtube-dark-bg/70 rounded-lg border border-youtube-dark-surface mb-4">
                      <div className="text-xs text-secondary mb-2">価格</div>
                      <PriceDisplay
                        price={book.price}
                        salePrice={book.sale_price}
                        discountRate={book.discount_rate}
                        size="lg"
                      />
                    </div>
                  )}
                  
                  {/* 統計情報 */}
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center gap-3 p-3 bg-youtube-dark-bg/50 rounded-lg border border-youtube-dark-surface/50">
                      <i className="ri-eye-line text-blue-400 text-2xl"></i>
                      <div className="flex-1">
                        <div className="text-xs text-secondary mb-0.5">累計再生数</div>
                        <div className="text-xl font-bold text-white">
                          {formatNumber(book.total_views)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-youtube-dark-bg/50 rounded-lg border border-youtube-dark-surface/50">
                      <i className="ri-youtube-line text-youtube-red text-2xl"></i>
                      <div className="flex-1">
                        <div className="text-xs text-secondary mb-0.5">紹介動画数</div>
                        <div className="text-xl font-bold text-white">
                          {book.total_mentions}件
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* 右側: 説明 + CTAボタン */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  {/* 説明文 */}
                  {book.description && (
                    <div className="bg-youtube-dark-bg/50 rounded-lg p-6 border border-youtube-dark-surface/50 flex-1">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <i className="ri-amazon-line text-youtube-red text-xl"></i>
                        <span>Amazon商品説明</span>
                      </h3>
                      <p className="text-secondary leading-relaxed whitespace-pre-wrap">
                        {book.description}
                      </p>
                    </div>
                  )}
                  
                  {/* CTAボタン */}
                  <div className="mt-6 flex gap-3 justify-end">
                    <a
                      href={book.affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-youtube inline-flex items-center gap-2 text-lg px-8 py-4"
                    >
                      <i className="ri-shopping-cart-line text-xl"></i>
                      <span>Amazonで購入</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
        
            {/* YouTube動画セクション */}
            {book.youtube_videos && book.youtube_videos.length > 0 && (
              <div>
                <div className="mb-6">
                  <div className="bg-gradient-to-r from-youtube-dark-surface/50 to-transparent rounded-lg p-4 border-l-4 border-youtube-red">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                      <i className="ri-youtube-line text-youtube-red text-3xl"></i>
                      <span>この本を紹介しているYouTube動画</span>
                      <span className="text-lg text-secondary font-normal">({book.youtube_videos.length}件)</span>
                    </h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {book.youtube_videos.map((video) => (
                    <div key={video.video_id}>
                      <YouTubeEmbed video={video} />
                    </div>
                  ))}
                </div>
            
                {/* 下部CTA */}
                <div className="card-youtube text-center py-10">
                  <i className="ri-shopping-bag-3-line text-5xl text-youtube-red mb-4"></i>
                  <p className="text-xl mb-6 text-white font-medium">この本に興味を持ちましたか？</p>
                  <a
                    href={book.affiliate_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-youtube inline-flex items-center gap-2 text-lg px-10 py-4"
                  >
                    <i className="ri-shopping-cart-line text-xl"></i>
                    <span>Amazonで購入する</span>
                  </a>
                </div>
              </div>
            )}
      </main>
    </div>
  );
}

