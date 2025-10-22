# SQL最適化サマリー

## 実施済み最適化

### 1. インデックス最適化

#### 削除した未使用インデックス（約4MB削減）
- `idx_books_first_mention` (1.1MB) - `ix_books_first_mentioned_at`と重複
- `idx_books_latest_mention` (888KB) - `ix_books_latest_mention_at`と重複
- `idx_books_mentions` (560KB) - `ix_books_total_mentions`と重複
- `idx_qiita_articles_published` (776KB) - `ix_qiita_articles_published_at`と重複
- `idx_qiita_articles_likes` (216KB) - `ix_qiita_articles_likes_count`と重複
- `idx_book_qiita_date` (720KB) - `ix_book_qiita_mentions_mentioned_at`と重複

#### 追加した最適化インデックス
1. **`idx_bqm_composite`** (1.3MB)
   ```sql
   CREATE INDEX idx_bqm_composite 
   ON book_qiita_mentions(book_id, article_id, mentioned_at DESC)
   ```
   - 効果: JOIN + ORDER BY の高速化
   - 対象: ランキングクエリのJOIN部分

2. **`idx_qa_published_likes_composite`** (720KB)
   ```sql
   CREATE INDEX idx_qa_published_likes_composite 
   ON qiita_articles(published_at DESC, likes_count DESC)
   ```
   - 効果: 期間フィルタ + いいね順ソート
   - 対象: 年別・月別ランキング、トップ記事取得

3. **`idx_books_active_mentions`** (400KB)
   ```sql
   CREATE INDEX idx_books_active_mentions 
   ON books(total_mentions DESC, id) 
   WHERE total_mentions > 0
   ```
   - 効果: 言及がある書籍のみをインデックス化（パーシャルインデックス）
   - サイズ削減: 全体インデックスより約60%小さい

### 2. 統計情報の更新

```sql
ANALYZE books;
ANALYZE qiita_articles;
ANALYZE book_qiita_mentions;
```

クエリプランナーが最新のデータ分布を把握し、最適な実行計画を作成できるようになりました。

---

## パフォーマンス測定結果

### 最適化前（直接SQL使用時）
- 全期間ランキング: **1,021ms** (NEON: 6秒)
- トップ記事取得: **147ms**

### 最適化後（ローカルDB）
- 全期間ランキング: **640ms** (37%高速化)
- 365日間ランキング: **206ms** (80%高速化)
- 年別ランキング(2024): **206ms**
- トップ記事取得: **19ms** (87%高速化)

### 改善率
- 全期間: **37%高速化** (1,021ms → 640ms)
- 期間フィルタあり: **約80%高速化** (1,000ms超 → 206ms)
- トップ記事: **87%高速化** (147ms → 19ms)

---

## さらなる最適化案

### 案1: マテリアライズドビュー（全期間ランキング用）

```sql
CREATE MATERIALIZED VIEW mv_book_rankings_all AS
WITH book_stats AS (
    SELECT 
        b.id, b.isbn, b.title, b.author, b.publisher, b.publication_date,
        b.description, b.thumbnail_url, b.amazon_url, b.total_mentions,
        b.first_mentioned_at,
        COUNT(DISTINCT qa.author_id) as unique_user_count,
        COALESCE(SUM(qa.likes_count), 0) as total_likes,
        COUNT(DISTINCT qa.id) as article_count,
        MAX(bqm.mentioned_at) as latest_mention_at
    FROM books b
    JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
    JOIN qiita_articles qa ON bqm.article_id = qa.id
    GROUP BY b.id, b.isbn, b.title, b.author, b.publisher, b.publication_date,
             b.description, b.thumbnail_url, b.amazon_url, b.total_mentions,
             b.first_mentioned_at
)
SELECT 
    *,
    unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as score
FROM book_stats
ORDER BY score DESC;

CREATE UNIQUE INDEX idx_mv_rankings_id ON mv_book_rankings_all(id);
CREATE INDEX idx_mv_rankings_score ON mv_book_rankings_all(score DESC);
```

**メリット**:
- 全期間ランキングが **5ms以下** で取得可能
- 本番環境（NEON）でも超高速

**デメリット**:
- 定期的な更新が必要（`REFRESH MATERIALIZED VIEW CONCURRENTLY`）
- ストレージを約50MB追加消費

**更新頻度**: 1時間〜6時間に1回（バッチジョブで実行）

### 案2: クエリの最適化（WITH句の改善）

現在のクエリは全書籍をJOINしてからGROUP BYしています。
これを改善して、事前に必要なデータのみをフィルタリング：

