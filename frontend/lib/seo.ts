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
    'offers': bookDetail.amazon_affiliate_url ? {
      '@type': 'Offer',
      'url': bookDetail.amazon_affiliate_url,
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'Organization',
        'name': 'Amazon.co.jp',
      },
    } : undefined,
    // Note: いいね数から推定した「評価」や、Qiita記事タイトルを「レビュー」として扱うのは
    // 検索エンジンのガイドライン上リスクが高いため出力しない。
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

/**
 * canonical URL をクライアント側で確実に設定する
 *
 * Note:
 * Next.jsのmetadataで出すのが理想だが、`use client` なページでも
 * canonical を安定させるためにDOM側で補助する。
 */
export function ensureCanonicalUrl(canonicalUrl: string) {
  if (typeof document === 'undefined') return;
  if (!canonicalUrl) return;

  const normalized = canonicalUrl.replace(/\/+$/, '') || canonicalUrl;
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = normalized;
}

