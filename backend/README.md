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

## API エンドポイント

### ランキング

- `GET /api/rankings/daily` - 日別ランキング
- `GET /api/rankings/monthly` - 月別ランキング
- `GET /api/rankings/yearly` - 年別ランキング

### 書籍

- `GET /api/books/{asin}` - 書籍詳細

