import type { Metadata } from 'next'
import './globals.css'
import PageTransition from '@/components/PageTransition'

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
        {/* ローカルストレージからテーマを読み込み（ちらつき防止） */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // ローカルストレージから取得（デフォルト: auto）
                  const stored = localStorage.getItem('qiibrary-theme');
                  const theme = stored || 'auto';
                  
                  // autoの場合はシステム設定を取得
                  let effectiveTheme = theme;
                  if (theme === 'auto') {
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    effectiveTheme = isDark ? 'dark' : 'light';
                  }
                  
                  // DOMに適用
                  if (effectiveTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  
                  // デバッグ用（本番環境では削除可能）
                  console.log('[Theme] Loaded:', theme, '→', effectiveTheme);
                } catch (e) {
                  console.error('[Theme] Error:', e);
                  // エラー時はダークモードをデフォルトに
                  document.documentElement.classList.add('dark');
                }
              })();
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

