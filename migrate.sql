-- YouTube動画詳細情報のカラムを追加
ALTER TABLE book_youtube_links 
ADD COLUMN IF NOT EXISTS channel_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_youtube_links_view_count ON book_youtube_links(view_count DESC);

-- 確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'book_youtube_links' 
ORDER BY ordinal_position;

