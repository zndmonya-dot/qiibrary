"""
Renderでスケジューラーが動作しているか確認するスクリプト
RenderのAPIまたはヘルスチェックエンドポイントを使用
"""
import requests
import sys

# RenderのバックエンドURL（環境に合わせて変更）
BACKEND_URL = "https://your-backend.onrender.com"  # 実際のURLに変更

def check_scheduler_status():
    """スケジューラーの状態を確認"""
    print("=" * 80)
    print("🔍 Render スケジューラー状態確認")
    print("=" * 80)
    
    try:
        # ヘルスチェック
        print(f"\n📡 接続先: {BACKEND_URL}")
        response = requests.get(f"{BACKEND_URL}/health", timeout=10)
        
        if response.status_code == 200:
            print("✅ バックエンドサーバー: 稼働中")
            print(f"   レスポンス: {response.json()}")
        else:
            print(f"⚠️  バックエンドサーバー: エラー (HTTP {response.status_code})")
            return
        
        # ルート情報
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        if response.status_code == 200:
            info = response.json()
            print(f"\n📋 API情報:")
            print(f"   バージョン: {info.get('version', 'N/A')}")
            print(f"   ドキュメント: {BACKEND_URL}{info.get('docs', '/docs')}")
        
        print("\n" + "=" * 80)
        print("✅ Renderでバックエンドが正常に稼働しています")
        print("\n💡 スケジューラーのログを確認するには:")
        print("   1. Renderダッシュボードにアクセス")
        print("   2. バックエンドサービスを選択")
        print("   3. 'Logs'タブを開く")
        print("   4. '🚀 スケジューラー起動完了'を検索")
        print("=" * 80)
        
    except requests.exceptions.ConnectionError:
        print("❌ 接続エラー: バックエンドサーバーに接続できません")
        print("   - URLが正しいか確認してください")
        print("   - Renderでサービスが起動しているか確認してください")
    except requests.exceptions.Timeout:
        print("⏱️  タイムアウト: サーバーの応答がありません")
    except Exception as e:
        print(f"❌ エラー: {e}")

if __name__ == "__main__":
    # コマンドライン引数でURLを指定可能
    if len(sys.argv) > 1:
        BACKEND_URL = sys.argv[1].rstrip('/')
    
    check_scheduler_status()

