# BookTuber - 将来を見越したアーキテクチャ設計

## 📋 目次

1. [全体アーキテクチャ](#全体アーキテクチャ)
2. [スケーラビリティ戦略](#スケーラビリティ戦略)
3. [データベース設計](#データベース設計)
4. [キャッシュ戦略](#キャッシュ戦略)
5. [モニタリング・分析](#モニタリング分析)
6. [セキュリティ](#セキュリティ)
7. [パフォーマンス最適化](#パフォーマンス最適化)
8. [将来の拡張機能](#将来の拡張機能)

---

## 🏗️ 全体アーキテクチャ

### **現在の構成**

```
┌─────────────┐      ┌─────────────┐      ┌──────────────┐
│             │      │             │      │              │
│  ユーザー    │ ───▶ │  Next.js    │ ───▶ │   FastAPI    │
│  (Browser)  │      │  Frontend   │      │   Backend    │
│             │      │  (Vercel)   │      │  (Railway)   │
└─────────────┘      └─────────────┘      └──────────────┘
                            │                     │
                            │                     ▼
                            │              ┌──────────────┐
                            │              │  PostgreSQL  │
                            │              │  (Supabase)  │
                            │              └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Redis Cache │
                     │  (Railway)   │
                     └──────────────┘
```

### **将来のスケーラブルな構成**

```
                                  ┌─────────────────┐
                                  │   CloudFlare    │
                                  │   CDN + DDoS    │
                                  └────────┬────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
            ┌───────▼────────┐     ┌──────▼──────┐      ┌───────▼────────┐
            │   Next.js      │     │   Next.js   │      │    Next.js     │
            │   (Vercel)     │     │   (Vercel)  │      │    (Vercel)    │
            │   Global CDN   │     │  Edge Cache │      │   Edge API     │
            └────────┬───────┘     └─────────────┘      └───────┬────────┘
                     │                                           │
                     │                                           │
                     └─────────────────┬─────────────────────────┘
                                       │
                            ┌──────────▼──────────┐
                            │  Load Balancer      │
                            │  (AWS ALB)          │
                            └──────────┬──────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
        ┌───────▼────────┐     ┌──────▼──────┐      ┌───────▼────────┐
        │   FastAPI      │     │   FastAPI   │      │    FastAPI     │
        │   Instance 1   │     │  Instance 2 │      │   Instance N   │
        │   (ECS/K8s)    │     │ (ECS/K8s)   │      │   (ECS/K8s)    │
        └────────┬───────┘     └─────┬───────┘      └───────┬────────┘
                 │                   │                      │
                 └───────────────────┼──────────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼────────┐  ┌───▼────────┐  ┌───▼────────────┐
            │  PostgreSQL    │  │   Redis    │  │   Elasticsearch│
            │  Read Replica  │  │   Cluster  │  │   (検索機能)    │
            │  (RDS)         │  │  (ElasticCache)│ │              │
            └───────┬────────┘  └────────────┘  └────────────────┘
                    │
            ┌───────▼────────┐
            │  PostgreSQL    │
            │  Primary (RDS) │
            └────────────────┘
                    │
            ┌───────▼────────┐
            │   S3 Backup    │
            │   (Daily)      │
            └────────────────┘
```

---

## 📈 スケーラビリティ戦略

### **1. 水平スケーリング（Horizontal Scaling）**

#### **フロントエンド**
- Vercelが自動でエッジサーバーにデプロイ
- CDNによる静的コンテンツ配信
- サーバーレス関数による動的レンダリング

#### **バックエンド**
- Dockerコンテナ化
- Kubernetesまたは AWS ECS による自動スケーリング
- ロードバランサーによる負荷分散

```yaml
# Kubernetes HPA (Horizontal Pod Autoscaler) 例
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: booktuber-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: booktuber-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

### **2. データベースのスケーリング**

#### **Read Replica（読み取りレプリカ）**
```python
# backend/app/database.py に追加

# Write用（Primary）
write_engine = create_engine(settings.DATABASE_URL)
WriteSessionLocal = sessionmaker(bind=write_engine)

# Read用（Replica）
read_engine = create_engine(settings.DATABASE_READ_REPLICA_URL)
ReadSessionLocal = sessionmaker(bind=read_engine)

def get_read_db():
    """読み取り専用DBセッション"""
    db = ReadSessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_write_db():
    """書き込み用DBセッション"""
    db = WriteSessionLocal()
    try:
        yield db
    finally:
        db.close()
```

#### **シャーディング（将来的に）**
- ロケール別（ja, en）でデータベースを分割
- ASINの範囲でデータを分散

### **3. キャッシュ戦略の強化**

```python
# backend/app/cache.py - 新規作成推奨

import redis
from typing import Optional, Any
import json
import hashlib

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    def get(self, key: str) -> Optional[Any]:
        """キャッシュから取得"""
        data = self.redis.get(key)
        if data:
            return json.loads(data)
        return None
    
    def set(self, key: str, value: Any, ttl: int = 3600):
        """キャッシュに保存"""
        self.redis.setex(
            key,
            ttl,
            json.dumps(value, default=str)
        )
    
    def invalidate(self, pattern: str):
        """パターンマッチでキャッシュ削除"""
        for key in self.redis.scan_iter(pattern):
            self.redis.delete(key)
    
    def generate_cache_key(self, *args, **kwargs) -> str:
        """キャッシュキーを生成"""
        key_data = f"{args}:{kwargs}"
        return hashlib.md5(key_data.encode()).hexdigest()

# 使用例
cache = CacheManager(settings.REDIS_URL)

@router.get("/rankings/daily")
async def get_daily_rankings(locale: str = "ja"):
    cache_key = f"ranking:daily:{locale}"
    
    # キャッシュチェック
    cached = cache.get(cache_key)
    if cached:
        return cached
    
    # DBから取得
    rankings = fetch_rankings_from_db(locale)
    
    # キャッシュに保存（1時間）
    cache.set(cache_key, rankings, ttl=3600)
    
    return rankings
```

---

## 🗄️ データベース設計

### **インデックス戦略**

```sql
-- パフォーマンス重視のインデックス

-- 1. ランキングクエリ用
CREATE INDEX idx_book_views_locale_date 
ON book_daily_stats(locale, date, total_views DESC);

CREATE INDEX idx_book_mentions_locale 
ON books(locale, total_mentions DESC, total_views DESC);

-- 2. 書籍検索用（将来実装）
CREATE INDEX idx_books_title_gin 
ON books USING gin(to_tsvector('english', title));

CREATE INDEX idx_books_author_gin 
ON books USING gin(to_tsvector('english', author));

-- 3. 複合インデックス
CREATE INDEX idx_books_locale_updated 
ON books(locale, updated_at DESC);

-- 4. Partial Index（条件付きインデックス）
CREATE INDEX idx_active_books 
ON books(locale, total_views DESC) 
WHERE latest_mention_at > NOW() - INTERVAL '30 days';
```

### **パーティショニング（大規模化時）**

```sql
-- 日次統計テーブルを月ごとにパーティション
CREATE TABLE book_daily_stats (
    id BIGSERIAL,
    book_id INTEGER,
    date DATE NOT NULL,
    views INTEGER,
    mentions INTEGER,
    PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- 各月のパーティションを作成
CREATE TABLE book_daily_stats_2024_10 
PARTITION OF book_daily_stats
FOR VALUES FROM ('2024-10-01') TO ('2024-11-01');

CREATE TABLE book_daily_stats_2024_11 
PARTITION OF book_daily_stats
FOR VALUES FROM ('2024-11-01') TO ('2024-12-01');

-- 自動パーティション作成のCronジョブを設定
```

---

## ⚡ キャッシュ戦略

### **多層キャッシュ構成**

```
┌─────────────────────────────────────────────┐
│  Layer 1: Browser Cache (Service Worker)   │
│  TTL: 5 minutes                             │
└────────────────┬────────────────────────────┘
                 │ Cache Miss
┌────────────────▼────────────────────────────┐
│  Layer 2: CDN Cache (CloudFlare/Vercel)    │
│  TTL: 15 minutes                            │
└────────────────┬────────────────────────────┘
                 │ Cache Miss
┌────────────────▼────────────────────────────┐
│  Layer 3: Redis Cache (Application)        │
│  TTL: 1 hour                                │
└────────────────┬────────────────────────────┘
                 │ Cache Miss
┌────────────────▼────────────────────────────┐
│  Layer 4: PostgreSQL (Source of Truth)     │
└─────────────────────────────────────────────┘
```

### **キャッシュ無効化戦略**

```python
# backend/app/services/ranking_service.py

class RankingService:
    def __init__(self, cache: CacheManager):
        self.cache = cache
    
    def update_rankings(self, locale: str, period: str):
        """ランキングを更新し、関連キャッシュを削除"""
        # ランキング計算
        new_rankings = self._calculate_rankings(locale, period)
        
        # DBに保存
        self._save_to_db(new_rankings)
        
        # キャッシュ無効化
        self.cache.invalidate(f"ranking:{period}:{locale}*")
        self.cache.invalidate(f"book:*")  # 個別書籍のキャッシュも削除
        
        return new_rankings
```

---

## 📊 モニタリング・分析

### **1. アプリケーション監視**

#### **推奨ツール:**
- **Sentry** - エラートラッキング
- **DataDog / New Relic** - APM（Application Performance Monitoring）
- **Grafana + Prometheus** - メトリクス可視化

```python
# backend/app/main.py にSentryを統合

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    integrations=[FastApiIntegration()],
    traces_sample_rate=0.1,  # 10%のリクエストをトレース
    profiles_sample_rate=0.1,
    environment=settings.ENVIRONMENT,
)
```

### **2. ビジネス分析（既に実装済み）**

`frontend/lib/analytics.ts` で実装済み：
- ページビュー
- 書籍クリック
- Amazonアフィリエイトクリック
- YouTube動画視聴
- ランキング期間切り替え
- 言語切り替え

### **3. カスタムダッシュボード**

```python
# backend/app/api/admin/analytics.py - 管理者用分析API

@router.get("/analytics/overview")
async def get_analytics_overview(
    start_date: date,
    end_date: date,
    db: Session = Depends(get_db)
):
    """分析ダッシュボード用のデータ"""
    return {
        "total_views": get_total_views(db, start_date, end_date),
        "total_clicks": get_total_clicks(db, start_date, end_date),
        "conversion_rate": calculate_conversion_rate(db, start_date, end_date),
        "top_books": get_top_books(db, start_date, end_date, limit=10),
        "affiliate_revenue_estimate": estimate_affiliate_revenue(db, start_date, end_date),
    }
```

---

## 🔒 セキュリティ

### **1. API Rate Limiting**

```python
# backend/app/middleware/rate_limit.py

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.get("/api/rankings/daily")
@limiter.limit("100/minute")  # 1分間に100リクエストまで
async def get_daily_rankings():
    ...
```

### **2. CORS設定の厳格化**

```python
# backend/app/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://booktuber.com",
        "https://www.booktuber.com",
    ],  # 本番環境では具体的なドメインのみ許可
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
    max_age=3600,
)
```

### **3. SQLインジェクション対策**

SQLAlchemy ORMを使用することで自動的に対策済み。
生SQLを書く場合は必ずパラメータ化クエリを使用。

### **4. 環境変数の暗号化**

```bash
# AWS Secrets Manager を使用
aws secretsmanager create-secret \
    --name booktuber/production/database \
    --secret-string '{"url":"postgresql://..."}'

# アプリケーションから取得
import boto3

def get_secret(secret_name):
    client = boto3.client('secretsmanager')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])
```

---

## ⚡ パフォーマンス最適化

### **1. 画像最適化**

Next.js Image コンポーネントを使用（既に実装済み）

さらなる最適化：
```typescript
// next.config.js に追加

module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],  // 最新フォーマット優先
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,  // 24時間
  },
}
```

### **2. コード分割**

```typescript
// 動的インポートでバンドルサイズを削減
import dynamic from 'next/dynamic';

const BookCard = dynamic(() => import('@/components/BookCard'), {
  loading: () => <BookCardSkeleton />,
  ssr: true,
});
```

### **3. データベースクエリ最適化**

```python
# N+1問題を回避

# ❌ 悪い例
books = db.query(Book).all()
for book in books:
    videos = db.query(Video).filter(Video.book_id == book.id).all()

# ✅ 良い例
books = db.query(Book).options(
    joinedload(Book.youtube_videos)
).all()
```

---

## 🚀 将来の拡張機能

### **1. 検索機能**

```typescript
// frontend/components/SearchBar.tsx

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  const handleSearch = async (q: string) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    analytics.search(q, data.length);
  };
  
  return (
    <input
      type="search"
      placeholder="書籍を検索..."
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        if (e.target.value.length >= 2) {
          handleSearch(e.target.value);
        }
      }}
    />
  );
}
```

### **2. ユーザー機能**

- お気に入り登録
- 読書リスト作成
- レビュー投稿
- ソーシャルシェア

### **3. レコメンデーション**

```python
# backend/app/services/recommendation.py

