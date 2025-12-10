import type { Metadata, Viewport } from 'next'
import './globals.css'
import RetroBackground from '@/components/RetroBackground'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata: Metadata = {
  metadataBase: new URL('https://qiibrary.com'),
  title: {
    default: 'Qiibrary - Qiitaで話題の技術書まとめ',
    template: '%s | Qiibrary'
  },
  description: 'エンジニアが実践で使い、Qiita記事で推薦した技術書ライブラリ。開発者コミュニティの知見を集約し、現場で本当に役立つ技術書を厳選してお届けします。',
  keywords: ['IT技術書', 'プログラミング', 'Qiita', 'ランキング', '書籍', 'エンジニア', '技術書', '開発者'],
  authors: [{ name: 'Qiibrary' }],
  creator: 'Qiibrary',
  publisher: 'Qiibrary',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    alternateLocale: ['en_US'],
    url: 'https://qiibrary.com',
    siteName: 'Qiibrary',
    title: 'Qiibrary - Qiitaで話題の技術書まとめ',
    description: 'エンジニアが実践で使い、Qiita記事で推薦した技術書ライブラリ',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Qiibrary - Qiitaで話題の技術書まとめ',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Qiibrary - Qiitaで話題の技術書まとめ',
    description: 'エンジニアが実践で使い、Qiita記事で推薦した技術書ライブラリ',
    creator: '@Rasenooon',
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
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-icon.svg', sizes: '180x180', type: 'image/svg+xml' },
    ],
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <head>
        <link href="https://cdn.jsdelivr.net/npm/remixicon@4.0.0/fonts/remixicon.css" rel="stylesheet" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4335284954366086"
          crossOrigin="anonymous"
        />
      </head>
      <body className="dark">
        <RetroBackground />
        {children}
      </body>
    </html>
  )
}
