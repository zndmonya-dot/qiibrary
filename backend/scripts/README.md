# スクリプト一覧

このディレクトリには、BookTuberプロジェクトの各種スクリプトが含まれています。

## 📌 本番環境で使用するスクリプト

### データ収集
- **`collect_books_from_qiita.py`** - Qiita記事から書籍情報を収集
  ```bash
  python scripts/collect_books_from_qiita.py
  ```

### データベース管理
- **`init_db.py`** - データベースの初期化
  ```bash
  python scripts/init_db.py
  ```
- **`reset_db.py`** - データベースのリセット（注意: すべてのデータが削除されます）
  ```bash
  python scripts/reset_db.py
  ```

### URL修正
- **`fix_book_urls.py`** - 既存の書籍データのURL修正
  ```bash
  python scripts/fix_book_urls.py
  ```

## 🧪 開発・デバッグ用スクリプト

### テスト
- **`test_api.py`** - API動作テスト
- **`test_api_http.py`** - HTTP APIテスト
- **`test_affiliate_links.py`** - アフィリエイトリンクテスト
- **`test_specific_book.py`** - 特定の書籍データテスト
- **`test_urls.py`** - URL生成テスト
- **`quick_test.py`** - クイックテスト

### データ確認
- **`check_data.py`** - データベース内のデータ確認
- **`check_db.py`** - データベース接続確認
- **`check_servers.py`** - サーバー状態確認
- **`check_encoding.py`** - エンコーディング確認

### データ分析
- **`analyze_amazon_links.py`** - Amazonリンクの分析
- **`analyze_extracted_identifiers.py`** - 抽出された識別子の分析
- **`compare_books.py`** - 書籍データの比較

## ⚠️ 非推奨・未使用

- **`setup_and_collect_zenn.py`** - Zenn対応（現在未使用）
  - 注: Qiitaに移行したため、このスクリプトは使用していません

## 📝 使用例

### 初回セットアップ
```bash
# 1. データベース初期化
python scripts/init_db.py

# 2. データ収集
python scripts/collect_books_from_qiita.py
```

### 定期実行（cron等）
```bash
# Qiitaから新規データ収集（1日1回推奨）
python scripts/collect_books_from_qiita.py
```

### トラブルシューティング
```bash
# データベース接続確認
python scripts/check_db.py

# データ確認
python scripts/check_data.py

# URL修正が必要な場合
python scripts/fix_book_urls.py
```

## 🔧 開発時の注意事項

1. **データベースのリセット**: `reset_db.py`は全データを削除するため、本番環境では絶対に使用しないでください。
2. **データ収集**: `collect_books_from_qiita.py`はAPI制限に注意して実行してください。
3. **テストスクリプト**: テストスクリプトは開発環境でのみ実行してください。

