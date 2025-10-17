# BookTuber - デプロイメントガイド

## 📋 目次

1. [環境変数の設定](#環境変数の設定)
2. [フロントエンドデプロイ（Vercel）](#フロントエンドデプロイvercel)
3. [バックエンドデプロイ（Railway）](#バックエンドデプロイrailway)
4. [データベースセットアップ](#データベースセットアップ)
5. [ドメイン設定](#ドメイン設定)
6. [SSL証明書](#ssl証明書)
7. [CI/CDパイプライン](#cicdパイプライン)

---

## 🔐 環境変数の設定

### **フロントエンド（Next.js）**

#### **開発環境（`.env.local`）**

```bash
# バックエンドAPI URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Google Analytics 4（オプション）
NEXT_PUBLIC_GA_ID=

# 独自アナリティクス（オプション）
NEXT_PUBLIC_ANALYTICS_ENDPOINT=

# サイトURL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### **本番環境（Vercel）**

Vercel ダッシュボードで以下を設定：

```bash
# 必須
NEXT_PUBLIC_API_URL=https://api.booktuber.com

# 推奨
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_SITE_URL=https://booktuber.com

# オプション
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://api.booktuber.com/analytics
```

### **バックエンド（FastAPI）**

#### **開発環境（`.env`）**

```bash
# データベース
DATABASE_URL=postgresql://user:password@localhost:5432/booktuber

# Redis
REDIS_URL=redis://localhost:6379/0

# YouTube API
YOUTUBE_API_KEY=your_youtube_api_key_here

# Amazon API
AMAZON_ACCESS_KEY=your_amazon_access_key
AMAZON_SECRET_KEY=your_amazon_secret_key
AMAZON_ASSOCIATE_TAG_JP=yourtag-22
AMAZON_ASSOCIATE_TAG_EN=yourtag-20
AMAZON_REGION=jp

# JWT
SECRET_KEY=your-very-secret-key-change-this-in-production-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=http://localhost:3000

# タイムゾーン
TIMEZONE=Asia/Tokyo

# 環境
ENVIRONMENT=development

# Sentry（オプション）
SENTRY_DSN=
```

#### **本番環境（Railway/Render/AWS）**

```bash
# 必須
DATABASE_URL=postgresql://user:password@db.railway.app:5432/booktuber
REDIS_URL=redis://redis.railway.app:6379/0
YOUTUBE_API_KEY=your_actual_youtube_api_key
AMAZON_ACCESS_KEY=your_actual_amazon_access_key
AMAZON_SECRET_KEY=your_actual_amazon_secret_key
AMAZON_ASSOCIATE_TAG_JP=yourtag-22
AMAZON_ASSOCIATE_TAG_EN=yourtag-20

# セキュリティ
SECRET_KEY=generate-a-strong-random-key-at-least-32-characters-long
FRONTEND_URL=https://booktuber.com

# 本番環境
ENVIRONMENT=production

# モニタリング（推奨）
SENTRY_DSN=https://xxx@sentry.io/xxx

# スケーリング用（オプション）
DATABASE_READ_REPLICA_URL=postgresql://...
MAX_WORKERS=4
```

---

## 🚀 フロントエンドデプロイ（Vercel）

### **1. GitHubリポジトリとの連携**

```bash
# 1. GitHubにプッシュ
git remote add origin https://github.com/your-username/booktuber.git
git push -u origin main

# 2. Vercelアカウント作成
https://vercel.com/signup

# 3. リポジトリをインポート
- "New Project" をクリック
- GitHubリポジトリを選択
- Framework Preset: Next.js を選択
- Root Directory: frontend
```

### **2. Vercel設定**

```json
// vercel.json（プロジェクトルートに作成）
{
  "buildCommand": "cd frontend && npm run build",
  "outputDirectory": "frontend/.next",
  "devCommand": "cd frontend && npm run dev",
  "installCommand": "cd frontend && npm install",
  "framework": "nextjs",
  "regions": ["hnd1", "icn1"],
  "env": {
    "NEXT_PUBLIC_API_URL": "@api-url",
    "NEXT_PUBLIC_GA_ID": "@ga-id",
    "NEXT_PUBLIC_SITE_URL": "@site-url"
  }
}
```

### **3. カスタムドメイン設定**

Vercel ダッシュボード:
1. Settings > Domains
2. `booktuber.com` を追加
3. DNSレコードを設定:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## 🐍 バックエンドデプロイ（Railway）

### **1. Railwayプロジェクト作成**

```bash
# Railway CLIインストール
npm install -g @railway/cli

# ログイン
railway login

# プロジェクト初期化
cd backend
railway init

# PostgreSQL追加
railway add --plugin postgresql

# Redis追加
railway add --plugin redis
```

### **2. 環境変数設定**

Railway ダッシュボード:
1. Variables タブ
2. 上記の本番環境変数を追加

### **3. Dockerfile作成**

```dockerfile
# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# システム依存関係
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Python依存関係
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコード
COPY . .

# ポート公開
EXPOSE 8000

# Uvicorn起動
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
```

### **4. デプロイ**

```bash
# Railwayにデプロイ
railway up

# ログ確認
railway logs
```

---

## 🗄️ データベースセットアップ

### **1. Supabase（推奨：無料枠あり）**

```bash
# 1. https://supabase.com でプロジェクト作成

# 2. 接続情報を取得
# Settings > Database > Connection string

# 3. マイグレーション実行
DATABASE_URL="postgresql://..." alembic upgrade head
```

### **2. Railway PostgreSQL**

```bash
# 自動的にプロビジョニング
railway add --plugin postgresql

# 接続情報は環境変数に自動設定
echo $DATABASE_URL
```

### **3. マイグレーション**

```bash
# Alembicセットアップ
cd backend
alembic init alembic

# マイグレーションファイル作成
alembic revision --autogenerate -m "Initial schema"

# 適用
alembic upgrade head
```

---

## 🌐 ドメイン設定

### **1. ドメイン購入**

推奨レジストラ:
- **Cloudflare Registrar** - 最安値
- **Google Domains** - 使いやすい
- **Namecheap** - 人気

### **2. DNS設定例**

```
# Cloudflare DNS設定

# フロントエンド（Vercel）
Type: CNAME
Name: @
Content: cname.vercel-dns.com
Proxy: ON（推奨）

Type: CNAME
Name: www
Content: cname.vercel-dns.com
Proxy: ON

# バックエンド（Railway）
Type: CNAME
Name: api
Content: your-project.railway.app
Proxy: ON

# メール（将来的に）
Type: MX
Name: @
Priority: 10
Content: mail.booktuber.com
```

---

## 🔒 SSL証明書

### **Vercel & Railway**
- 自動的にLet's Encrypt証明書を提供
- 設定不要

### **カスタムサーバー（VPS等）の場合**

```bash
# Certbot インストール
sudo apt-get install certbot python3-certbot-nginx

# 証明書取得
sudo certbot --nginx -d booktuber.com -d www.booktuber.com

# 自動更新設定
sudo systemctl enable certbot.timer
```

---

## 🔄 CI/CDパイプライン

### **GitHub Actions設定**

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  # フロントエンドテスト
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: cd frontend && npm ci
        
      - name: Run linter
        run: cd frontend && npm run lint
        
      - name: Run tests
        run: cd frontend && npm test
        
      - name: Build
        run: cd frontend && npm run build

  # バックエンドテスト
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          
      - name: Run tests
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
        run: |
          cd backend
          pytest

  # 本番デプロイ
  deploy:
    needs: [frontend-test, backend-test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Vercelは自動デプロイ
      
      # Railwayデプロイ
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
        run: |
          npm install -g @railway/cli
          railway up --service backend
```

---

## 📊 デプロイ後のチェックリスト

### **必須チェック項目**

- [ ] フロントエンドが正常に表示される
- [ ] バックエンドAPIが応答する
- [ ] データベース接続が確立している
- [ ] Redisキャッシュが動作している
- [ ] HTTPS証明書が有効
- [ ] 環境変数がすべて設定されている
- [ ] ドメインが正しく解決される
- [ ] CORS設定が正しい

### **推奨チェック項目**

- [ ] Google Analyticsが動作している
- [ ] エラーモニタリング（Sentry）が動作
- [ ] バックアップが設定されている
- [ ] ログが記録されている
- [ ] パフォーマンスモニタリングが有効
- [ ] レートリミットが動作している
- [ ] sitemap.xmlが生成されている
- [ ] robots.txtが正しい
- [ ] OGP画像が表示される

---

## 🆘 トラブルシューティング

### **よくある問題**

#### **1. "API接続エラー"**

```bash
# CORS設定を確認
# backend/app/main.py

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://booktuber.com"],  # 本番ドメインを追加
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### **2. "データベース接続エラー"**

```bash
# 接続文字列を確認
echo $DATABASE_URL

# SSL接続が必要な場合
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

#### **3. "ビルドエラー"**

```bash
# 依存関係を再インストール
cd frontend
rm -rf node_modules package-lock.json
npm install

# キャッシュをクリア
npm run build -- --no-cache
```

#### **4. "500 Internal Server Error"**

```bash
# バックエンドログを確認
railway logs

# エラー詳細を表示
# backend/app/main.py
app = FastAPI(debug=False)  # 本番環境ではFalse

# Sentryでエラーを確認
```

---

## 🎯 本番環境の最適化

### **1. パフォーマンス**

```bash
# Vercel設定
# next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
}
```

### **2. セキュリティ**

```python
# ヘッダーの設定
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Strict-Transport-Security"] = "max-age=31536000"
    return response
```

### **3. モニタリング**

```python
# Sentryアラート設定
sentry_sdk.init(
    dsn=settings.SENTRY_DSN,
    environment=settings.ENVIRONMENT,
    traces_sample_rate=0.1,
    profiles_sample_rate=0.1,
)
```

---

## 📞 サポート

問題が発生した場合:
1. ログを確認
2. 環境変数を確認
3. ARCHITECTURE.mdを参照
4. GitHubでIssueを作成

**成功をお祈りします！🚀**

