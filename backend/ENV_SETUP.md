# バックエンド環境変数設定

## ローカル開発環境

### `.env` ファイルを作成

```bash
# backend/.env をenv.templateからコピー
cp env.template .env
```

### `.env` ファイルを編集

```bash
# Database（ローカルPostgreSQL）
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booktuber?client_encoding=utf8

# Database（NEON PostgreSQL）
# DATABASE_URL=postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-a4dh6sch-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require

# Qiita API
QIITA_API_TOKEN=your_qiita_api_token_here

# Amazon Associates
AMAZON_ASSOCIATE_TAG=your-tag-22

# JWT
SECRET_KEY=dev-secret-key-change-in-production

# CORS（ローカル開発 - HTTP）
FRONTEND_URL=http://localhost:3000

# CORS（ローカル開発 - HTTPS）
# FRONTEND_URL=https://localhost:3000

# Timezone
TIMEZONE=Asia/Tokyo

# Environment
ENVIRONMENT=development
```

## 本番環境（Render）

### Renderダッシュボードで環境変数を設定

1. https://dashboard.render.com/ にアクセス
2. バックエンドサービスを選択
3. Environment タブ
4. 以下の環境変数を追加：

```
DATABASE_URL=postgresql://neondb_owner:npg_XOEKiw51krxM@ep-wispy-breeze-a4dh6sch-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
QIITA_API_TOKEN=（あなたのQiita APIトークン）
AMAZON_ASSOCIATE_TAG=（あなたのAmazonアソシエイトタグ）
SECRET_KEY=（本番用の安全なキー、32文字以上のランダム文字列）
FRONTEND_URL=https://qiibrary.vercel.app
TIMEZONE=Asia/Tokyo
ENVIRONMENT=production
```

5. Save Changes

### SECRET_KEYの生成方法

```python
# Pythonで安全なSECRET_KEYを生成
import secrets
print(secrets.token_urlsafe(32))
```

または

```bash
# OpenSSLで生成
openssl rand -base64 32
```

## トラブルシューティング

### データベースに接続できない

1. `DATABASE_URL`が正しいか確認
2. NEON PostgreSQLの場合、`sslmode=require`が含まれているか確認
3. ローカルPostgreSQLの場合、サービスが起動しているか確認

### CORS エラー

1. `FRONTEND_URL`がフロントエンドのURLと一致しているか確認
2. `backend/app/main.py`の`allowed_origins`にURLが含まれているか確認
3. 必要に応じて`EXTRA_ALLOWED_ORIGINS`を設定（カンマ区切り）

```
EXTRA_ALLOWED_ORIGINS=https://preview.vercel.app,https://staging.example.com
```

