"""
Render Starterプラン動作確認
"""
import requests
import time

BACKEND_URL = "https://qiibrary.onrender.com"

print("="*60)
print("Render Starter プラン動作確認")
print("="*60)

# 1. ヘルスチェック
print("\n[1/3] ヘルスチェック...")
start = time.time()
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    elapsed = time.time() - start
    if response.status_code == 200:
        print(f"✅ API起動: {response.json()}")
        print(f"   レスポンス時間: {elapsed:.2f}秒")
    else:
        print(f"⚠️ ステータス: {response.status_code}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 2. ランキングAPI（データ取得）
print("\n[2/3] ランキングAPI（データベースアクセス）...")
start = time.time()
try:
    response = requests.get(f"{BACKEND_URL}/api/rankings/?limit=5", timeout=15)
    elapsed = time.time() - start
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"✅ データ取得成功: {len(rankings)} 件")
        print(f"   レスポンス時間: {elapsed:.2f}秒")
        if rankings:
            print(f"   1位: {rankings[0]['book']['title'][:50]}")
            print(f"   言及数: {rankings[0]['stats']['mention_count']}回")
    else:
        print(f"❌ ステータス: {response.status_code}")
        print(f"   レスポンス: {response.text[:200]}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 3. 年リストAPI
print("\n[3/3] 年リストAPI...")
start = time.time()
try:
    response = requests.get(f"{BACKEND_URL}/api/rankings/years", timeout=10)
    elapsed = time.time() - start
    if response.status_code == 200:
        data = response.json()
        years = data.get('years', [])
        print(f"✅ 年リスト取得: {len(years)} 年分")
        print(f"   レスポンス時間: {elapsed:.2f}秒")
        print(f"   データ範囲: {years[0]} 〜 {years[-1]}")
    else:
        print(f"❌ ステータス: {response.status_code}")
except Exception as e:
    print(f"❌ エラー: {e}")

print("\n" + "="*60)
print("確認完了")
print("="*60)
print("\n💡 次のステップ:")
print("  1. フロントエンドでデータが表示されるか確認")
print("     → https://qiibrary.vercel.app")
print("  2. レスポンス時間が遅い場合はリージョン変更を検討")
print("     → US East (Ohio) 推奨")
print("="*60)



