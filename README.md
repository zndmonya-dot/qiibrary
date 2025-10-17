# BookTuber - IT技術書ランキングWebサービス

YouTubeで紹介されたIT技術書をランキング形式で表示するWebサービス。
YouTube動画の概要欄に記載されたAmazonリンクから書籍情報を自動収集し、日別・月別・年別のランキングを提供します。

## 概要

### 主な機能

- **ランキング表示**
  - 日別ランキング（TOP 50）
  - 月別ランキング（TOP 50）
  - 年別ランキング（TOP 50）
  
- **書籍詳細ページ**
  - 書籍情報（タイトル、著者、出版社、価格など）
  - 紹介しているYouTube動画の一覧・埋め込み
  - Amazonアフィリエイトリンク
  
- **自動データ収集**
  - YouTube Data APIで動画情報を定期取得
  - 概要欄からAmazonリンクを抽出
  - Amazon Product Advertising APIで書籍詳細を取得
  - 日次で再生数を更新し、ランキングを再計算

### データフロー

```
YouTube動画取得
    ↓
概要欄からAmazonリンク抽出（正規表現）
    ↓
ASIN抽出
    ↓
Amazon PA APIで書籍情報取得
    ↓
アフィリエイトリンク生成
    ↓
データベース保存
    ↓
ランキング計算（日次バッチ）
    ↓
フロントエンド表示
```

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** - スタイリング
- **Material Design 3** - デザインガイドライン
- **Remix Icon** - アイコン
- **SWR** / **TanStack Query** - データフェッチング
- **Axios** - API通信

### バックエンド
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** - ORM
- **Alembic** - DBマイグレーション
- **Pydantic** - バリデーション
- **Celery** - バックグラウンドタスク
- **Redis** - Celeryブローカー + キャッシング

### データベース
- **PostgreSQL 15+**

### 外部API
- **YouTube Data API v3** - 動画・チャンネル情報取得
- **Amazon Product Advertising API v5** - 書籍情報・アフィリエイトリンク生成

### デプロイ
- フロントエンド: **Vercel**
- バックエンド: **Railway** / **Render** / **AWS ECS**
- データベース: **Supabase** / **Railway** / **AWS RDS**

## データベース設計

### ER図

```
youtube_channels (1) ─── (N) youtube_videos
                                    │
                                    │ (N)
                                    │
book_video_relations (中間テーブル)
                                    │
                                    │ (N)
                                    │
                              books (1) ─── (N) daily_rankings
                                    │       ─── (N) monthly_rankings
                                    │       ─── (N) yearly_rankings
                                    │
                                    │ (N)
                              book_categories (中間テーブル)
                                    │
                                    │ (N)
                                    │
                              categories
```

### 主要テーブル

#### 1. books（書籍）
```sql
- id (PK)
- asin (UNIQUE) - Amazon商品ID
- title - 書籍タイトル
- author - 著者
- publisher - 出版社
- publication_date - 発売日
- price - 価格（円）
- image_url - カバー画像URL
- amazon_url - 元のAmazonリンク
- affiliate_url - アフィリエイトリンク
- description - 説明
- total_views - 関連動画の累計再生数
- total_mentions - 紹介された回数
- latest_mention_at - 最新の紹介日時
```

#### 2. youtube_channels（YouTubeチャンネル）
```sql
- id (PK)
- channel_id (UNIQUE) - YouTube channel ID
- channel_name - チャンネル名
- channel_url - チャンネルURL
- thumbnail_url - サムネイルURL
- subscriber_count - 登録者数
- is_monitored - 定期取得対象フラグ
```

#### 3. youtube_videos（YouTube動画）
```sql
- id (PK)
- video_id (UNIQUE) - YouTube video ID
- channel_id (FK) - チャンネルID
- title - 動画タイトル
- description - 概要欄（Amazonリンク抽出元）
- thumbnail_url - サムネイルURL
- video_url - 動画URL
- view_count - 再生数
- like_count - いいね数
- comment_count - コメント数
- previous_view_count - 前回取得時の再生数
- published_at - 公開日時
- duration - 動画の長さ（秒）
- last_fetched_at - 最終取得日時
```

#### 4. book_video_relations（書籍と動画の関連）
多対多の中間テーブル
```sql
- id (PK)
- book_id (FK) - 書籍ID
- video_id (FK) - 動画ID
- mentioned_at_seconds - 動画内の言及時刻（秒）
- amazon_link_position - 概要欄での順番
```

