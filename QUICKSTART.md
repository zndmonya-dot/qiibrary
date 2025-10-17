# BookTuber - クイックスタート

最速でBookTuberを動かす方法！⚡

---

## 🚀 5分でセットアップ

### ステップ 1: リポジトリをクローン

```bash
git clone https://github.com/your-username/booktube.git
cd booktube
```

### ステップ 2: データベースを起動

```bash
# Docker Compose でPostgreSQL + Redisを起動
docker-compose up -d

# 起動確認（約10秒待つ）
docker-compose ps
```

### ステップ 3: バックエンドのセットアップ

```bash
cd backend

# 環境変数を設定
cp env.template .env
# .env を編集してAPIキーを設定（後でOK）

# 仮想環境を作成
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 依存関係をインストール
pip install -r requirements.txt

# データベースを初期化
alembic upgrade head

# サンプルデータを投入
python scripts/init_db.py

# サーバーを起動
uvicorn app.main:app --reload
```

### ステップ 4: フロントエンドのセットアップ

**別のターミナルで:**

```bash
cd frontend

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ステップ 5: ブラウザで確認

```
フロントエンド: http://localhost:3000
バックエンドAPI: http://localhost:8000/docs
```

---

## ✅ 動作確認

### 1. ランキングページ

http://localhost:3000

- 3冊のサンプル書籍が表示される
- 「今日」「過去30日」「過去1年」タブが機能
- 書籍をクリックで詳細ページへ

### 2. 書籍詳細ページ

http://localhost:3000/books/4873115655

- 「リーダブルコード」の詳細が表示される
- YouTube動画が埋め込まれている

### 3. API動作確認

```bash
# ランキング取得
curl http://localhost:8000/api/rankings/today?locale=ja

# 書籍詳細取得
curl http://localhost:8000/api/books/4873115655
```

---

## 🎯 次のステップ

### 1. APIキーを取得（実データ収集に必要）

#### YouTube Data API v3
1. https://console.cloud.google.com/ にアクセス
2. 新しいプロジェクトを作成
3. 「YouTube Data API v3」を有効化
4. 「認証情報」でAPIキーを作成
5. `.env` の `YOUTUBE_API_KEY` に設定

#### Amazon Product Advertising API v5
1. https://affiliate.amazon.co.jp/ でアソシエイト登録
2. PA-API アクセスを申請
3. アクセスキーとシークレットキーを取得
4. `.env` の `AMAZON_ACCESS_KEY` と `AMAZON_SECRET_KEY` に設定

### 2. 実データを収集

```bash
cd backend

# YouTube動画を検索してAmazonリンクを抽出
python scripts/collect_data.py

# または対話的に
python -m app.services.youtube_service
```

### 3. ランキングを更新

```bash
# 日次統計を計算
python scripts/update_rankings.py
```

---

## 🛠️ トラブルシューティング

### エラー: `ModuleNotFoundError: No module named 'app'`

```bash
# 仮想環境が有効か確認
which python  # venv/bin/python と表示されるはず

# 再度有効化
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### エラー: `Connection refused` (PostgreSQL)

```bash
# Dockerコンテナが起動しているか確認
docker-compose ps

# 起動していない場合
docker-compose up -d

# ログを確認
docker-compose logs postgres
```

### エラー: `alembic.util.exc.CommandError`

```bash
# マイグレーションをリセット
alembic downgrade base
alembic upgrade head

# または init_db.py でリセット
python scripts/init_db.py
# → y を入力してデータをクリア
```

### フロントエンドが表示されない

```bash
# ポートが使用中か確認
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# 別のポートで起動
PORT=3001 npm run dev
```

---

## 📚 詳細ドキュメント

### アーキテクチャ
- [ARCHITECTURE.md](./ARCHITECTURE.md) - システム設計
- [RANKING_STRATEGY.md](./backend/RANKING_STRATEGY.md) - ランキング集計戦略
- [QUOTA_MANAGEMENT.md](./backend/QUOTA_MANAGEMENT.md) - API クォータ管理

### セットアップ
- [backend/SETUP.md](./backend/SETUP.md) - バックエンド詳細手順
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 本番環境デプロイ

### 開発
- [backend/README.md](./backend/README.md) - バックエンド開発ガイド
- [frontend/README.md](./frontend/README.md) - フロントエンド開発ガイド

---

## 💡 開発Tips

### ホットリロード

バックエンド・フロントエンドともに、コードを変更すると自動的に再読み込みされます。

### デバッグ

```bash
# バックエンド: ログレベルを DEBUG に
uvicorn app.main:app --reload --log-level debug

# フロントエンド: ブラウザの開発者ツールでコンソールを確認
```

### データベースの確認

```bash
# PostgreSQL に接続
docker exec -it booktuber-postgres psql -U user -d booktuber

# テーブル一覧
\dt

# 書籍を確認
SELECT * FROM books;

# 終了
\q
```

### Redis の確認

```bash
# Redis に接続
docker exec -it booktuber-redis redis-cli

# キーを確認
KEYS *

# 値を取得
GET quota:usage:2024-10-17

# 終了
exit
```

---

## 🎉 成功！

これでBookTuberが動作しています！

**何かあれば:**
- README.md を確認
- GitHub で Issue を作成
- [詳細ドキュメント](#📚-詳細ドキュメント) を参照

**Happy Coding! 🚀**

