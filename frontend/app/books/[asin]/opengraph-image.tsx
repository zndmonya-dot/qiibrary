import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = '書籍詳細';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image({ params }: { params: { asin: string } }) {
  const { asin } = params;
  
  // 書籍情報を取得（簡易版）
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  let bookTitle = 'Qiita で話題の技術書';
  let bookAuthor = '';
  
  try {
    const response = await fetch(`${API_URL}/api/books/${asin}`, {
      next: { revalidate: 3600 }, // 1時間キャッシュ
    });
    if (response.ok) {
      const data = await response.json();
      bookTitle = data.book.title || bookTitle;
      bookAuthor = data.book.author || '';
    }
  } catch (error) {
    console.error('Failed to fetch book for OG image:', error);
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* ロゴエリア */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 60,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 900,
              color: 'white',
              display: 'flex',
            }}
          >
            Qiibrary
          </div>
        </div>

        {/* メインコンテンツ */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '32px',
            padding: '60px',
            width: '100%',
            maxWidth: '1000px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
            boxShadow: '0 20px 80px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div
            style={{
              fontSize: 56,
              fontWeight: 900,
              color: '#1a202c',
              lineHeight: 1.3,
              display: 'flex',
              flexWrap: 'wrap',
            }}
          >
            {bookTitle}
          </div>
          
          {bookAuthor && (
            <div
              style={{
                fontSize: 32,
                color: '#4a5568',
                display: 'flex',
              }}
            >
              {bookAuthor}
            </div>
          )}
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              marginTop: '16px',
            }}
          >
            <div
              style={{
                background: '#55c500',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '999px',
                fontSize: 24,
                fontWeight: 700,
                display: 'flex',
              }}
            >
              Qiita で話題
            </div>
          </div>
        </div>

        {/* フッター */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            fontSize: 24,
            color: 'rgba(255, 255, 255, 0.8)',
            display: 'flex',
          }}
        >
          qiibrary.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

