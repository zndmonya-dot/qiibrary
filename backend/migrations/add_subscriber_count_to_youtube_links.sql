-- YouTube動画リンクテーブルにチャンネル登録者数カラムを追加

ALTER TABLE book_youtube_links 
ADD COLUMN IF NOT EXISTS subscriber_count INTEGER DEFAULT 0;

-- コメント追加
COMMENT ON COLUMN book_youtube_links.subscriber_count IS 'チャンネル登録者数';

