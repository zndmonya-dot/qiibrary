"""
HTTP経由でAPIをテスト
"""
import requests
import json
import time

print("\n" + "="*60)
print("🌐 HTTP API テスト")
print("="*60 + "\n")

# 5秒待機（サーバー起動待ち）
print("⏳ サーバー起動を待機中...")
time.sleep(5)

# APIエンドポイントをテスト
url = "http://localhost:8000/api/rankings/daily?limit=3&locale=ja"

try:
    print(f"📡 リクエスト: {url}\n")
    response = requests.get(url, timeout=10)
    
    print(f"ステータスコード: {response.status_code}")
    print(f"レスポンスヘッダー: {dict(response.headers)}\n")
    
    if response.status_code == 200:
        data = response.json()
        print("✅ APIが正常に動作しています！\n")
        print(f"期間: {data.get('period', {}).get('label', 'N/A')}")
        print(f"書籍数: {len(data.get('rankings', []))}件\n")
        
        if data.get('rankings'):
            for ranking in data['rankings']:
                book = ranking['book']
                stats = ranking['stats']
                print(f"📚 {ranking['rank']}位: {book['title']}")
                print(f"   再生数: {stats['total_views']:,}")
                print(f"   動画数: {stats['total_mentions']}")
                print()
    else:
        print(f"❌ エラー: HTTP {response.status_code}")
        print(f"レスポンス: {response.text}")

except requests.exceptions.RequestException as e:
    print(f"❌ 接続エラー: {e}")
except Exception as e:
    print(f"❌ エラー: {e}")
    import traceback
    traceback.print_exc()

print("="*60)
print("✅ テスト完了")
print("="*60 + "\n")

