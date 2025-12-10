'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoadingSpinner from '@/components/LoadingSpinner';
import BookImage from '@/components/BookImage';
import { AdSenseDisplay } from '@/components/AdSense';
import { getBookDetail, BookDetail } from '@/lib/api';
import { formatNumber, formatPublicationDate } from '@/lib/utils';
import { generateBookStructuredData } from '@/lib/seo';

export default function BookDetailPage() {
  const params = useParams();
  const asin = params.asin as string;
  
  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [displayedArticlesCount, setDisplayedArticlesCount] = useState(10);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBookDetail(asin);
        setBook(data);
        document.title = `${data.title} | Qiibrary`;
      } catch (err: any) {
        console.error(err);
        setError('Failed to load data from server mainframe.');
      } finally {
        setLoading(false);
      }
    };
    fetchBook();
  }, [asin]);

  const handleShowMore = useCallback(() => {
    setDisplayedArticlesCount(prev => prev + 10);
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner />
      </div>
      <Footer />
    </div>
  );

  if (error || !book) return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="text-red-500 font-pixel text-4xl mb-4">GAME OVER</div>
        <p className="text-gray-400 font-mono mb-8">{error}</p>
        <Link href="/" className="retro-btn">
          TRY AGAIN
        </Link>
      </div>
      <Footer />
    </div>
  );

  const totalLikes = book.qiita_articles?.reduce((sum, article) => sum + (article.likes_count || 0), 0) || 0;

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono">
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(generateBookStructuredData(book)) }}
      />
      
      {/* Scanline Effect */}
      <div className="crt-flicker"></div>
      
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-12 relative z-10">
        {/* Breadcrumbs - Sticky & Visible */}
        <div className="sticky top-[60px] z-40 bg-black py-4 mb-8 flex flex-wrap items-center gap-2 text-xs font-pixel border-b-2 border-green-900 w-full shadow-lg">
           <Link href="/" className="text-green-500 hover:text-white transition-colors uppercase text-sm">[HOME]</Link>
           <span className="text-gray-500 text-sm">&gt;</span>
           <span className="text-gray-300 break-words line-clamp-1 text-sm">{book.title}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column: Book Details - Fixed Layout */}
          <div className="lg:w-1/3 lg:sticky lg:top-[140px] lg:self-start w-full max-w-[360px] mx-auto" style={{ willChange: 'transform' }}>
             <div className="bg-black border-4 border-green-500 p-1 shadow-[8px_8px_0_#166534] relative group">
                <div className="absolute -top-3 right-2 bg-yellow-500 text-black font-pixel text-xs px-2 py-1 z-10 shadow-[2px_2px_0_#a16207]">
                  ITEM INFO
                </div>
                
                <div className="p-4 border border-gray-800 bg-black">
                  <div className="w-56 mx-auto mb-6 border-4 border-white shadow-lg relative aspect-[2/3]">
                     <BookImage
                        src={book.thumbnail_url}
                        alt={book.title}
                        width={224}
                        height={336}
                        priority={true}
                        className="w-full h-full object-cover filter contrast-125"
                      />
                  </div>
                  
                  <h1 className="font-pixel text-2xl text-white mb-2 leading-tight text-center text-shadow-glow">{book.title}</h1>
                  <p className="font-mono text-center text-green-500 text-base mb-4">{book.author}</p>
                  
                  <div className="space-y-2 mb-6 font-mono text-sm border-t border-gray-800 pt-4">
                     <div className="flex justify-between">
                       <span className="text-gray-500">PUB:</span>
                       <span>{book.publisher}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-500">DATE:</span>
                       <span>{book.publication_date ? formatPublicationDate(book.publication_date) : 'UNKNOWN'}</span>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-900 border-2 border-cyan-600 p-3 text-center shadow-[3px_3px_0_#0e7490]">
                      <div className="text-[10px] text-cyan-400 font-pixel mb-1">MENTIONS</div>
                      <div className="text-2xl font-pixel text-cyan-300">{formatNumber(book.total_mentions)}</div>
                    </div>
                    <div className="bg-gray-900 border-2 border-pink-600 p-3 text-center shadow-[3px_3px_0_#86198f]">
                      <div className="text-[10px] text-pink-400 font-pixel mb-1">LIKES</div>
                      <div className="text-2xl font-pixel text-pink-300">{formatNumber(totalLikes)}</div>
                    </div>
                  </div>

                  {book.amazon_affiliate_url && (
                    <a 
                      href={book.amazon_affiliate_url} 
                      target="_blank" 
                      rel="nofollow noreferrer"
                      className="block w-full text-center py-3 bg-yellow-500 text-black font-pixel text-sm border-2 border-yellow-300 shadow-[4px_4px_0_#a16207] hover:bg-yellow-400 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
                    >
                      ▶ BUY ON AMAZON
                    </a>
                  )}
                </div>
             </div>
             
             {/* Description Box */}
             <div className="mt-6 border-2 border-gray-700 bg-black p-4 relative shadow-[4px_4px_0_#1a1a1a]">
                <div className="absolute -top-3 left-4 bg-black px-2 font-pixel text-xs text-gray-500 border border-gray-700">DESCRIPTION</div>
                <p className="text-base leading-relaxed text-gray-400 font-mono text-justify">
                  {book.description || 'No data available in archives.'}
                </p>
             </div>
          </div>

          {/* Right Column: Qiita Articles */}
          <div className="lg:w-2/3 w-full">
            <h2 className="font-pixel text-2xl text-green-500 mb-8 flex items-center border-b-4 border-green-600 pb-3">
              <i className="ri-file-list-2-line mr-3"></i>
              QIITA BLOG ({book.qiita_articles.length})
            </h2>
            
            {book.qiita_articles.length > 0 ? (
              <div className="space-y-6">
                {book.qiita_articles.slice(0, displayedArticlesCount).map((article, index) => (
                  <div 
                    key={article.id} 
                    className="bg-black border-2 border-gray-800 p-5 hover:border-green-500 transition-colors group relative overflow-hidden shadow-[3px_3px_0_#1a1a1a] hover:shadow-[3px_3px_0_#166534]"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-700 group-hover:bg-green-400 transition-colors"></div>
                    
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block pl-4">
                      <h3 className="font-pixel text-xl text-white mb-3 group-hover:text-green-400 truncate">
                        {article.title}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm font-mono text-gray-500">
                        <div className="flex items-center text-cyan-500">
                          <i className="ri-user-smile-line mr-2"></i>
                          {article.author_name || article.author_id}
                        </div>
                        <div className="flex items-center text-pink-500">
                          <i className="ri-heart-3-fill mr-2"></i>
                          {formatNumber(article.likes_count)} HP
                        </div>
                        <div className="flex items-center">
                          <i className="ri-time-line mr-2"></i>
                          {formatPublicationDate(article.published_at)}
                        </div>
                      </div>
                      
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <i className="ri-arrow-right-s-fill text-3xl text-green-500"></i>
                      </div>
                    </a>
                  </div>
                ))}
                
                {book.qiita_articles.length > displayedArticlesCount && (
                  <button
                    onClick={handleShowMore}
                    className="w-full py-3 mt-8 border-2 border-green-700 bg-black text-green-500 font-pixel text-xs shadow-[3px_3px_0_#166534] hover:bg-green-500 hover:text-black hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all"
                  >
                    ▼ LOAD MORE DATA
                  </button>
                )}
              </div>
            ) : (
              <div className="border-2 border-gray-800 bg-black p-12 text-center shadow-[4px_4px_0_#1a1a1a]">
                <p className="font-pixel text-gray-500 text-sm">NO ARTICLES FOUND.</p>
              </div>
            )}
            
            {/* Ad: Article List Bottom */}
            <AdSenseDisplay adSlot="1178567873" />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