#### 5. daily_rankings（日別ランキングキャッシュ）
```sql
- id (PK)
- book_id (FK)
- ranking_date - ランキング日
- rank_position - 順位
- total_views - 累計再生数
- daily_views - その日の新規再生数
- mention_count - 紹介回数
```

#### 6. monthly_rankings（月別ランキングキャッシュ）
```sql
- id (PK)
- book_id (FK)
- year - 年
- month - 月
- rank_position - 順位
- total_views - 累計再生数
- monthly_views - その月の新規再生数
- mention_count - 紹介回数
```

#### 7. yearly_rankings（年別ランキングキャッシュ）
```sql
- id (PK)
- book_id (FK)
- year - 年
- rank_position - 順位
- total_views - 累計再生数
- yearly_views - その年の新規再生数
- mention_count - 紹介回数
```

#### 8. categories（カテゴリ）
```sql
- id (PK)
- name - カテゴリ名
- slug - URLスラッグ
- description - 説明
- icon - Remix Iconクラス名
- display_order - 表示順

初期データ例:
- Web開発 (ri-code-box-line)
- AI・機械学習 (ri-brain-line)
- インフラ・DevOps (ri-server-line)
- データベース (ri-database-line)
- アルゴリズム (ri-function-line)
- セキュリティ (ri-shield-line)
- モバイル開発 (ri-smartphone-line)
- その他 (ri-more-line)
```

#### 9. book_categories（書籍とカテゴリの関連）
```sql
- id (PK)
- book_id (FK)
- category_id (FK)
```

#### 10. video_stats_history（動画統計履歴）
日別の再生数変化を記録
```sql
- id (PK)
- video_id (FK)
- recorded_date - 記録日
- view_count - 再生数
- like_count - いいね数
- comment_count - コメント数
- daily_view_increase - 前日からの増加数
```

#### 11. search_configs（YouTube検索設定）
定期取得の設定
```sql
- id (PK)
- name - 設定名
- search_type - 検索タイプ ('channel' or 'keyword')
- channel_id (FK) - チャンネルID（チャンネル検索時）
- search_keyword - 検索キーワード（キーワード検索時）
- is_active - 有効フラグ
- fetch_interval_hours - 取得間隔（時間）
- last_fetched_at - 最終取得日時
- next_fetch_at - 次回取得日時
```

#### 12. admin_users（管理者）
```sql
- id (PK)
- email (UNIQUE)
- hashed_password
- username
- is_active
- is_superuser
```

## API設計

### ランキングAPI

#### 日別ランキング取得
```http
GET /api/rankings/daily?date=2025-10-17&limit=50
```

**レスポンス**:
```json
{
  "rankings": [
    {
      "rank": 1,
      "book": {
        "asin": "B09XXXXXX",
        "title": "リーダブルコード",
        "author": "Dustin Boswell, Trevor Foucher",
        "publisher": "オライリージャパン",
        "price": 2640,
        "image_url": "https://...",
        "affiliate_url": "https://amzn.to/xxxxx?tag=yourtag-22"
      },
      "stats": {
        "total_views": 1234567,
        "daily_views": 5678,
        "mention_count": 5
      }
    }
  ],
  "period": {
    "type": "daily",
    "date": "2025-10-17"
  }
}
```

#### 月別ランキング取得
```http
GET /api/rankings/monthly?year=2025&month=10&limit=50
```

#### 年別ランキング取得
```http
GET /api/rankings/yearly?year=2025&limit=50
```

### 書籍詳細API

```http
GET /api/books/{asin}
```

**レスポンス**:
```json
{
  "book": {
    "asin": "B09XXXXXX",
    "title": "リーダブルコード",
    "author": "Dustin Boswell, Trevor Foucher",
    "publisher": "オライリージャパン",
    "publication_date": "2012-06-23",
    "price": 2640,
    "description": "コードは理解しやすくなければならない...",
    "image_url": "https://...",
    "affiliate_url": "https://amzn.to/xxxxx?tag=yourtag-22",
    "total_views": 1234567,
    "total_mentions": 5
  },
  "youtube_videos": [
    {
      "video_id": "abc123",
      "title": "エンジニアなら読むべき技術書10選",
      "channel_name": "テック解説チャンネル",
      "thumbnail_url": "https://...",
      "video_url": "https://www.youtube.com/watch?v=abc123",
      "view_count": 123456,
      "like_count": 5678,
      "published_at": "2025-09-15T10:00:00+09:00"
    }
  ]
}
```

