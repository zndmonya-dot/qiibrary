import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const SITE_URL = 'https://qiibrary.com'

export async function GET() {
  // 静的ページ
  const staticPages = [
    { url: SITE_URL, lastmod: new Date().toISOString(), changefreq: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/about`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/legal`, lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.3 },
  ]

  // 書籍一覧を取得
  let bookPages: any[] = []
  
  try {
    const response = await fetch(`${API_URL}/api/books/?limit=10000`, {
      next: { revalidate: 3600 } // 1時間キャッシュ
    })
    
    if (response.ok) {
      const data = await response.json()
      const books = data.books || []
      
      bookPages = books.map((book: any) => {
        const asin = book.isbn ? book.isbn.replace(/-/g, '') : ''
        return {
          url: `${SITE_URL}/books/${asin}`,
          lastmod: book.updated_at ? new Date(book.updated_at).toISOString() : new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        }
      })
    }
  } catch (error) {
    console.error('Failed to fetch books for sitemap:', error)
  }

  const allPages = [...staticPages, ...bookPages]

  // XMLサイトマップを生成
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

