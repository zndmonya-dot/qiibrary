# Qiibrary - Qiitaで話題の技術書まとめ

Qiita記事で言及されたIT技術書を収集し、ランキング形式で表示するWebサービス。

## 概要

### 主な機能

- **ランキング表示**
  - 24時間ランキング
  - 30日間ランキング
  - 365日間ランキング
  - 年別ランキング（2015年以降）
  - 全期間ランキング
  
- **書籍詳細ページ**
  - 書籍情報（タイトル、著者、出版社、価格など）
  - Amazon商品ページへのリンク
  - 言及しているQiita記事の一覧
  
- **自動データ収集**
  - Qiita APIから記事情報を取得
  - OpenBD APIとGoogle Books APIから書籍情報を取得
  - 言及数をベースにランキングを計算

### 自動更新（GitHub Actions）
- `.github/workflows/daily_data_refresh.yml` が毎日 UTC 00:30（JST 09:30）に実行
- `scripts/collect_books_from_qiita.py` を起動し、Neon 本番DBを更新
- リポジトリ Secrets で以下を設定
  - `DATABASE_URL`: Neon 接続URL
  - `QIITA_API_TOKEN`: Qiita API トークン
- `Actions > Daily Data Refresh > Run workflow` から手動実行も可能

### データフロー

```
Qiita API
    ↓
記事からISBN抽出
    ↓
OpenBD/Google Books APIで書籍情報取得
    ↓
データベース保存
    ↓
ランキング計算
    ↓
フロントエンド表示
```

## 技術スタック

### フロントエンド
- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** - スタイリング
- **Lucide Icons** - アイコン
- **Axios** - HTTP クライアント

### バックエンド
- **FastAPI** (Python 3.11+)
- **SQLAlchemy ORM** - ORM
- **Alembic** - マイグレーション
- **Pydantic** - バリデーション

### データベース
- **PostgreSQL 16+**

### デプロイ
- **フロントエンド**: Vercel
- **バックエンド**: Render
- **データベース**: Neon DB (Serverless PostgreSQL)
- **ドメイン**: Cloudflare Registrar
- **DNS/CDN**: Cloudflare

## データベース設計

### テーブル一覧

1. **books** - 書籍マスター
2. **qiita_articles** - Qiita記事情報

### ER図

```
books (書籍マスター)
├─ id (PK)
├─ isbn
├─ title
├─ author
├─ publisher
├─ publication_date
├─ description
├─ thumbnail_url
├─ amazon_url
├─ amazon_affiliate_url
├─ total_mentions
└─ latest_mention_at

qiita_articles
├─ id (PK)
├─ book_id (FK)
├─ qiita_id
├─ title
├─ url
├─ author_id
├─ author_name
├─ tags
├─ likes_count
├─ stocks_count
├─ comments_count
└─ published_at
```

## API設計

### エンドポイント

```
GET  /api/rankings/              ランキング（クエリパラメータで期間指定）
GET  /api/rankings/years         利用可能な年のリスト
GET  /api/books/{asin}           書籍詳細
```

## セットアップ

### 必要な環境

- **Node.js** 18.x 以上
- **Python** 3.11 以上
- **PostgreSQL** 16 以上

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

### バックエンド

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Mac/Linux

pip install -r requirements.txt

# 環境変数設定
copy env.template .env
# .envファイルを編集

# データベースマイグレーション
alembic upgrade head

# サーバー起動
uvicorn app.main:app --reload
```

または、Windows環境では：

```bash
cd backend
start.bat
```

## 収益化

- **Amazonアソシエイト・プログラム** - 書籍購入時の紹介料（現在審査中）

## ライセンス

MIT License

## 開発者

https://github.com/zndmonya-dot/qiibrary

---

## デプロイ前のチェックリスト

- [x] 利用規約・プライバシーポリシー・特商法ページの実装
- [ ] OGP画像（`public/og-image.png`）を作成
- [x] サイトマップを実装
- [x] robots.txtを実装
- [x] アイコン・ファビコンを作成
- [ ] SSL証明書を設定（Cloudflare経由）
- [ ] データベースバックアップを設定
- [ ] 環境変数を本番用に設定
