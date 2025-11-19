-- ============================================================
-- 推奨データベースインデックス
-- ============================================================
-- 
-- これらのインデックスを作成すると、検索とランキング取得が高速化されます
-- 実行: psql -h YOUR_HOST -U YOUR_USER -d YOUR_DB -f RECOMMENDED_INDEXES.sql
--
-- ============================================================

-- ============================================================
-- 1. 検索最適化用インデックス
-- ============================================================

-- 書籍タイトルの検索（LIKE '%keyword%' 対応）
CREATE INDEX IF NOT EXISTS idx_books_title_lower 
ON books (LOWER(title) text_pattern_ops);

-- 著者名の検索
CREATE INDEX IF NOT EXISTS idx_books_author_lower 
ON books (LOWER(author) text_pattern_ops);

-- 出版社の検索
CREATE INDEX IF NOT EXISTS idx_books_publisher_lower 
ON books (LOWER(publisher) text_pattern_ops);

-- ISBNの検索（既存のはずだが念のため）
CREATE INDEX IF NOT EXISTS idx_books_isbn 
ON books (isbn);

-- ============================================================
-- 2. ランキング最適化用インデックス
-- ============================================================

-- total_mentions でのソート用
CREATE INDEX IF NOT EXISTS idx_books_total_mentions 
ON books (total_mentions DESC);

-- first_mentioned_at（NEWバッジ判定用）
CREATE INDEX IF NOT EXISTS idx_books_first_mentioned_at 
ON books (first_mentioned_at DESC) 
WHERE first_mentioned_at IS NOT NULL;

-- ============================================================
-- 3. JOIN最適化用インデックス
-- ============================================================

-- book_qiita_mentions のJOIN用
CREATE INDEX IF NOT EXISTS idx_bqm_book_id 
ON book_qiita_mentions (book_id);

CREATE INDEX IF NOT EXISTS idx_bqm_article_id 
ON book_qiita_mentions (article_id);

CREATE INDEX IF NOT EXISTS idx_bqm_mentioned_at 
ON book_qiita_mentions (mentioned_at DESC);

-- ============================================================
-- 4. Qiita記事の期間フィルタ用
-- ============================================================

-- published_at での期間フィルタ用
CREATE INDEX IF NOT EXISTS idx_qiita_articles_published_at 
ON qiita_articles (published_at DESC) 
WHERE published_at IS NOT NULL;

-- タグ検索用（JSONB）
CREATE INDEX IF NOT EXISTS idx_qiita_articles_tags_gin 
ON qiita_articles USING GIN (tags);

-- likes_count でのソート用（トップ記事取得）
CREATE INDEX IF NOT EXISTS idx_qiita_articles_likes_count 
ON qiita_articles (likes_count DESC);

-- author_id（ユニークユーザー数計算用）
CREATE INDEX IF NOT EXISTS idx_qiita_articles_author_id 
ON qiita_articles (author_id);

-- ============================================================
-- 5. 複合インデックス（パフォーマンス重視）
-- ============================================================

-- ランキング取得の最適化
CREATE INDEX IF NOT EXISTS idx_books_mentions_composite 
ON books (total_mentions DESC, id) 
WHERE total_mentions > 0;

-- 期間フィルタ + ソート
CREATE INDEX IF NOT EXISTS idx_qiita_published_likes 
ON qiita_articles (published_at DESC, likes_count DESC) 
WHERE published_at IS NOT NULL;

-- ============================================================
-- 6. 分析用インデックス
-- ============================================================

-- 年別ランキング用
CREATE INDEX IF NOT EXISTS idx_qiita_articles_year 
ON qiita_articles (EXTRACT(YEAR FROM published_at)) 
WHERE published_at IS NOT NULL;

-- 月別ランキング用
CREATE INDEX IF NOT EXISTS idx_qiita_articles_year_month 
ON qiita_articles (
    EXTRACT(YEAR FROM published_at), 
    EXTRACT(MONTH FROM published_at)
) 
WHERE published_at IS NOT NULL;

-- ============================================================
-- インデックス作成完了
-- ============================================================

-- 確認用クエリ
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- インデックスのサイズ確認
SELECT
    indexrelname as index_name,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================
-- 注意事項
-- ============================================================
-- 
-- 1. インデックスはストレージを消費します
--    - 各インデックスで数MB〜数十MB
--    - NEONの無料プラン（0.5GB）では問題なし
-- 
-- 2. インデックスは書き込みを若干遅くします
--    - 読み取り（検索・ランキング）が多いアプリなので問題なし
-- 
-- 3. インデックスは自動的にメンテナンスされます
--    - PostgreSQLが自動的に最適化
--    - 手動メンテナンス不要
-- 
-- ============================================================

