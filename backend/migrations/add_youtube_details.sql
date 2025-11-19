-- YouTube動画詳細情報のカラムを追加
-- 2025-01-XX: チャンネル名、再生回数、いいね数、公開日時を追加

ALTER TABLE book_youtube_links 
ADD COLUMN IF NOT EXISTS channel_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS like_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP;

-- インデックスを追加（再生回数でソートする場合）
CREATE INDEX IF NOT EXISTS idx_youtube_links_view_count ON book_youtube_links(view_count DESC);

-- コメント
COMMENT ON COLUMN book_youtube_links.channel_name IS 'YouTubeチャンネル名';
COMMENT ON COLUMN book_youtube_links.view_count IS 'YouTube動画の再生回数';
COMMENT ON COLUMN book_youtube_links.like_count IS 'YouTube動画のいいね数';
COMMENT ON COLUMN book_youtube_links.published_at IS 'YouTube動画の公開日時';

