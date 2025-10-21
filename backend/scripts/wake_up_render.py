"""
Renderを起動させて動作確認
"""
import requests
import time

BACKEND_URL = "https://qiibrary.onrender.com"

print("="*60)
print("Render API 起動確認")
print("="*60)

# 1. ヘルスチェック
print("\n[1/4] APIを起動中...")
print("（初回は30秒〜1分かかります）\n")

try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=60)
    if response.status_code == 200:
        print(f"✅ API起動: {response.json()}")
    else:
        print(f"⚠️ ステータス: {response.status_code}")
except requests.exceptions.Timeout:
    print("❌ タイムアウト（60秒以上かかっています）")
except Exception as e:
    print(f"❌ エラー: {e}")

# 2. ランキングAPI
print("\n[2/4] ランキングAPI確認...")
time.sleep(2)

try:
    response = requests.get(f"{BACKEND_URL}/api/rankings/?limit=5", timeout=30)
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"✅ データ取得成功: {len(rankings)} 件")
        if rankings:
            print(f"   1位: {rankings[0]['book']['title']}")
    else:
        print(f"⚠️ ステータス: {response.status_code}")
        print(f"   レスポンス: {response.text[:200]}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 3. 年リストAPI
print("\n[3/4] 年リストAPI確認...")
try:
    response = requests.get(f"{BACKEND_URL}/api/rankings/years", timeout=30)
    if response.status_code == 200:
        data = response.json()
        years = data.get('years', [])
        print(f"✅ 年リスト取得: {years[:5]}")
    else:
        print(f"⚠️ ステータス: {response.status_code}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 4. CORS確認
print("\n[4/4] CORS設定確認...")
try:
    response = requests.options(
        f"{BACKEND_URL}/api/rankings/",
        headers={
            "Origin": "https://qiibrary.vercel.app",
            "Access-Control-Request-Method": "GET"
        },
        timeout=10
    )
    cors_header = response.headers.get('Access-Control-Allow-Origin', 'なし')
    print(f"   Access-Control-Allow-Origin: {cors_header}")
    
    if cors_header == "https://qiibrary.vercel.app" or cors_header == "*":
        print("   ✅ CORS設定OK")
    else:
        print("   ⚠️ CORS設定が不足している可能性")
except Exception as e:
    print(f"   ❌ エラー: {e}")

print("\n" + "="*60)
print("確認完了")
print("="*60)
print("\n💡 次のステップ:")
print("  1. APIが起動したら、Vercelページを再読み込み")
print("  2. エラーが続く場合は環境変数を確認")
print("="*60)



