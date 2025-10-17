# BookTuber Backend セットアップガイド

## 🚀 クイックスタート

### 1. 環境変数の設定

`.env` ファイルを作成:

```bash
cd backend
```

`.env` ファイルの内容:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/booktuber

# Redis
REDIS_URL=redis://localhost:6379/0

# YouTube Data API v3
YOUTUBE_API_KEY=your_youtube_api_key_here

# Amazon Product Advertising API v5
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG=yourtag-22
AMAZON_REGION=jp

# JWT
SECRET_KEY=your-very-secret-key-minimum-32-characters

# CORS
FRONTEND_URL=http://localhost:3000

# Timezone
TIMEZONE=Asia/Tokyo

# Environment
ENVIRONMENT=development
```

### 2. データベースのセットアップ

#### **Option A: PostgreSQL がインストール済みの場合**

```bash
# データベースを作成
createdb booktuber

# または psql で
psql -U postgres
CREATE DATABASE booktuber;
\q
```

#### **Option B: Docker を使う場合（推奨）**

```bash
# PostgreSQL コンテナを起動
docker run --name booktuber-postgres \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=booktuber \
  -p 5432:5432 \
  -d postgres:15

# Redis コンテナを起動
docker run --name booktuber-redis \
  -p 6379:6379 \
  -d redis:7
```

#### **Option C: Docker Compose を使う場合（最も簡単）**

`docker-compose.yml` を作成:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: booktuber-postgres
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: booktuber
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7
    container_name: booktuber-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

起動:

```bash
docker-compose up -d
```

### 3. Python パッケージのインストール

```bash
cd backend

# 仮想環境を作成（オプション）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係をインストール
pip install -r requirements.txt
```

### 4. データベースのマイグレーション

```bash
# Alembic でテーブルを作成
alembic upgrade head
```

### 5. サンプルデータの投入

```bash
# 初期化スクリプトを実行
python scripts/init_db.py
```

実行すると:
- 3冊の書籍を追加
- 2件のYouTube動画を追加
- 過去30日分の統計データを生成

### 6. サーバーの起動

```bash
# 開発サーバーを起動
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

サーバーが起動したら:
- API ドキュメント: http://localhost:8000/docs
- Redoc: http://localhost:8000/redoc

---

## 🧪 動作確認

### ブラウザでテスト

```
今日のランキング:
http://localhost:8000/api/rankings/today?locale=ja

過去30日のランキング:
http://localhost:8000/api/rankings/last30days?locale=ja

書籍詳細:
http://localhost:8000/api/books/4873115655
```

### curl でテスト

```bash
# 今日のランキング
curl http://localhost:8000/api/rankings/today?locale=ja

# 過去30日のランキング
curl http://localhost:8000/api/rankings/last30days?locale=ja

# 書籍詳細
curl http://localhost:8000/api/books/4873115655
```

---

## 📊 API エンドポイント一覧

### ランキング

```
GET /api/rankings/today
  - 今日のランキング
  - Query: locale (ja/en), limit (1-100)

GET /api/rankings/last30days
  - 過去30日間のランキング（スライディングウィンドウ）
  - Query: locale (ja/en), limit (1-100)

GET /api/rankings/last365days
  - 過去1年間のランキング（スライディングウィンドウ）
  - Query: locale (ja/en), limit (1-100)

GET /api/rankings/monthly/{year}/{month}
  - 特定月のアーカイブランキング
  - Path: year, month
  - Query: locale (ja/en), limit (1-100)

GET /api/rankings/yearly/{year}
  - 特定年のアーカイブランキング
  - Path: year
  - Query: locale (ja/en), limit (1-100)
```

### 書籍

```
GET /api/books/{asin}
  - 書籍詳細情報（YouTube動画リスト含む）
  - Path: asin

GET /api/books/
  - 書籍検索
  - Query: q (キーワード), locale (ja/en), limit, offset
```

---

## 🔧 トラブルシューティング

### データベース接続エラー

```
sqlalchemy.exc.OperationalError: could not connect to server
```

**解決策:**
- PostgreSQL が起動しているか確認
- DATABASE_URL が正しいか確認
- ファイアウォールの設定を確認

### マイグレーションエラー

```
alembic.util.exc.CommandError: Target database is not up to date
```

**解決策:**

```bash
# 現在のバージョンを確認
alembic current

# 最新にアップグレード
alembic upgrade head

# リセットが必要な場合
alembic downgrade base
alembic upgrade head
```

### API キー未設定エラー

```
YouTube API エラー: API key not valid
```

**解決策:**
- `.env` ファイルに YOUTUBE_API_KEY を設定
- YouTube Data API v3 を有効化
- https://console.cloud.google.com/apis/library

---

## 📚 次のステップ

1. **フロントエンドのセットアップ**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

2. **実データの収集**
   - YouTube API キーを取得
   - Amazon PA-API キーを取得
   - データ収集スクリプトを実行

3. **デプロイ**
   - `DEPLOYMENT.md` を参照
   - Vercel + Railway + Supabase

---

## 💡 開発Tips

### ホットリロード

```bash
# Uvicorn が自動的にコードの変更を検知
uvicorn app.main:app --reload
```

### ログレベルの変更

```bash
# DEBUG レベルでログを出力
uvicorn app.main:app --reload --log-level debug
```

### データベースのリセット

```bash
# 全データを削除して再作成
python scripts/init_db.py
# → y を入力
```

### API ドキュメント

FastAPI が自動生成:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🆘 サポート

問題が解決しない場合:
1. ログを確認
2. `ARCHITECTURE.md` を参照
3. GitHub で Issue を作成

**Good Luck! 🚀**

