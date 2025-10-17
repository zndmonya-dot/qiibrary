/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // YouTubeカラーパレット（柔らかいトーン）
        youtube: {
          red: '#FF6B6B',
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