class RecommendationEngine:
    def get_similar_books(self, book_id: int, limit: int = 5):
        """類似書籍を推薦"""
        # 協調フィルタリング
        # コンテンツベースフィルタリング
        # ハイブリッドアプローチ
        pass
    
    def get_personalized_recommendations(self, user_id: int):
        """パーソナライズされた推薦"""
        pass
```

### **4. メール通知**

- 新着ランキング通知
- お気に入り書籍の値下げ通知
- 週次/月次レポート

### **5. PWA化**

```typescript
// next.config.js
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // existing config
});
```

---

## 📝 インフラ構成の段階的移行

### **Phase 1: スモールスタート（現在）**
- Frontend: Vercel（無料枠）
- Backend: Railway（$5/月）
- DB: Supabase（無料枠）
- **総コスト: ~700円/月**

### **Phase 2: トラフィック増加（月間10万PV）**
- Frontend: Vercel Pro（$20/月）
- Backend: Railway Pro（$20/月）+ Redis
- DB: Railway PostgreSQL（$10/月）
- **総コスト: ~6,500円/月**

### **Phase 3: 本格運用（月間100万PV）**
- Frontend: Vercel Pro + CDN
- Backend: AWS ECS（2〜4インスタンス）
- DB: AWS RDS（Multi-AZ）
- Cache: ElastiCache
- **総コスト: ~30,000円/月**

### **Phase 4: 大規模運用（月間1000万PV）**
- Frontend: Vercel Enterprise
- Backend: Kubernetes on AWS/GCP
- DB: Aurora PostgreSQL（Read Replica 3台）
- Cache: Redis Cluster
- Monitoring: DataDog / New Relic
- **総コスト: ~150,000円/月**

---

## 🎯 まとめ

このアーキテクチャ設計により、BookTuberは：

1. **スモールスタート可能** - 低コストで開始できる
2. **段階的にスケール** - トラフィックに応じて拡張
3. **パフォーマンス維持** - キャッシュ戦略で高速化
4. **データ駆動** - アナリティクスで意思決定
5. **将来性** - 機能拡張に柔軟に対応

**今すぐ実装すべき優先事項：**
1. ✅ アナリティクス統合（実装済み）
2. キャッシュ基盤の整備（Redis）
3. エラーモニタリング（Sentry）
4. データベースインデックス最適化
5. CI/CD パイプライン構築

このドキュメントを参考に、段階的に成長させていきましょう！🚀

