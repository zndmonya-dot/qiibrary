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
      // 将来的に楽天ブックスAPI用の画像ホストを追加予定
      // {
      //   protocol: 'https',
      //   hostname: 'thumbnail.image.rakuten.co.jp',
      // },
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
}

module.exports = nextConfig

