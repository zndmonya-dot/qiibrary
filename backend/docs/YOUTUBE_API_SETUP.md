# YouTube Data API v3 セットアップ

## ✅ YouTube検索機能を実装しました！

管理画面で「YouTubeで検索」ボタンをクリックすると、YouTube上で動画を直接検索して選択できるようになりました。

## 📋 APIキーの取得方法

### 1. Google Cloud Consoleにアクセス

https://console.cloud.google.com/

### 2. プロジェクトを作成

1. 画面上部の「プロジェクトを選択」をクリック
2. 「新しいプロジェクト」をクリック
3. プロジェクト名を入力（例: `qiibrary`）
4. 「作成」をクリック

### 3. YouTube Data API v3 を有効化

1. 左メニュー「APIとサービス」→「ライブラリ」
2. 検索欄で `YouTube Data API v3` を検索
3. 「YouTube Data API v3」をクリック
4. 「有効にする」をクリック

### 4. APIキーを作成

1. 左メニュー「APIとサービス」→「認証情報」
2. 画面上部「認証情報を作成」→「APIキー」をクリック
3. APIキーが表示されるのでコピー
4. **重要**: 「キーを制限」をクリック
   - **APIの制限**: 「キーを制限」を選択
   - 「YouTube Data API v3」のみを選択
   - 「保存」をクリック

### 5. 環境変数を設定

#### ローカル開発環境

```bash
# backend/.env
YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### Render（本番環境）

1. https://dashboard.render.com/ にアクセス
2. `qiibrary-backend` サービスを選択
3. 左メニュー「Environment」をクリック
4. 「Add Environment Variable」をクリック
5. 以下を入力：
   ```
   Key: YOUTUBE_API_KEY
   Value: （取得したAPIキー）
   ```
6. 「Save Changes」をクリック

### 6. 動作確認

1. https://qiibrary.com/admin/youtube にアクセス
2. 書籍を選択
3. 「YouTubeで検索」ボタンをクリック
4. 検索が成功すればOK！

## 📊 無料枠の制限

- **1日あたり10,000クォータ**
- YouTube検索: 1回 = 100クォータ
- **1日約100回の検索が可能**

### クォータ超過した場合

エラーメッセージが表示されます：
```
YouTube APIのクォータ制限に達しました。明日再度お試しください。
```

翌日の日本時間 00:00 にリセットされます。

## 🎬 使い方

### 1. YouTube検索で動画を追加

1. 管理画面で書籍を選択
2. 「YouTubeで検索」ボタンをクリック
3. 検索キーワードを入力（初期値は書籍タイトル）
4. 検索結果から動画を選択
5. URL入力欄に自動入力される
6. 「追加」ボタンをクリック

### 2. 手動でURLを追加（従来通り）

1. YouTubeでコピーしたURLを貼り付け
2. 「追加」ボタンをクリック

## ⚠️ トラブルシューティング

### エラー: 「YouTube APIキーが設定されていません」

環境変数 `YOUTUBE_API_KEY` が設定されていません。
→ 上記の手順5を実行してください。

### エラー: 「YouTube APIのクォータ制限に達しました」

本日のクォータを使い切りました。
→ 明日（日本時間00:00以降）再度お試しください。
→ または、手動でURLを貼り付けて追加してください。

### 検索結果が0件

- 検索キーワードを変更してみてください
- 書籍タイトルの一部だけで検索してみてください
- 英語タイトルで検索してみてください

## 🔒 セキュリティ

APIキーは以下に注意してください：

1. **公開しない**: GitHubなどに公開しない
2. **制限する**: YouTube Data API v3のみに制限
3. **定期的に更新**: 3〜6ヶ月ごとに更新を推奨

## 📚 参考リンク

- [YouTube Data API v3 公式ドキュメント](https://developers.google.com/youtube/v3)
- [クォータ管理](https://console.cloud.google.com/apis/api/youtube.googleapis.com/quotas)

