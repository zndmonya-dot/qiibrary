import type { Metadata } from 'next'
import './globals.css'
import Footer from '@/components/Footer'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: {
    default: 'BookTube - IT技術書ランキング',
    template: '%s | BookTube'
  },
  description: 'YouTubeで紹介されたIT技術書をランキング形式で表示。日次・月次・年次のランキングで、今注目の技術書をチェックしよう。',
  keywords: ['IT技術書', 'プログラミング', 'YouTube', 'ランキング', '書籍', 'エンジニア', '技術書'],
  authors: [{ name: 'BookTube' }],
  creator: 'BookTube',
  publisher: 'BookTube',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    url: 'https://booktube.example.com',
    siteName: 'BookTube',
    title: 'BookTube - IT技術書ランキング',
    description: 'YouTubeで紹介されたIT技術書をランキング形式で表示',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookTube - IT技術書ランキング',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookTube - IT技術書ランキング',
    description: 'YouTubeで紹介されたIT技術書をランキング形式で表示',
    creator: '@your_account',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>
        <PageTransition>
          {children}
        </PageTransition>
        <Footer />
      </body>
    </html>
  )
}

