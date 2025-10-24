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

  // 書籍一覧を取得（ランキングAPIから取得）
  let bookPages: any[] = []
  
  try {
    const response = await fetch(`${API_URL}/api/rankings/?limit=1000&offset=0`, {
      next: { revalidate: 3600 } // 1時間キャッシュ
    })
    
    if (response.ok) {
      const data = await response.json()
      const rankings = data.rankings || []
      
      // 言及数の多い順にソート（既にソート済みだが念のため）
      bookPages = rankings
        .filter((item: any) => item.book && item.book.isbn)
        .map((item: any, index: number) => {
          const book = item.book
          const asin = book.isbn.replace(/-/g, '')
          
          // ランキング上位ほど優先度を高く設定
          let priority = 0.7
          if (index < 10) priority = 0.9      // トップ10
          else if (index < 50) priority = 0.8  // トップ50
          
          return {
            url: `${SITE_URL}/books/${asin}`,
            lastmod: book.updated_at ? new Date(book.updated_at).toISOString() : new Date().toISOString(),
            changefreq: 'weekly',
            priority,
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

