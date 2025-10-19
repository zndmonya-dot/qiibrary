'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import YouTubeEmbed from '@/components/YouTubeEmbed';
import LoadingSpinner from '@/components/LoadingSpinner';
import { getBookDetail, BookDetail } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  // URLパラメータ名は互換性のため'asin'のままだが、実際にはISBNとして扱う
  const asin = params.asin as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(10); // 初期表示件数

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      setDisplayedArticlesCount(10); // 表示件数をリセット
      
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
      <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
        <Header />
        <main className="container mx-auto px-4 min-h-[calc(100vh-120px)]">
          <LoadingSpinner message="書籍情報を読み込み中..." size="lg" />
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
        <Header />
        <div className="container mx-auto px-4 py-8 animate-fade-in">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded animate-slide-down">
            <div className="flex items-center gap-2">
              <i className="ri-error-warning-line text-xl"></i>
              <span>{error || '書籍が見つかりませんでした'}</span>
            </div>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-qiita-green dark:text-dark-green hover:text-qiita-green-dark dark:hover:text-dark-green transition-colors duration-200 inline-flex items-center gap-1"
          >
            <i className="ri-arrow-left-line"></i>
            ランキングに戻る
          </button>
        </div>
      </div>
    );
  }

      return (
        <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg">
          <Header />
          
          <main className="container mx-auto px-4 py-8">
            {/* 戻るボタン */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-secondary hover:text-qiita-green dark:hover:text-dark-green mb-6 transition-colors duration-200 text-base md:text-lg lg:text-xl font-semibold lg:font-bold animate-fade-in-up"
            >
              <i className="ri-arrow-left-line text-lg md:text-xl lg:text-2xl"></i>
              <span>ランキングに戻る</span>
            </button>
            
            {/* タイトルエリア */}
            <div className="mb-6 animate-fade-in-up animate-delay-100">
              <div className="bg-qiita-card dark:bg-dark-surface rounded-lg p-4 md:p-6 border-l-4 border-qiita-green shadow-sm">
                <h1 className="text-lg md:text-3xl lg:text-4xl font-bold lg:font-extrabold flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white leading-tight">
                  <i className="ri-book-marked-line text-qiita-green dark:text-dark-green text-xl md:text-3xl lg:text-4xl flex-shrink-0"></i>
                  <span className="break-words">{book.title}</span>
                </h1>
              </div>
            </div>
            
            {/* 書籍情報セクション */}
            <div className="card-primary mb-8 animate-fade-in-up animate-delay-200">
              <div className="flex flex-col lg:flex-row-reverse lg:items-stretch gap-6">
                {/* 右側: 画像 + 統計情報（デスクトップのみ） */}
                <div className="hidden lg:flex lg:flex-col flex-shrink-0 lg:w-72">
                  {/* 書籍画像 */}
                  <div className="mb-4 flex justify-center">
                    {book.thumbnail_url ? (
                      <div className="relative w-[200px] h-[300px] rounded-lg shadow-lg">
                        <Image
                          src={book.thumbnail_url}
                          alt={book.title}
                          width={200}
                          height={300}
                          className="rounded-lg"
                          style={{ width: '200px', height: 'auto', maxHeight: '300px', objectFit: 'cover' }}
                          priority
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzJCMkIyQiIvPjwvc3ZnPg=="
                        />
                      </div>
                    ) : (
                      <div className="w-[200px] h-[300px] bg-qiita-surface dark:bg-dark-surface-light rounded-lg flex items-center justify-center border border-qiita-border dark:border-dark-border">
                        <i className="ri-book-line text-5xl text-qiita-text-light dark:text-dark-text-light"></i>
                      </div>
                    )}
                  </div>
                  
                  {/* 統計情報 */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-qiita-green/10 dark:bg-qiita-green/20 rounded-lg border-2 border-qiita-green/30 dark:border-qiita-green/40">
                      <i className="ri-article-line text-qiita-green dark:text-dark-green text-xl md:text-2xl lg:text-3xl mb-1 md:mb-2"></i>
                      <div className="text-lg md:text-xl lg:text-2xl font-bold lg:font-extrabold text-qiita-text-dark dark:text-white">
                        {book.qiita_articles?.length || 0}
                      </div>
                      <div className="text-xs lg:text-sm text-qiita-text dark:text-dark-text font-semibold lg:font-bold">記事</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 md:p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border-2 border-pink-200 dark:border-pink-800/40">
                      <i className="ri-heart-fill text-pink-500 dark:text-pink-400 text-xl md:text-2xl lg:text-3xl mb-1 md:mb-2"></i>
                      <div className="text-lg md:text-xl lg:text-2xl font-bold lg:font-extrabold text-qiita-text-dark dark:text-white">
                        {formatNumber(book.qiita_articles?.reduce((sum, a) => sum + a.likes_count, 0) || 0)}
                      </div>
                      <div className="text-xs lg:text-sm text-qiita-text dark:text-dark-text font-semibold lg:font-bold">いいね</div>
                    </div>
                  </div>
                  
                  {/* 購入ボタン（デスクトップのみ） */}
                  {book.amazon_affiliate_url && (
                    <a
                      href={book.amazon_affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-amazon w-full justify-center text-center py-3"
                    >
                      <i className="ri-amazon-line text-xl"></i>
                      <span>Amazonで購入</span>
                    </a>
                  )}
                </div>
                
                {/* 左側: 基本情報 + 説明 */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {/* 基本情報グリッド */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 md:mb-6">
                    {book.author && (
                      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-qiita-border dark:border-dark-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-user-line text-qiita-green dark:text-dark-green text-lg lg:text-xl"></i>
                          <span className="text-xs lg:text-sm text-secondary mb-2 font-semibold lg:font-bold">著者</span>
                        </div>
                        <div className="text-sm lg:text-base text-qiita-text-dark dark:text-white font-semibold lg:font-bold line-clamp-2">
                          {book.author}
                        </div>
                      </div>
                    )}
                    {book.publisher && (
                      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-qiita-border dark:border-dark-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-building-line text-qiita-green dark:text-dark-green text-lg lg:text-xl"></i>
                          <span className="text-xs lg:text-sm text-secondary font-semibold lg:font-bold">出版社</span>
                        </div>
                        <div className="text-sm lg:text-base text-qiita-text-dark dark:text-white font-semibold lg:font-bold">
                          {book.publisher}
                        </div>
                      </div>
                    )}
                    {book.publication_date && (
                      <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-qiita-border dark:border-dark-border shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-calendar-line text-qiita-green dark:text-dark-green text-lg lg:text-xl"></i>
                          <span className="text-xs lg:text-sm text-secondary font-semibold lg:font-bold">発売日</span>
                        </div>
                        <div className="text-sm lg:text-base text-qiita-text-dark dark:text-white font-semibold lg:font-bold">
                          {formatPublicationDate(book.publication_date)}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* 説明文 */}
                  {book.description && (
                    <div className="bg-white dark:bg-dark-surface rounded-lg p-4 md:p-6 border border-qiita-border dark:border-dark-border shadow-sm flex-1">
                      <div className="flex items-center gap-2 mb-3 md:mb-4">
                        <i className="ri-book-open-line text-qiita-green dark:text-dark-green text-lg lg:text-xl"></i>
                        <span className="text-xs lg:text-sm text-secondary font-semibold lg:font-bold">書籍説明</span>
                      </div>
                      <div className="text-xs lg:text-base text-qiita-text-dark dark:text-dark-text leading-relaxed whitespace-pre-wrap font-medium">
                        {book.description}
                      </div>
                    </div>
                  )}
                  
                  {/* 統計情報（スマホのみ） */}
                  <div className="grid lg:hidden grid-cols-2 gap-3 mt-4">
                    <div className="flex flex-col items-center justify-center p-3 bg-qiita-green/10 dark:bg-qiita-green/20 rounded-lg border-2 border-qiita-green/30 dark:border-qiita-green/40">
                      <i className="ri-article-line text-qiita-green dark:text-dark-green text-xl mb-1"></i>
                      <div className="text-lg font-bold text-qiita-text-dark dark:text-white">
                        {book.qiita_articles?.length || 0}
                      </div>
                      <div className="text-xs text-qiita-text dark:text-dark-text font-semibold">記事</div>
                    </div>
                    <div className="flex flex-col items-center justify-center p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border-2 border-pink-200 dark:border-pink-800/40">
                      <i className="ri-heart-fill text-pink-500 dark:text-pink-400 text-xl mb-1"></i>
                      <div className="text-lg font-bold text-qiita-text-dark dark:text-white">
                        {formatNumber(book.qiita_articles?.reduce((sum, a) => sum + a.likes_count, 0) || 0)}
                      </div>
                      <div className="text-xs text-qiita-text dark:text-dark-text font-semibold">いいね</div>
                    </div>
                  </div>
                  
                  {/* 購入ボタン（スマホのみ） */}
                  {book.amazon_affiliate_url && (
                    <a
                      href={book.amazon_affiliate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="lg:hidden btn-amazon w-full justify-center text-center py-3 mt-4"
                    >
                      <i className="ri-amazon-line text-xl"></i>
                      <span>Amazonで購入</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
        
            {/* Qiita記事セクション */}
            {book.qiita_articles && book.qiita_articles.length > 0 && (
              <div id="qiita-articles" className="mb-12 scroll-mt-24 animate-fade-in-up animate-delay-300">
                {/* セクションヘッダー */}
                <div className="mb-6">
                  <div className="bg-qiita-green/10 dark:bg-qiita-green/20 rounded-lg p-3 md:p-5 border-l-4 border-qiita-green">
                    <h2 className="text-base md:text-xl lg:text-2xl font-bold lg:font-extrabold flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
                      <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-qiita-green dark:bg-dark-green rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="ri-article-fill text-white text-lg md:text-2xl lg:text-3xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                          <span className="text-sm md:text-base lg:text-lg">この本を紹介しているQiita記事</span>
                          <span className="bg-qiita-green dark:bg-dark-green text-white text-xs md:text-sm lg:text-base font-bold px-2 md:px-3 lg:px-4 py-0.5 md:py-1 rounded-full">
                            {book.qiita_articles.length}件
                          </span>
                        </div>
                        <p className="text-xs md:text-sm lg:text-base text-qiita-text dark:text-dark-text font-normal lg:font-medium mt-1">
                          実際に使ってみた開発者の声
                        </p>
                      </div>
                    </h2>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {book.qiita_articles.slice(0, displayedArticlesCount).map((article) => (
                    <a
                      key={article.id}
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group bg-white dark:bg-dark-surface rounded-lg p-3 md:p-5 border border-qiita-border dark:border-dark-border hover:border-qiita-green/50 dark:hover:border-qiita-green/50 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-qiita-green/10 dark:bg-qiita-green/20 rounded-lg flex items-center justify-center border border-qiita-green/30 dark:border-qiita-green/40">
                            <i className="ri-article-line text-qiita-green dark:text-dark-green text-lg md:text-2xl lg:text-3xl"></i>
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-qiita-text-dark dark:text-white font-bold lg:font-extrabold mb-2 group-hover:text-qiita-green dark:group-hover:text-dark-green transition-colors duration-200 line-clamp-2 text-sm md:text-base lg:text-lg">
                            {article.title}
                          </h3>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm lg:text-base text-qiita-text dark:text-dark-text mb-3 font-medium lg:font-semibold">
                            <div className="flex items-center gap-1.5">
                              <i className="ri-user-line"></i>
                              <span>{article.author_name || article.author_id}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <i className="ri-heart-line"></i>
                              <span>{formatNumber(article.likes_count)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <i className="ri-bookmark-line"></i>
                              <span>{formatNumber(article.stocks_count)}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <i className="ri-calendar-line"></i>
                              <span>{new Date(article.published_at).toLocaleDateString('ja-JP')}</span>
                            </div>
                          </div>
                          
                          {article.tags && article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {article.tags.slice(0, 5).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-1 bg-qiita-green/10 dark:bg-qiita-green/20 text-qiita-green dark:text-dark-green text-xs rounded border border-qiita-green/30 dark:border-qiita-green/40"
                                >
                                  <i className="ri-price-tag-3-line text-xs"></i>
                                  {tag}
                                </span>
                              ))}
                              {article.tags.length > 5 && (
                                <span className="inline-flex items-center px-2 py-1 text-secondary text-xs">
                                  +{article.tags.length - 5}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-shrink-0">
                          <i className="ri-external-link-line text-secondary group-hover:text-qiita-green dark:group-hover:text-dark-green text-xl transition-colors"></i>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
                
                {/* もっと見る / すべて表示ボタン */}
                {book.qiita_articles.length > displayedArticlesCount && (
                  <div className="mt-6 flex gap-2 md:gap-4 justify-center flex-wrap">
                    <button
                      onClick={() => setDisplayedArticlesCount(prev => Math.min(prev + 10, book.qiita_articles.length))}
                      className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base lg:text-lg bg-qiita-green dark:bg-dark-green text-white rounded-lg hover:opacity-90 transition-opacity duration-200 font-semibold lg:font-bold flex items-center justify-center gap-1.5 md:gap-2"
                    >
                      <i className="ri-arrow-down-line text-base md:text-lg lg:text-xl"></i>
                      もっと見る（+10件）
                    </button>
                    <button
                      onClick={() => setDisplayedArticlesCount(book.qiita_articles.length)}
                      className="px-4 md:px-6 py-2 md:py-3 text-sm md:text-base lg:text-lg bg-qiita-surface dark:bg-dark-surface-light text-qiita-text-dark dark:text-white rounded-lg hover:bg-qiita-green/10 dark:hover:bg-qiita-green/20 transition-colors duration-200 font-semibold lg:font-bold border border-qiita-border dark:border-dark-border flex items-center justify-center gap-1.5 md:gap-2"
                    >
                      <i className="ri-list-check text-base md:text-lg lg:text-xl"></i>
                      すべて表示（全{book.qiita_articles.length}件）
                    </button>
                  </div>
                )}
              </div>
            )}
        
            {/* YouTube動画セクション */}
            {book.youtube_videos && book.youtube_videos.length > 0 && (
              <div className="mb-12 animate-fade-in-up animate-delay-300">
                {/* セクションヘッダー */}
                <div className="mb-6">
                  <div className="bg-youtube-red/10 dark:bg-youtube-red/20 rounded-lg p-3 md:p-5 border-l-4 border-youtube-red">
                    <h2 className="text-base md:text-xl lg:text-2xl font-bold lg:font-extrabold flex items-center gap-2 md:gap-3 text-qiita-text-dark dark:text-white">
                      <div className="w-10 h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 bg-youtube-red rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                        <i className="ri-youtube-fill text-white text-lg md:text-2xl lg:text-3xl"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                          <span className="text-sm md:text-base lg:text-lg">この本を紹介しているYouTube動画</span>
                          <span className="bg-youtube-red text-white text-xs md:text-sm lg:text-base font-bold px-2 md:px-3 lg:px-4 py-0.5 md:py-1 rounded-full">
                            {book.youtube_videos.length}件
                          </span>
                        </div>
                        <p className="text-xs md:text-sm lg:text-base text-qiita-text dark:text-dark-text font-normal lg:font-medium mt-1">
                          動画で詳しい解説をチェック
                        </p>
                      </div>
                    </h2>
                  </div>
                </div>
                
                {/* 動画グリッド */}
                <div className={`grid gap-6 ${
                  book.youtube_videos.length === 1 
                    ? 'grid-cols-1 max-w-2xl mx-auto' 
                    : 'grid-cols-1 lg:grid-cols-2'
                }`}>
                  {book.youtube_videos.map((video) => (
                    <YouTubeEmbed key={video.video_id} video={video} />
                  ))}
                </div>
              </div>
            )}
      </main>
      
      <Footer />
    </div>
  );
}