### カテゴリ別ランキングAPI

```http
GET /api/rankings/category/{category_slug}?period=daily&limit=50
```

### 管理者API（認証必須）

```http
POST /api/admin/videos - 動画手動追加
GET /api/admin/books - 書籍一覧取得
PUT /api/admin/books/{id} - 書籍情報編集
POST /api/admin/search-configs - 検索設定追加
```

## バックグラウンドジョブ（Celery）

### 定期実行タスク

#### 1. 動画統計更新（毎日1回 - 深夜2時）
```python
@celery.task
def update_video_stats():
    """
    - YouTube Data APIで全動画の最新再生数取得
    - 前回との差分を計算
    - video_stats_historyに保存
    - youtube_videos.previous_view_countを更新
    """
```

#### 2. ランキング計算（毎日1回 - 深夜3時）
```python
@celery.task
def calculate_rankings():
    """
    - 日別・月別・年別ランキングを計算
    - daily_rankings, monthly_rankings, yearly_rankingsに保存
    - books.total_viewsを更新
    """
```

#### 3. 新規動画取得（6時間ごと）
```python
@celery.task
def fetch_new_videos():
    """
    - search_configsからアクティブな設定を取得
    - YouTube Data APIで新着動画を検索
    - 概要欄からAmazonリンクを抽出
    - 新規書籍の場合、Amazon PA APIで詳細取得
    - データベースに保存
    """
```

#### 4. 書籍情報更新（週1回 - 日曜深夜）
```python
@celery.task
def update_book_info():
    """
    - Amazon PA APIで書籍情報を再取得
    - 価格変動などを反映
    """
```

## 画面設計

### トップページ（/）

```
┌────────────────────────────────────────────────┐
│ 🎯 BookTuber - IT技術書ランキング                │
│                                                │
│ [ 今日 ] [ 今月 ] [ 今年 ]  ← タブ            │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 1位 [📚]  リーダブルコード              │ │
│ │          著者: Dustin Boswell           │ │
│ │          ¥2,640 | 紹介回数: 5回          │ │
│ │          累計再生: 1.2M回                │ │
│ │          [📺 紹介動画] [🛒 Amazon]        │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ 2位 [📚]  詳解システム設計面接          │ │
│ │          ...                            │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ ... (50位まで)                                 │
│                                                │
│ サイドバー:                                    │
│ - カテゴリフィルター                           │
│   □ Web開発                                   │
│   □ AI・機械学習                              │
│   □ インフラ                                  │
│   ...                                         │
└────────────────────────────────────────────────┘
```

### 書籍詳細ページ（/books/[asin]）

```
┌────────────────────────────────────────────────┐
│ [← ランキングに戻る]                           │
│                                                │
│ [📚 大きな     リーダブルコード               │
│  カバー画像]   著者: Dustin Boswell           │
│               出版社: オライリージャパン       │
│               発売日: 2012-06-23              │
│               価格: ¥2,640                    │
│                                                │
│               [🛒 Amazonで購入（大ボタン）]    │
│                                                │
│ ───────────────────────────────────────────── │
│                                                │
│ 書籍説明:                                      │
│ コードは理解しやすくなければならない...        │
│                                                │
│ ───────────────────────────────────────────── │
│                                                │
│ この本を紹介しているYouTube動画 (5件)          │
│                                                │
│ ┌──────────────────────────────────────────┐ │
│ │ [YouTube埋め込みプレイヤー]              │ │
│ │ エンジニアなら読むべき技術書10選          │ │
│ │ テック解説チャンネル | 12万回再生        │ │
│ └──────────────────────────────────────────┘ │
│                                                │
│ ┌──────────────────────────────────────────┐ │
│ │ [YouTube埋め込みプレイヤー]              │ │
│ │ 新人エンジニアにおすすめの本5選          │ │
│ │ プログラミング講座 | 8万回再生           │ │
│ └──────────────────────────────────────────┘ │
│                                                │
│ ...                                           │
│                                                │
│               [🛒 Amazonで購入（大ボタン）]    │
└────────────────────────────────────────────────┘
```

## Amazonリンク抽出ロジック

### 対応するAmazonリンク形式

