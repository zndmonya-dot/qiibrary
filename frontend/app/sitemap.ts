import { MetadataRoute } from 'next'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const SITE_URL = 'https://qiibrary.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date('2025-12-10'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date('2025-12-10'),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date('2025-12-10'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date('2025-12-10'),
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/legal`,
      lastModified: new Date('2025-12-10'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // 書籍ページを動的に取得
  let bookPages: MetadataRoute.Sitemap = []

  try {
    const response = await fetch(`${API_URL}/api/rankings/?limit=20000&offset=0`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    })

    if (response.ok) {
      const data = await response.json()
      const rankings = data.rankings || []

      bookPages = rankings
        .filter((item: any) => item.book && item.book.isbn)
        .map((item: any, index: number) => {
          const book = item.book
          const asin = book.isbn.replace(/-/g, '')

          // ランキング上位ほど優先度を高く設定
          let priority = 0.5
          if (index < 10) priority = 0.9
          else if (index < 50) priority = 0.8
          else if (index < 100) priority = 0.7
          else if (index < 500) priority = 0.6

          return {
            url: `${SITE_URL}/books/${asin}`,
            lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
            changeFrequency: 'weekly' as const,
            priority,
          }
        })
    }
  } catch (error) {
    console.error('Failed to fetch books for sitemap:', error)
  }

  return [...staticPages, ...bookPages]
}

