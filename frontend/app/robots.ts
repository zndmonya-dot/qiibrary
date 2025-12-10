import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://qiibrary.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api'],
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api'],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: ['/api'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