```python
import re
from typing import List, Optional

def extract_amazon_links(description: str) -> List[str]:
    """YouTube概要欄からAmazonリンクを抽出"""
    patterns = [
        # 標準形式
        r'https?://(?:www\.)?amazon\.co\.jp/(?:.*?/)?dp/([A-Z0-9]{10})',
        r'https?://(?:www\.)?amazon\.co\.jp/(?:.*?/)?gp/product/([A-Z0-9]{10})',
        
        # 短縮URL
        r'https?://amzn\.to/\w+',
        r'https?://amzn\.asia/\w+',
    ]
    
    links = []
    for pattern in patterns:
        matches = re.findall(pattern, description, re.IGNORECASE)
        links.extend(matches)
    
    return list(set(links))  # 重複除去

def extract_asin_from_url(url: str) -> Optional[str]:
    """AmazonリンクからASINを抽出"""
    # 標準形式
    match = re.search(r'/dp/([A-Z0-9]{10})', url)
    if match:
        return match.group(1)
    
    match = re.search(r'/gp/product/([A-Z0-9]{10})', url)
    if match:
        return match.group(1)
    
    # 短縮URLの場合はリダイレクトを追跡
    if 'amzn.to' in url or 'amzn.asia' in url:
        # requests.head()でリダイレクト先を取得
        pass
    
    return None

def generate_affiliate_url(asin: str, associate_tag: str) -> str:
    """アフィリエイトリンクを生成"""
    return f"https://www.amazon.co.jp/dp/{asin}?tag={associate_tag}"
```

## SEO対策

### 1. メタタグ最適化（Next.js）

```typescript
// app/books/[asin]/page.tsx
export async function generateMetadata({ params }) {
  const book = await fetchBook(params.asin);
  
  return {
    title: `${book.title} - IT技術書ランキング | BookTuber`,
    description: `${book.title}（${book.author}）のランキング情報。YouTubeで紹介された回数や再生数をチェック。`,
    openGraph: {
      title: book.title,
      description: book.description,
      images: [book.image_url],
    },
  };
}
```

### 2. 構造化データ（Schema.org - Book）

```json
{
  "@context": "https://schema.org",
  "@type": "Book",
  "name": "リーダブルコード",
  "author": {
    "@type": "Person",
    "name": "Dustin Boswell"
  },
  "publisher": {
    "@type": "Organization",
    "name": "オライリージャパン"
  },
  "datePublished": "2012-06-23",
  "isbn": "9784873115658",
  "image": "https://...",
  "offers": {
    "@type": "Offer",
    "price": "2640",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "url": "https://www.amazon.co.jp/..."
  }
}
```

### 3. サイトマップ自動生成

```xml
<!-- sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://booktube.example.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://booktube.example.com/books/B09XXXXXX</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  ...
</urlset>
```

## 収益最大化戦略

### 1. アフィリエイトリンク配置

- **リスト表示**: 各書籍に「Amazonで購入」ボタン
- **詳細ページ**: 
  - ページ上部に大きなCTAボタン
  - 動画リスト下部にもう一度CTAボタン
  - サイドバーに固定表示（スクロール追従）

### 2. ユーザーエンゲージメント向上

- YouTube動画埋め込みで滞在時間UP
- 関連書籍のレコメンド機能
- 「この本を紹介している動画」で発見性向上

### 3. SEO最適化

- 書籍名、著者名でのロングテールSEO
- 「〇〇 おすすめ 本」などのキーワード対策
- 定期更新（ランキング更新）でクロール頻度UP

## セットアップ手順

### 前提条件

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Redis
- YouTube Data API v3のAPIキー
- Amazon Product Advertising API v5の認証情報

### 環境構築

```bash
# リポジトリクローン
git clone https://github.com/yourusername/booktube.git
cd booktube

# バックエンドセットアップ
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .envファイルを編集

# データベースマイグレーション
alembic upgrade head

# Celeryワーカー起動
celery -A app.celery worker --loglevel=info

# FastAPI起動
uvicorn app.main:app --reload

# フロントエンドセットアップ（別ターミナル）
cd ../frontend
npm install
cp .env.example .env.local
# .env.localファイルを編集

# Next.js起動
npm run dev
```

### 環境変数（backend/.env）

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/booktube

# Redis
REDIS_URL=redis://localhost:6379/0

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key

# Amazon Product Advertising API
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=yourtag-22
AMAZON_REGION=jp

