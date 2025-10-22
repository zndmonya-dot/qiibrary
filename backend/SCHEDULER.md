# 📅 自動データ更新スケジューラー

## 概要

Qiibraryは**毎日深夜3時（日本時間）**に自動的にQiitaから新しい記事データを収集します。

---

## 🚀 動作仕様

### スケジュール
```
毎日 03:00 (JST) に実行
```

### 実行内容
1. **前日のQiita記事**を検索
2. IT技術書のISBNを抽出
3. 記事とのリレーションを保存
4. ランキングを自動更新

### 実行時間
- 約 **5〜10分**（記事数により変動）

---

## 🛠️ 設定方法

### ローカル開発環境

#### スケジューラーを有効化（デフォルト）
```bash
# 起動時に自動的にスケジューラーが開始されます
cd backend
python -m uvicorn app.main:app --reload
```

#### スケジューラーを無効化
```bash
# .env に追加
DISABLE_SCHEDULER=true

# または環境変数で設定
set DISABLE_SCHEDULER=true  # Windows
export DISABLE_SCHEDULER=true  # Mac/Linux

# サーバー起動
python -m uvicorn app.main:app --reload
```

---

### 本番環境（Render）

#### 環境変数設定
Renderのダッシュボードで以下を設定：

```env
QIITA_API_TOKEN=your_qiita_token_here
DATABASE_URL=postgresql://...
TIMEZONE=Asia/Tokyo
DISABLE_SCHEDULER=false  # スケジューラーを有効化（デフォルト）
```

#### デプロイ
```bash
git push origin main
```

デプロイ後、自動的にスケジューラーが起動します。

---

## 📊 ログ確認

### ローカル
起動時のログを確認：
```
🚀 アプリケーション起動中...
=" * 80
🚀 スケジューラー起動完了
⏰ 毎日 03:00 (JST) にデータ更新を実行します
=" * 80
✅ アプリケーション起動完了
```

実行時のログ：
```
=" * 80
🔄 定期データ更新開始
=" * 80
📅 収集期間: 2025-10-21 〜 2025-10-21
... （データ収集ログ）
=" * 80
✅ 定期データ更新完了
=" * 80
```

### Render
Renderダッシュボード → **Logs** タブで確認

---

## 🔧 手動実行

スケジューラーを待たずに手動でデータ更新したい場合：

### 方法1: APIエンドポイント経由（推奨）
```bash
# フロントエンドの管理画面から
https://qiibrary.com/admin/daily-tweet

# 「過去7日分のデータを更新」ボタンをクリック
```

### 方法2: スクリプト直接実行
```bash
cd backend

# 昨日のデータを収集
python -m scripts.collect_books_by_date_range --start 2025-10-21 --end 2025-10-21

# または過去1週間
python -m scripts.collect_books_by_date_range --start 2025-10-15 --end 2025-10-21
```

---

## ⚙️ カスタマイズ

### 実行時刻の変更

`backend/app/scheduler.py` を編集：

```python
# 毎日深夜3時 → 毎日午前6時に変更
scheduler.add_job(
    daily_data_update,
    trigger=CronTrigger(hour=6, minute=0, timezone=JST),  # hour=3 → hour=6
    id='daily_update',
    name='毎日のQiitaデータ更新',
    replace_existing=True
)
```

### 実行頻度の変更

```python
# 12時間ごとに実行
scheduler.add_job(
    daily_data_update,
    trigger=CronTrigger(hour='*/12', timezone=JST),
    id='daily_update',
    name='毎日のQiitaデータ更新',
    replace_existing=True
)
```

### 収集期間の変更

`backend/app/scheduler.py` の `daily_data_update()` 関数を編集：

```python
# 昨日のデータ → 過去3日分
end_date = date.today() - timedelta(days=1)
start_date = end_date - timedelta(days=2)  # 3日分
```

---

## 🐛 トラブルシューティング

### スケジューラーが起動しない
```bash
# ログを確認
⏸️  スケジューラーは無効化されています（DISABLE_SCHEDULER=true）

# 対処法: .env を確認
DISABLE_SCHEDULER=false  # または削除
```

### データが更新されない
```bash
# Qiita API トークンを確認
echo $QIITA_API_TOKEN  # Mac/Linux
echo %QIITA_API_TOKEN%  # Windows

# データベース接続を確認
curl http://localhost:8000/health
```

### エラーログが出る
```bash
# ログを確認
❌ 定期データ更新エラー: ...

# 一般的な原因:
# 1. Qiita API制限（429エラー）
# 2. データベース接続エラー
# 3. Qiita APIトークン未設定
```

---

## 📈 監視

### Renderでの監視
1. Renderダッシュボード → **Metrics** タブ
2. CPU/メモリ使用量を確認
3. ログで実行履歴を確認

### アラート設定（推奨）
- **Sentry**: エラー通知
- **Better Uptime**: ダウンタイム検知
- **Cronitor**: cron job監視

---

## 💡 ベストプラクティス

1. **本番環境では必ず有効化**
   ```env
   DISABLE_SCHEDULER=false
   ```

2. **ログを定期的に確認**
   - Renderのログ保持期間: 7日間
   - 長期保存が必要な場合は外部ログサービス使用

3. **API制限に注意**
   - Qiita API: 1000リクエスト/時間
   - 深夜3時は比較的空いている時間帯

4. **データベースバックアップ**
   - Neonの自動バックアップ機能を有効化

---

## 🔗 関連ドキュメント

- [`scripts/collect_books_by_date_range.py`](scripts/collect_books_by_date_range.py): データ収集スクリプト
- [`app/api/data_update.py`](app/api/data_update.py): 手動更新API
- [APScheduler公式ドキュメント](https://apscheduler.readthedocs.io/)

---

Happy Auto-Updating! 🎉

