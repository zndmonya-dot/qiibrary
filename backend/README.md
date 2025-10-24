# Qiibrary Backend (FastAPI)

## セットアップ

### 1. Python環境構築

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. 依存パッケージインストール

```bash
pip install -r requirements.txt
```

### 3. 環境変数設定

```bash
copy .env.example .env
# .envファイルを編集して必要な値を設定
```

### 4. サーバー起動

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

APIドキュメント: http://localhost:8000/docs

## 最適化機能

### キャッシング（NEW）

NEONデータ転送量を削減するため、メモリベースのキャッシングを実装しています。

- **ランキングAPI**: 2-10分間キャッシュ（データの鮮度に応じて自動調整）
- **書籍詳細**: 5分間キャッシュ
- **タグ/年リスト**: 15分間キャッシュ

詳細: [NEON_DATA_OPTIMIZATION.md](./NEON_DATA_OPTIMIZATION.md)

#### キャッシュ管理エンドポイント

```bash
# キャッシュ統計
GET /api/admin/cache/stats
Authorization: Bearer YOUR_ADMIN_TOKEN

# キャッシュクリア
POST /api/admin/cache/clear
Authorization: Bearer YOUR_ADMIN_TOKEN
```

## API エンドポイント

### ランキング

- `GET /api/rankings/` - ランキング取得（タグ、期間でフィルタ可能）
- `GET /api/rankings/tags` - タグリスト
- `GET /api/rankings/years` - 年リスト

### 書籍

- `GET /api/books/{isbn}` - 書籍詳細
- `GET /api/books/` - 書籍検索

