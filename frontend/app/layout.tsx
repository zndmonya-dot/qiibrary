import type { Metadata } from 'next'
import './globals.css'
import PageTransition from '@/components/PageTransition'

export const metadata: Metadata = {
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
    url: 'https://qiibrary.example.com',
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

