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
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // 書籍一覧を取得
  let bookPages: MetadataRoute.Sitemap = []
  
  try {
    const response = await fetch(`${API_URL}/api/books/?limit=10000`, {
      next: { revalidate: 3600 } // 1時間キャッシュ
    })
    
    if (response.ok) {
      const data = await response.json()
      const books = data.books || []
      
      bookPages = books.map((book: any) => {
        // ISBNからハイフンを削除
        const asin = book.isbn ? book.isbn.replace(/-/g, '') : ''
        
        return {
          url: `${SITE_URL}/books/${asin}`,
          lastModified: book.updated_at ? new Date(book.updated_at) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch books for sitemap:', error)
  }

  return [...staticPages, ...bookPages]
}
