# フロントエンド環境変数設定

## ローカル開発環境

### `.env.local` ファイルを作成

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### HTTPS対応（オプション）

mkcert等で証明書を作成した場合：

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://localhost:8000
```

## 本番環境（Vercel）

### Vercelダッシュボードで環境変数を設定

1. https://vercel.com/dashboard にアクセス
2. プロジェクトを選択
3. Settings → Environment Variables
4. 以下の環境変数を追加：

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-app.onrender.com
Environment: Production
```

5. Save

### デプロイ

環境変数を設定後、再デプロイが必要な場合：

1. Deployments タブ
2. 最新のデプロイメントの右側の「...」メニュー
3. Redeploy

または、GitHubにpushすると自動的に再デプロイされます。

## トラブルシューティング

### APIに接続できない

1. `NEXT_PUBLIC_API_URL`が正しく設定されているか確認
2. バックエンドがHTTPSで起動しているか確認
3. CORS設定でフロントエンドのURLが許可されているか確認

### 環境変数が反映されない

- Next.jsの開発サーバーを再起動してください
- Vercelの場合は再デプロイしてください

