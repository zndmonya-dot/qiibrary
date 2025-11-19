import { Metadata } from 'next';

type Props = {
  params: { asin: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { asin } = params;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const response = await fetch(`${API_URL}/api/books/${asin}`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });

    if (!response.ok) {
      throw new Error('Failed to fetch book');
    }

    const data = await response.json();
    const { book, stats } = data;

    const title = book.title || `ISBN: ${asin} の書籍`;
    const description =
      book.description ||
      `${title}についてQiitaで${stats.mention_count}件の記事で紹介されています。${book.author ? `著者: ${book.author}` : ''}`;

    return {
      title,
      description,
      keywords: [
        book.title,
        book.author,
        book.publisher,
        'IT技術書',
        'プログラミング',
        'Qiita',
        '書籍レビュー',
      ].filter(Boolean),
      openGraph: {
        title,
        description,
        type: 'book',
        url: `https://qiibrary.com/books/${asin}`,
        images: [
          {
            url: book.thumbnail_url || '/og-image.png',
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        siteName: 'Qiibrary',
        locale: 'ja_JP',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [book.thumbnail_url || '/og-image.png'],
      },
      alternates: {
        canonical: `https://qiibrary.com/books/${asin}`,
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: `書籍詳細 - ISBN: ${asin}`,
      description: 'Qiitaで話題の技術書の詳細情報',
    };
  }
}

export default function BookLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

