-- NEON PostgreSQLへの最適化適用スクリプト
-- CONCURRENTLYオプションを使用して本番運用中でも安全に実行可能

-- ============================================================
-- 1. 複合インデックスの追加（高速化の要）
-- ============================================================

-- book_qiita_mentions の複合インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_bqm_composite 
ON book_qiita_mentions(book_id, article_id, mentioned_at DESC);
-- 効果: JOINとソートの最適化

-- qiita_articles の複合インデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_qa_published_likes_composite 
ON qiita_articles(published_at DESC, likes_count DESC);
-- 効果: 期間フィルタ+いいね順ソート

-- books のパーシャルインデックス
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_books_active_mentions 
ON books(total_mentions DESC, id) 
WHERE total_mentions > 0;
-- 効果: 言及がある書籍のみをインデックス化（サイズ削減）

-- ============================================================
-- 2. 未使用インデックスの削除（約4MB削減）
-- ============================================================

DROP INDEX CONCURRENTLY IF EXISTS idx_books_first_mention;
DROP INDEX CONCURRENTLY IF EXISTS idx_books_latest_mention;
DROP INDEX CONCURRENTLY IF EXISTS idx_books_mentions;
DROP INDEX CONCURRENTLY IF EXISTS idx_qiita_articles_published;
DROP INDEX CONCURRENTLY IF EXISTS idx_qiita_articles_likes;
DROP INDEX CONCURRENTLY IF EXISTS idx_book_qiita_date;

-- ============================================================
-- 3. 統計情報の更新（クエリプランナーの最適化）
-- ============================================================

ANALYZE books;
ANALYZE qiita_articles;
ANALYZE book_qiita_mentions;

-- ============================================================
-- 4. インデックス作成状況の確認
-- ============================================================

SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(schemaname||'.'||indexname::text)) as index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- ============================================================
-- 実行手順
-- ============================================================
-- 1. NEON DBのダッシュボードからSQLエディタを開く
-- 2. このスクリプトを貼り付けて実行
-- 3. 実行時間: 約5〜10分
-- 4. ロック: CONCURRENTLY使用のため本番運用中でも影響なし
-- 5. ロールバック: DROP INDEX CONCURRENTLY で削除可能
-- ============================================================

-- 期待される効果:
-- - 全期間ランキング: 6秒 → 2〜3秒
-- - 期間フィルタ付きランキング: 6秒 → 1〜2秒
-- - インデックスサイズ: 約4MB削減
-- ============================================================

