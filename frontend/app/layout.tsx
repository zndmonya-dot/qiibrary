import type { Metadata } from 'next'
import './globals.css'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
  title: {
    default: 'BookTuber - IT技術書ランキング',
    template: '%s | BookTuber'
  },
  description: 'YouTubeで紹介されたIT技術書をランキング形式で表示。日次・月次・年次のランキングで、今注目の技術書をチェックしよう。',
  keywords: ['IT技術書', 'プログラミング', 'YouTube', 'ランキング', '書籍', 'エンジニア', '技術書'],
  authors: [{ name: 'BookTuber' }],
  creator: 'BookTuber',
  publisher: 'BookTuber',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    url: 'https://booktuber.example.com',
    siteName: 'BookTuber',
    title: 'BookTuber - IT技術書ランキング',
    description: 'YouTubeで紹介されたIT技術書をランキング形式で表示',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BookTuber - IT技術書ランキング',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BookTuber - IT技術書ランキング',
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head />
      <body>
        {/* デフォルトでダークモード（ユーザー設定は保存しない） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              document.documentElement.classList.add('dark');
            `,
          }}
        />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  )
}

