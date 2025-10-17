# YouTube Data API v3 セットアップガイド

## 🎯 APIキーの取得手順

### **ステップ1: Google Cloud Platformプロジェクトの作成**

1. **Google Cloud Console** にアクセス
   - https://console.cloud.google.com/

2. **新しいプロジェクトを作成**
   - プロジェクト名: `booktuber-production`
   - 組織: （任意）
   - 場所: （任意）

### **ステップ2: YouTube Data API v3 を有効化**

1. **APIとサービス** → **ライブラリ** を開く
   - https://console.cloud.google.com/apis/library

2. 「YouTube Data API v3」を検索

3. **有効にする** をクリック

### **ステップ3: APIキーの作成**

1. **APIとサービス** → **認証情報** を開く
   - https://console.cloud.google.com/apis/credentials

2. **+ 認証情報を作成** → **APIキー** をクリック

3. APIキーが生成される
   ```
   例: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **キーの名前を変更**（推奨）
   - 名前: `BookTuber YouTube API Key (Production)`
   - または: `BookTuber - YouTube API - Prod`

### **ステップ4: APIキーの制限設定（重要）**

セキュリティのため、必ず制限を設定してください：

#### **アプリケーションの制限**

**オプション1: HTTPリファラー（Webアプリ用）**
```
https://yourdomain.com/*
https://www.yourdomain.com/*
http://localhost:3000/*  # 開発環境
```

**オプション2: IPアドレス（サーバー用）**
```
123.456.789.0/24  # バックエンドサーバーのIP
```

**オプション3: なし（推奨しない）**
- 開発・テスト時のみ
- 本番環境では必ず制限を設定

#### **APIの制限**

1. **APIを制限** を選択
2. **YouTube Data API v3** のみチェック
3. 他のAPIは無効化（不要なアクセスを防止）

### **ステップ5: 環境変数に設定**

1. `backend/.env` ファイルを編集
   ```bash
   # YouTube Data API v3
   # プロジェクト: booktuber-production
   # 制限: HTTPリファラー or IPアドレス
   # クォータ: 10,000ポイント/日
   YOUTUBE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

2. **絶対にGitにコミットしない**
   - `.env` は `.gitignore` に含まれていることを確認

### **ステップ6: 動作確認**

```bash
cd backend
python scripts\setup_and_collect.py --keywords 2
```

成功すると：
```
✓ 'プログラミング 本 おすすめ 2024' で 10 件の動画を発見
✓ '技術書 レビュー' で 8 件の動画を発見
📺 合計 18 件の動画を取得
```

---

## 📊 クォータ管理

### **1日のクォータ上限**
- **10,000ポイント**（デフォルト）
- 上限を超えるとAPIエラーが発生

### **主なクォータコスト**
| 操作 | コスト |
|------|--------|
| `search.list` | 100ポイント |
| `videos.list` | 1ポイント |
| `channels.list` | 1ポイント |

### **推奨される実行頻度**

**オプション1: 毎日1回**
```bash
# 日本語3キーワード + 英語3キーワード = 600ポイント
python scripts\setup_and_collect.py --keywords 3
```

**オプション2: 1日2回**
```bash
# 朝と夜に実行（1,000ポイント × 2 = 2,000ポイント/日）
python scripts\setup_and_collect.py --keywords 5
```

**オプション3: 週1回まとめて**
```bash
# 大量のキーワードで実行（7,000ポイント程度）
python scripts\setup_and_collect.py --keywords 30
```

### **クォータの確認方法**

1. Google Cloud Console を開く
2. **APIとサービス** → **ダッシュボード**
3. **YouTube Data API v3** をクリック
4. 「クォータ」タブで使用状況を確認

---

## ⚠️ トラブルシューティング

### **エラー: API key not valid**

```
<HttpError 400 ... "API key not valid. Please pass a valid API key.">
```

**原因:**
- APIキーが間違っている
- YouTube Data API v3 が有効化されていない
- APIキーの制限設定が厳しすぎる

**解決方法:**
1. `.env` ファイルのAPIキーを確認（空白や改行がないか）
2. Google Cloud Consoleで YouTube Data API v3 が有効か確認
3. APIキーの制限を一時的に「なし」にしてテスト

### **エラー: Quota exceeded**

```
<HttpError 403 ... "quotaExceeded">
```

**原因:**
- 1日のクォータ上限（10,000ポイント）を超えた

**解決方法:**
1. 翌日（太平洋時間0時）まで待つ
2. キーワード数を減らす (`--keywords 2`)
3. クォータ増加をリクエスト（有料の場合あり）

### **エラー: Access denied**

```
<HttpError 403 ... "The request cannot be completed because you have exceeded your quota.">
```

**原因:**
- プロジェクトで請求先アカウントが設定されていない
- APIが有効化されていない

**解決方法:**
1. Google Cloud Console で請求先アカウントを設定
2. YouTube Data API v3 を再度有効化

---

## 🎓 ベストプラクティス

### **1. 環境ごとにAPIキーを分ける**

```bash
# 本番環境
YOUTUBE_API_KEY=AIzaSy...production

# ステージング環境
YOUTUBE_API_KEY=AIzaSy...staging

# 開発環境（個人）
YOUTUBE_API_KEY=AIzaSy...development
```

### **2. APIキーをローテーションする**

- 3ヶ月ごとに新しいキーを生成
- 古いキーは段階的に削除

### **3. クォータを監視する**

- Google Cloud Console のアラート機能を使用
- 80%到達時に通知を設定

### **4. エラーハンドリングを実装**

- クォータ超過時は翌日まで待機
- APIエラー時はリトライロジック
- ログを保存して分析

---

## 📚 参考リンク

- **YouTube Data API v3 公式ドキュメント**
  https://developers.google.com/youtube/v3

- **クォータ計算ツール**
  https://developers.google.com/youtube/v3/determine_quota_cost

- **Google Cloud Console**
  https://console.cloud.google.com/

- **APIキー管理のベストプラクティス**
  https://cloud.google.com/docs/authentication/api-keys

---

## ✅ チェックリスト

- [ ] Google Cloud Platformプロジェクト作成完了
- [ ] YouTube Data API v3 有効化完了
- [ ] APIキー作成完了
- [ ] APIキーに適切な制限を設定
- [ ] `.env` ファイルにAPIキーを設定
- [ ] `.gitignore` に `.env` が含まれているか確認
- [ ] 動作確認（`setup_and_collect.py` 実行）
- [ ] クォータ使用状況の確認方法を把握
- [ ] 本番環境用と開発環境用のキーを分けた

---

以上で、YouTube Data API v3 のセットアップは完了です！

何か問題が発生した場合は、[トラブルシューティング](#-トラブルシューティング) セクションを参照してください。

