# BookTuber - IT技術書ランキングWebサービス

Zenn Booksから技術書を収集し、ランキング形式で表示するWebサービス。
日別・月別・年別のランキングを提供し、将来的には手動でYouTube動画リンクを追加できます。

## 概要

### 主な機能

- **ランキング表示**
  - 日別ランキング（TOP 50）
  - 月別ランキング（TOP 50）
  - 年別ランキング（TOP 50）
  
- **書籍詳細ページ**
  - 書籍情報（タイトル、著者、出版社、価格など）
  - Zenn Books URL
  - （将来的に）紹介しているYouTube動画の一覧・埋め込み
  
- **自動データ収集**
  - Zenn Books APIから技術書情報を定期取得
  - いいね数をベースにランキングを計算

### データフロー

```
Zenn Books API
    ↓
書籍情報取得（いいね順）
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
- **Remix Icon** - アイコン
- **SWR/TanStack Query** - データフェッチング・キャッシュ
- **Axios** - HTTP クライアント

### バックエンド
- **FastAPI** (Python 3.11+)
- **SQLAlchemy 2.0** - ORM
- **Alembic** - マイグレーション
- **Pydantic** - バリデーション
- **Celery** - 非同期タスク（将来的に）
- **Redis** - キャッシュ・タスクキュー（将来的に）

### データベース
- **PostgreSQL 16+**

### デプロイ
- **フロントエンド**: Vercel
- **バックエンド**: Railway / Render / AWS ECS
- **データベース**: Supabase / Railway / AWS RDS

## データベース設計

### テーブル一覧

1. **books** - 書籍マスター
2. **youtube_videos** - YouTube動画情報（将来的に手動追加）
3. **book_mentions** - 書籍と動画の関連付け
4. **book_daily_stats** - 書籍の日次統計

### ER図

```
books (書籍マスター)
├─ id (PK)
├─ asin (Zenn slug or ISBN)
├─ title
├─ author
├─ publisher
├─ publication_date
├─ price
├─ image_url
├─ affiliate_url (Zenn URL)
├─ locale (ja/en)
├─ total_views
├─ total_mentions (いいね数)
└─ latest_mention_at

book_daily_stats (日次統計)
├─ id (PK)
├─ book_id (FK)
├─ date
├─ daily_views
└─ daily_mentions
```

## API設計

### エンドポイント

```
GET  /api/rankings/today     日別ランキング
GET  /api/rankings/monthly   月別ランキング
GET  /api/rankings/yearly    年別ランキング
GET  /api/books/{asin}       書籍詳細
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
pip install -r requirements.txt

# データベーステーブル作成とデータ収集
python scripts/setup_and_collect_zenn.py

# サーバー起動
uvicorn app.main:app --reload
```

または、Windows環境では：

```bash
cd backend
start.bat
```

### データ収集

Zenn Books APIから書籍データを収集：

```bash
cd backend
python scripts/setup_and_collect_zenn.py
```

## 収益化

- **Zenn Books** - 有料技術書の場合、Zennの収益分配プログラム
- **YouTube** - 将来的に動画リンクを追加し、アフィリエイトリンクも追加可能

## 今後の拡張予定

- [x] 多言語対応（日本語・英語）
- [ ] 管理画面（YouTube動画の手動追加・編集）
- [ ] ユーザー登録・ログイン
- [ ] お気に入り機能
- [ ] 書籍の検索機能
- [ ] カテゴリ別ランキング
- [ ] トレンド分析
- [ ] メール通知（新着書籍、ランキング変動）

## ライセンス

MIT License

## 開発者

BookTuber Development Team

---

### デプロイ前のチェックリスト

- [ ] 利用規約・プライバシーポリシー・特商法ページの内容を正式版に更新
- [ ] OGP画像（`public/og-image.png`）を作成
- [ ] 環境変数を本番用に設定（`.env.production`）
- [ ] Google Analytics IDを設定
- [ ] サイトマップを確認
- [ ] robots.txtを確認
- [ ] セキュリティヘッダーを設定
- [ ] SSL証明書を設定
- [ ] データベースバックアップを設定
