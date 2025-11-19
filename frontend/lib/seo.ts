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
  // BookDetail型から統計情報を計算
  const qiitaArticles = bookDetail.qiita_articles || [];
  const totalLikes = qiitaArticles.reduce((sum: number, article: any) => sum + (article.likes_count || 0), 0);
  const mentionCount = qiitaArticles.length;
  
  // 集約評価の計算（Qiita記事のいいね数とメンション数から）
  const aggregateRating = totalLikes > 0 ? {
    '@type': 'AggregateRating',
    'ratingValue': Math.min(5, Math.max(1, Math.log10(totalLikes + 1) * 1.5 + 3)).toFixed(1),
    'reviewCount': mentionCount,
    'bestRating': '5',
    'worstRating': '1',
  } : undefined;

  // トップ記事を取得（いいね数順、上位3件）
  const topArticles = [...qiitaArticles]
    .sort((a: any, b: any) => (b.likes_count || 0) - (a.likes_count || 0))
    .slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    'name': bookDetail.title,
    'author': bookDetail.author ? {
      '@type': 'Person',
      'name': bookDetail.author,
    } : undefined,
    'publisher': bookDetail.publisher ? {
      '@type': 'Organization',
      'name': bookDetail.publisher,
    } : undefined,
    'isbn': bookDetail.isbn,
    'image': bookDetail.thumbnail_url,
    'url': `https://qiibrary.com/books/${bookDetail.isbn}`,
    'description': bookDetail.description || `${bookDetail.title}についてQiitaで言及された技術書。${mentionCount}件の記事で紹介されています。`,
    'datePublished': bookDetail.publication_date,
    'inLanguage': 'ja',
    'aggregateRating': aggregateRating,
    'offers': bookDetail.amazon_affiliate_url ? {
      '@type': 'Offer',
      'url': bookDetail.amazon_affiliate_url,
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Amazon.co.jp',
      },
    } : undefined,
    'review': topArticles.map((article: any) => ({
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

