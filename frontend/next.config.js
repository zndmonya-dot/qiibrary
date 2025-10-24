/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // YouTube動画サムネイル
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      // プレースホルダー画像
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Zenn Books画像ホスト
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      // Google Books API画像ホスト
      {
        protocol: 'https',
        hostname: 'books.google.com',
      },
      // openBD API画像ホスト
      {
        protocol: 'https',
        hostname: 'cover.openbd.jp',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // パフォーマンス最適化
  swcMinify: true,
  optimizeFonts: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // 実験的な最適化機能
  experimental: {
    optimizePackageImports: ['remixicon'], // アイコンパッケージの最適化
    // optimizeCss: true, // Vercelでcritters依存の問題があるため無効化
  },
  // 圧縮設定
  compress: true,
  // CSS最適化
  productionBrowserSourceMaps: false, // ソースマップを無効化してサイズ削減
  // モダンブラウザターゲット
  typescript: {
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

