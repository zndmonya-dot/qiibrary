'use client';

import { memo } from 'react';
import Link from 'next/link';
import { Book, BookStats, TopArticle } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { analytics } from '@/lib/analytics';
import BookImage from './BookImage';

interface BookCardProps {
  rank: number;
  book: Book;
  stats: BookStats;
  topArticles?: TopArticle[];
  onNavigate?: () => void;
}

function BookCard({ rank, book, stats, topArticles, onNavigate }: BookCardProps) {
  // ランクに応じたバッジの色
  const getRankStyle = () => {
    if (rank === 1) return 'bg-yellow-400 text-black border-yellow-200 shadow-[0_0_15px_rgba(250,204,21,0.5)]';
    if (rank === 2) return 'bg-gray-300 text-black border-gray-100';
    if (rank === 3) return 'bg-amber-600 text-white border-amber-400';
    return 'bg-green-500 text-black border-white';
  };

  return (
    <div className="bg-black border-2 border-gray-800 relative group hover:border-green-500 transition-all duration-300 shadow-[4px_4px_0_#1a1a1a] hover:shadow-[4px_4px_0_#166534]">
      {/* Rank Badge */}
      <div className={`absolute -top-4 left-4 font-pixel text-sm px-4 py-1.5 z-10 border-2 ${getRankStyle()}`}>
        #{rank}
      </div>

      <div className="flex flex-col md:flex-row gap-5 p-5 pt-6">
        {/* Book Image */}
        <div className="flex-shrink-0 w-28 md:w-36 mx-auto md:mx-0">
          <div className="border-2 border-gray-700 bg-black p-1 group-hover:border-green-500/50 transition-colors aspect-[2/3]">
            {book.amazon_affiliate_url ? (
              <a
                href={book.amazon_affiliate_url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                onClick={() => analytics.clickAmazonLink(book.isbn || '', book.title)}
                className="block w-full h-full"
              >
                <BookImage
                  src={book.thumbnail_url}
                  alt={book.title}
                  width={128}
                  height={192}
                  rank={rank}
                  className="w-full h-full object-cover hover:brightness-110 transition-all"
                />
              </a>
            ) : (
              <BookImage
                src={book.thumbnail_url}
                alt={book.title}
                width={128}
                height={192}
                rank={rank}
                className="w-full h-full object-cover"
              />
            )}
          </div>
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0 flex flex-col">
          <Link href={`/books/${book.isbn}`} prefetch={true} onClick={onNavigate} className="block mb-2">
            <h3 className="text-lg md:text-xl text-white leading-tight group-hover:text-green-400 transition-colors line-clamp-2 font-medium">
              {book.title || `ISBN: ${book.isbn}`}
            </h3>
          </Link>
          
          <div className="text-xs text-gray-500 mb-4 flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-gray-400">{book.author || 'Unknown'}</span>
            <span className="text-gray-600">|</span>
            <span>{book.publisher || 'N/A'}</span>
          </div>

          {/* Stats */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-pixel text-cyan-400 w-20">MENTIONS</span>
              <div className="flex-1 h-3 bg-gray-900 border border-gray-700 overflow-hidden">
                <div 
                  className="h-full bg-cyan-500"
                  style={{ width: `${Math.min((stats.mention_count / 30) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs font-pixel text-cyan-400 w-12 text-right">
                {formatNumber(stats.mention_count)}
              </span>
            </div>
            
            {stats.total_likes > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-xs font-pixel text-pink-400 w-20">LIKES</span>
                <div className="flex-1 h-3 bg-gray-900 border border-gray-700 overflow-hidden">
                  <div 
                    className="h-full bg-pink-500"
                    style={{ width: `${Math.min((stats.total_likes / 1000) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-pixel text-pink-400 w-12 text-right">
                  {formatNumber(stats.total_likes)}
                </span>
              </div>
            )}
          </div>

          {/* Top Articles */}
          {topArticles && topArticles.length > 0 && (
            <div className="bg-gray-900 p-2 border border-gray-700 mb-4">
              <ul className="space-y-1">
                {topArticles.slice(0, 2).map((article) => (
                  <li key={article.id}>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-500 hover:text-green-400 text-xs transition-colors"
                    >
                      <span className="mr-2 text-green-500">▸</span>
                      <span className="truncate">{article.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end mt-auto">
            <Link 
              href={`/books/${book.isbn}`} 
              prefetch={true} 
              onClick={onNavigate}
              className="font-pixel text-[10px] text-green-500 hover:bg-green-500 hover:text-black px-3 py-1.5 border border-green-500 transition-all uppercase tracking-wider"
            >
              Details →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(BookCard);