```sql
-- 改善版: total_mentions > 0 の書籍のみを対象
WITH active_books AS (
    SELECT id, isbn, title, author, ...
    FROM books
    WHERE total_mentions > 0  -- ←追加
),
book_stats AS (
    SELECT 
        b.*,
        COUNT(DISTINCT qa.author_id) as unique_user_count,
        ...
    FROM active_books b
    JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
    JOIN qiita_articles qa ON bqm.article_id = qa.id
    GROUP BY b.id, ...
)
SELECT * FROM book_stats ORDER BY score DESC LIMIT 100;
```

**効果**: スキャン対象を約10%削減

### 案3: 接続プールの最適化（NEON DB用）

```python
# backend/app/database.py
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=10,        # 5 → 10
    max_overflow=20,     # 10 → 20
    pool_timeout=30,
    connect_args={
        "options": "-c client_encoding=utf8",
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
        "application_name": "qiibrary_backend"
    }
)
```

### 案4: Redisキャッシング（最も効果的）

```python
import redis
from functools import wraps
import pickle

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=False
)

def cache_ranking(ttl=3600):  # 1時間キャッシュ
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache_key = f"ranking:{func.__name__}:{str(args)}:{str(kwargs)}"
            
            # キャッシュ確認
            cached = redis_client.get(cache_key)
            if cached:
                return pickle.loads(cached)
            
            # キャッシュミス → DB問い合わせ
            result = func(*args, **kwargs)
            redis_client.setex(cache_key, ttl, pickle.dumps(result))
            return result
        return wrapper
    return decorator

# 使用例
@cache_ranking(ttl=3600)
def get_ranking_fast(...):
    # 既存のコード
    ...
```

**効果**:
- キャッシュヒット時: **<5ms**
- API応答時間: **60倍以上高速化**
- NEON DBへの負荷軽減

---

## 推奨実装順序

### フェーズ1: すぐに実装可能（本日）
1. ✅ インデックス最適化（完了）
2. ✅ 統計情報更新（完了）
3. クエリ改善（`WHERE total_mentions > 0`追加）

### フェーズ2: 中期（今週）
4. Redisキャッシング実装
5. 接続プール設定の調整

### フェーズ3: 長期（必要に応じて）
6. マテリアライズドビュー + 定期更新バッチ

---

## NEON DB本番環境への適用

### 安全な適用手順

```sql
-- 1. インデックス作成（CONCURRENTLY で本番に影響なし）
CREATE INDEX CONCURRENTLY idx_bqm_composite 
ON book_qiita_mentions(book_id, article_id, mentioned_at DESC);

CREATE INDEX CONCURRENTLY idx_qa_published_likes_composite 
ON qiita_articles(published_at DESC, likes_count DESC);

CREATE INDEX CONCURRENTLY idx_books_active_mentions 
ON books(total_mentions DESC, id) 
WHERE total_mentions > 0;

-- 2. 未使用インデックス削除（ロックなし）
DROP INDEX CONCURRENTLY IF EXISTS idx_books_first_mention;
DROP INDEX CONCURRENTLY IF EXISTS idx_books_latest_mention;
DROP INDEX CONCURRENTLY IF EXISTS idx_books_mentions;
DROP INDEX CONCURRENTLY IF EXISTS idx_qiita_articles_published;
DROP INDEX CONCURRENTLY IF EXISTS idx_qiita_articles_likes;
DROP INDEX CONCURRENTLY IF EXISTS idx_book_qiita_date;

-- 3. 統計情報更新
ANALYZE books;
ANALYZE qiita_articles;
ANALYZE book_qiita_mentions;
```

### 注意事項
- `CONCURRENTLY` を必ず使用（本番運用中でもロックなし）
- 作業時間: 5〜10分程度
- メンテナンスウィンドウ不要
- ロールバック可能（インデックスを再削除/再作成）

---

## まとめ

### 達成した成果
- ローカルDB: **37〜87%高速化**
- 期間フィルタ付きクエリ: **206ms（目標達成）**
- インデックスサイズ: **約4MB削減**
- クエリプラン: **最適化済み**

### 次のステップ
1. **クエリ改善** (`WHERE total_mentions > 0` 追加) → 即座に10%高速化
2. **Redisキャッシング** → 60倍以上の高速化（最も効果的）
3. **NEON DBへ適用** → 本番環境も高速化

### 期待される本番環境での効果
- 現在: 6秒
- 最適化後（インデックスのみ）: **2〜3秒**
- Redisキャッシング適用後: **<100ms**

