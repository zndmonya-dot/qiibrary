"""
詳細な問題診断スクリプト
"""
import requests
import json

BACKEND_URL = "https://qiibrary.onrender.com"
FRONTEND_URL = "https://qiibrary.vercel.app"

print("="*70)
print("qiibrary 問題診断")
print("="*70)

# 1. バックエンドの基本動作確認
print("\n[診断 1/6] バックエンド基本動作...")
print("-"*70)
try:
    response = requests.get(f"{BACKEND_URL}/", timeout=10)
    print(f"ルートエンドポイント: {response.status_code}")
    print(f"レスポンス: {response.json()}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 2. ヘルスチェック
print("\n[診断 2/6] ヘルスチェック...")
print("-"*70)
try:
    response = requests.get(f"{BACKEND_URL}/health", timeout=10)
    print(f"ステータス: {response.status_code}")
    print(f"レスポンス: {response.json()}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 3. CORSプリフライト（OPTIONS）リクエスト
print("\n[診断 3/6] CORS プリフライトリクエスト...")
print("-"*70)
try:
    headers = {
        "Origin": FRONTEND_URL,
        "Access-Control-Request-Method": "GET",
        "Access-Control-Request-Headers": "content-type"
    }
    response = requests.options(
        f"{BACKEND_URL}/api/rankings/",
        headers=headers,
        timeout=10
    )
    print(f"ステータス: {response.status_code}")
    print(f"\nレスポンスヘッダー:")
    cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
    for key, value in cors_headers.items():
        print(f"  {key}: {value}")
    
    if response.status_code == 200:
        print("\n✅ CORS プリフライト成功")
    else:
        print(f"\n❌ CORS プリフライト失敗: {response.status_code}")
        print(f"レスポンス本文: {response.text[:200]}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 4. 実際のランキングAPIリクエスト（CORS付き）
print("\n[診断 4/6] ランキングAPI（CORSヘッダー付き）...")
print("-"*70)
try:
    headers = {
        "Origin": FRONTEND_URL,
        "Content-Type": "application/json"
    }
    response = requests.get(
        f"{BACKEND_URL}/api/rankings/?limit=3",
        headers=headers,
        timeout=15
    )
    print(f"ステータス: {response.status_code}")
    
    # CORSヘッダー確認
    print(f"\nCORSヘッダー:")
    cors_headers = {k: v for k, v in response.headers.items() if 'access-control' in k.lower()}
    for key, value in cors_headers.items():
        print(f"  {key}: {value}")
    
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"\n✅ データ取得成功: {len(rankings)} 件")
        if rankings:
            print(f"  1位: {rankings[0]['book']['title'][:60]}")
    else:
        print(f"\n❌ エラー: {response.status_code}")
        print(f"レスポンス: {response.text[:300]}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 5. 年リストAPI
print("\n[診断 5/6] 年リストAPI...")
print("-"*70)
try:
    headers = {"Origin": FRONTEND_URL}
    response = requests.get(
        f"{BACKEND_URL}/api/rankings/years",
        headers=headers,
        timeout=10
    )
    print(f"ステータス: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ 年リスト: {data.get('years', [])}")
    else:
        print(f"❌ エラー: {response.text[:200]}")
except Exception as e:
    print(f"❌ エラー: {e}")

# 6. パラメータ付きランキングAPI
print("\n[診断 6/6] パラメータ付きランキングAPI（days=365）...")
print("-"*70)
try:
    headers = {"Origin": FRONTEND_URL}
    response = requests.get(
        f"{BACKEND_URL}/api/rankings/?days=365",
        headers=headers,
        timeout=15
    )
    print(f"ステータス: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"✅ データ取得成功: {len(rankings)} 件")
        print(f"期間: {data.get('period', {}).get('label', 'N/A')}")
    else:
        print(f"❌ エラー: {response.status_code}")
        print(f"レスポンス: {response.text[:300]}")
except Exception as e:
    print(f"❌ エラー: {e}")

print("\n" + "="*70)
print("診断完了")
print("="*70)

print("\n📋 次に確認すべきこと:")
print("  1. ブラウザのコンソールで以下を実行:")
print("     fetch('https://qiibrary.onrender.com/api/rankings/?limit=3')")
print("       .then(r => r.json()).then(d => console.log(d))")
print("")
print("  2. ブラウザのネットワークタブで:")
print("     - リクエストヘッダーの 'Origin' を確認")
print("     - レスポンスヘッダーの 'Access-Control-Allow-Origin' を確認")
print("     - ステータスコードを確認")
print("="*70)