# JWT認証
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000
```

### 環境変数（frontend/.env.local）

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## ディレクトリ構成

```
booktube/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPIアプリケーション
│   │   ├── config.py            # 設定
│   │   ├── database.py          # DB接続
│   │   ├── models/              # SQLAlchemyモデル
│   │   │   ├── book.py
│   │   │   ├── video.py
│   │   │   ├── ranking.py
│   │   │   └── ...
│   │   ├── schemas/             # Pydanticスキーマ
│   │   │   ├── book.py
│   │   │   ├── video.py
│   │   │   └── ...
│   │   ├── api/                 # APIエンドポイント
│   │   │   ├── rankings.py
│   │   │   ├── books.py
│   │   │   ├── admin.py
│   │   │   └── ...
│   │   ├── services/            # ビジネスロジック
│   │   │   ├── youtube.py       # YouTube API連携
│   │   │   ├── amazon.py        # Amazon API連携
│   │   │   ├── ranking.py       # ランキング計算
│   │   │   └── ...
│   │   ├── tasks/               # Celeryタスク
│   │   │   ├── video_stats.py
│   │   │   ├── fetch_videos.py
│   │   │   └── ...
│   │   └── utils/
│   │       ├── link_extractor.py  # Amazonリンク抽出
│   │       └── ...
│   ├── alembic/                 # マイグレーション
│   │   └── versions/
│   ├── tests/
│   ├── requirements.txt
│   ├── .env.example
│   └── alembic.ini
│
├── frontend/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx             # トップページ
│   │   ├── layout.tsx
│   │   ├── books/
│   │   │   └── [asin]/
│   │   │       └── page.tsx     # 書籍詳細ページ
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   │       └── page.tsx
│   │   └── admin/               # 管理画面
│   ├── components/
│   │   ├── BookCard.tsx
│   │   ├── RankingList.tsx
│   │   ├── VideoEmbed.tsx
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts               # API通信
│   │   └── utils.ts
│   ├── public/
│   ├── styles/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.example
│   └── next.config.js
│
└── README.md
```

## デプロイ前のチェックリスト

サービスを本番環境にデプロイする前に、以下の項目を確認・設定してください：

### 法的ページの設定

- [ ] **特定商取引法ページ** (`/app/legal/page.tsx`)
  - 運営者名の記載
  - 所在地の記載
  - お問い合わせメールアドレスの記載

- [ ] **Footerコンポーネント** (`/components/Footer.tsx`)
  - X (Twitter) アカウントURLの変更
  - GitHub アカウントURLの変更

- [ ] **Aboutページ** (`/app/about/page.tsx`)
  - X (Twitter) アカウントURLの変更
  - GitHub アカウントURLの変更

- [ ] **お問い合わせページ** (`/app/contact/page.tsx`)
  - X (Twitter) アカウントURLの変更
  - GitHub リポジトリURLの変更
  - お問い合わせメールアドレスの変更

### OGP画像の準備

- [ ] `/public/og-image.png` (1200x630px) の作成
- [ ] `/public/favicon.ico` の作成
- [ ] `/public/apple-touch-icon.png` (180x180px) の作成

### 環境変数の設定

#### フロントエンド (`frontend/.env`)
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
```

#### バックエンド (`backend/.env`)
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://host:6379/0
YOUTUBE_API_KEY=your_youtube_api_key
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=yourtag-22
SECRET_KEY=your-secret-key-for-jwt
FRONTEND_URL=https://yourdomain.com
```

### SEO・アナリティクス

- [ ] Google Search Console の登録
- [ ] Google Analytics の設定
- [ ] sitemap.xml の確認（自動生成）
- [ ] robots.txt の確認（自動生成）

### アフィリエイト設定

- [ ] Amazonアソシエイト・プログラムへの登録
- [ ] アソシエイトタグの取得・設定
- [ ] 報酬受取口座の設定

## 今後の拡張予定

- [ ] ユーザー登録・ログイン機能
- [ ] お気に入り機能
- [ ] コメント・レビュー機能
- [ ] 書籍の比較機能
- [ ] メール通知（新着ランキング、価格変動など）
- [x] 多言語対応（日本語・英語）
- [ ] モバイルアプリ（React Native）
- [ ] カテゴリ別ランキング
- [ ] 検索機能の強化

## ライセンス

MIT License

## 作者

Your Name

## 謝辞

- YouTube Data API v3
- Amazon Product Advertising API v5
- すべてのOSSコントリビューター

