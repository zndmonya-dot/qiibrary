/**
 * SEO関連のユーティリティ
 * 構造化データ（JSON-LD）の生成など
 */

import { Book, BookDetail } from './api';

/**
 * 書籍の構造化データ（JSON-LD）を生成
 * https://schema.org/Book
 */
export function generateBookStructuredData(bookDetail: BookDetail) {
  const { book, stats, top_articles } = bookDetail;
  
  // 集約評価の計算（Qiita記事のいいね数とメンション数から）
  const aggregateRating = stats.total_likes > 0 ? {
    '@type': 'AggregateRating',
    'ratingValue': Math.min(5, Math.max(1, Math.log10(stats.total_likes + 1) * 1.5 + 3)).toFixed(1),
    'reviewCount': stats.mention_count,
    'bestRating': '5',
    'worstRating': '1',
  } : undefined;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': book.title,
    'author': book.author ? {
      '@type': 'Person',
      'name': book.author,
    } : undefined,
    'publisher': book.publisher ? {
      '@type': 'Organization',
      'name': book.publisher,
    } : undefined,
    'isbn': book.isbn,
    'image': book.thumbnail_url,
    'url': `https://qiibrary.com/books/${book.isbn}`,
    'description': book.description || `${book.title}についてQiitaで言及された技術書。${stats.mention_count}件の記事で紹介されています。`,
    'datePublished': book.publication_date,
    'inLanguage': 'ja',
    'aggregateRating': aggregateRating,
    'offers': book.amazon_affiliate_url ? {
      '@type': 'Offer',
      'url': book.amazon_affiliate_url,
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Amazon.co.jp',
      },
    } : undefined,
    'review': top_articles?.slice(0, 3).map(article => ({
      '@type': 'Review',
      'author': {
        '@type': 'Person',
        'name': article.author_id,
      },
      'datePublished': article.published_at,
      'name': article.title,
      'reviewBody': article.title,
      'url': article.url,
    })),
  };

  // undefinedのフィールドを削除
  return JSON.parse(JSON.stringify(structuredData));
}

/**
 * BreadcrumbList構造化データを生成
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': `https://qiibrary.com${item.url}`,
    })),
  };
}

/**
 * WebSite構造化データを生成（サイト全体用）
 */
export function generateWebSiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Qiibrary',
    'alternateName': 'Qiitaで話題の技術書まとめ',
    'url': 'https://qiibrary.com',
    'description': 'エンジニアが実践で使い、Qiita記事で推薦した技術書ライブラリ。開発者コミュニティの知見を集約し、現場で本当に役立つ技術書を厳選してお届けします。',
    'potentialAction': {
      '@type': 'SearchAction',
      'target': {
        '@type': 'EntryPoint',
        'urlTemplate': 'https://qiibrary.com/?search={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * ItemList構造化データを生成（ランキング用）
 */
export function generateRankingStructuredData(books: { book: Book; rank: number }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': 'Qiita で話題の技術書ランキング',
    'description': 'Qiita記事で最も言及されている技術書のランキング',
    'itemListElement': books.map(({ book, rank }) => ({
      '@type': 'ListItem',
      'position': rank,
      'item': {
        '@type': 'Book',
        'name': book.title,
        'url': `https://qiibrary.com/books/${book.isbn}`,
        'image': book.thumbnail_url,
        'author': book.author ? {
          '@type': 'Person',
          'name': book.author,
        } : undefined,
      },
    })),
  };
}

