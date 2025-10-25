"""
スケジューラーの設定を確認するスクリプト
"""
import sys
from pathlib import Path

# backend ディレクトリをパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import os
from app.config.settings import settings

print("=" * 80)
print("🔍 スケジューラー設定確認")
print("=" * 80)

# 環境変数確認
print("\n📋 環境変数:")
print(f"  DISABLE_SCHEDULER: {os.getenv('DISABLE_SCHEDULER', 'not set (デフォルト: 有効)')}")
print(f"  QIITA_API_TOKEN: {'✅ 設定済み' if settings.QIITA_API_TOKEN else '❌ 未設定'}")
print(f"  DATABASE_URL: {'✅ 設定済み' if settings.DATABASE_URL else '❌ 未設定'}")
print(f"  TIMEZONE: {settings.TIMEZONE}")

# スケジューラー有効化状態
disable_scheduler = os.getenv("DISABLE_SCHEDULER", "false").lower() == "true"
scheduler_status = "❌ 無効" if disable_scheduler else "✅ 有効"
print(f"\n🚀 スケジューラー状態: {scheduler_status}")

if not disable_scheduler:
    print("\n⏰ スケジュール:")
    print("  • 毎日 00:00 (JST) - データ更新")
    print("  • 毎日 08:00 (JST) - ツイート文生成")
    
    print("\n📝 動作条件:")
    conditions = []
    
    if settings.QIITA_API_TOKEN:
        conditions.append("✅ Qiita APIトークン: 設定済み")
    else:
        conditions.append("❌ Qiita APIトークン: 未設定")
    
    if settings.DATABASE_URL:
        conditions.append("✅ データベースURL: 設定済み")
    else:
        conditions.append("❌ データベースURL: 未設定")
    
    for condition in conditions:
        print(f"  {condition}")
    
    # 総合判定
    all_ok = settings.QIITA_API_TOKEN and settings.DATABASE_URL
    
    print("\n" + "=" * 80)
    if all_ok:
        print("✅ スケジューラーは正常に動作可能です！")
        print("サーバーを起動すると、自動データ更新が開始されます。")
    else:
        print("⚠️  一部の設定が不足しています。")
        print(".env ファイルを確認してください。")
    print("=" * 80)
else:
    print("\n⚠️  スケジューラーは無効化されています")
    print("有効化するには、.env から DISABLE_SCHEDULER=true を削除してください")
    print("=" * 80)

