/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Qiitaカラーパレット（実際のQiita配色）
        qiita: {
          green: '#357a00',          // Qiita緑（実際の色）
          'green-dark': '#2d6600',   // 暗い緑
          'green-light': '#4a9900',  // 明るい緑
          'bg': '#f5f6f6',           // メイン背景（実際のQiita色）
          'surface': '#edeeee',      // サーフェス/タグ背景（実際のQiita色）
          'surface-2': '#e5e6e6',    // 濃いサーフェス
          'hover': '#f0f1f1',        // ホバー時
          'border': '#d0d0d0',       // ボーダー
          'card': '#ffffff',         // カード背景（白）
          'footer': '#3a3c3c',       // フッター背景（実際のQiita色）
          'text': '#7a7a7a',         // メインテキスト（実際のQiita色）
          'text-dark': '#333333',    // 濃いテキスト
          'text-light': '#999999',   // ライトテキスト
        },
        // ダークモードカラーパレット
        dark: {
          'bg': '#1d2020',           // 全体の背景
          'surface': '#2f3232',      // カード・テキスト背景
          'surface-light': '#3a3d3d', // 少し明るいサーフェス
          'border': '#4a4d4d',       // ボーダー
          'text': '#b8b8b8',         // メインテキスト
          'text-light': '#8a8a8a',   // 薄いテキスト
          'green': '#55c500',        // ダークモード専用の緑
          'header-footer': '#3a3c3c', // ヘッダー・フッター背景
        },
        // YouTubeカラー（動画埋め込み用に維持）
        youtube: {
          red: '#FF0000',
          'dark-bg': '#1E1E1E',
          'dark-surface': '#2A2A2A',
          'dark-hover': '#3A3A3A',
          'dark-text': '#F0F0F0',
          'dark-text-secondary': '#B8B8B8',
        },
      },
    },
  },
  plugins: [],
}

