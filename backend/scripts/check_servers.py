"""
サーバー起動確認スクリプト
"""
import requests
import time

print("\n" + "="*60)
print("🔍 サーバー起動確認")
print("="*60 + "\n")

print("⏳ 起動を待機中...")
time.sleep(10)

# バックエンド確認
print("\n=== バックエンド確認 (http://localhost:8000) ===")
try:
    response = requests.get('http://localhost:8000/health', timeout=5)
    if response.status_code == 200:
        print("✅ バックエンド: 正常動作中")
        print(f"   Status: {response.json().get('status')}")
    else:
        print(f"❌ バックエンド: HTTP {response.status_code}")
except Exception as e:
    print(f"❌ バックエンド: 接続失敗 - {e}")

# フロントエンド確認
print("\n=== フロントエンド確認 ===")
for port in [3000, 3001, 3002]:
    try:
        response = requests.get(f'http://localhost:{port}', timeout=2)
        print(f"✅ フロントエンド: http://localhost:{port} で動作中")
        break
    except:
        pass
else:
    print("❌ フロントエンド: 起動していません")

# API データ確認
print("\n=== API データ確認 ===")
try:
    response = requests.get('http://localhost:8000/api/rankings/daily?limit=3&locale=ja', timeout=5)
    if response.status_code == 200:
        data = response.json()
        count = len(data.get('rankings', []))
        print(f"✅ ランキングAPI: {count}件の書籍データ取得成功")
        if count > 0:
            print(f"   1位: {data['rankings'][0]['book']['title']}")
            print(f"   2位: {data['rankings'][1]['book']['title']}")
            print(f"   3位: {data['rankings'][2]['book']['title']}")
    else:
        print(f"❌ ランキングAPI: HTTP {response.status_code}")
except Exception as e:
    print(f"❌ ランキングAPI: エラー - {e}")

print("\n" + "="*60)
print("✅ 確認完了")
print("="*60 + "\n")

