"""
CORS設定が正しくデプロイされたか確認
"""
import requests

BACKEND_URL = "https://qiibrary.onrender.com"
FRONTEND_URL = "https://qiibrary.vercel.app"

print("="*60)
print("CORS設定確認")
print("="*60)

print(f"\nバックエンド: {BACKEND_URL}")
print(f"フロントエンド: {FRONTEND_URL}\n")

# プリフライトリクエスト（CORS確認）
print("[1/2] プリフライトリクエスト...")
try:
    response = requests.options(
        f"{BACKEND_URL}/api/rankings/",
        headers={
            "Origin": FRONTEND_URL,
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "Content-Type"
        },
        timeout=10
    )
    
    print(f"ステータス: {response.status_code}")
    
    # CORS関連のヘッダーを確認
    cors_origin = response.headers.get('Access-Control-Allow-Origin', 'なし')
    cors_methods = response.headers.get('Access-Control-Allow-Methods', 'なし')
    cors_headers = response.headers.get('Access-Control-Allow-Headers', 'なし')
    
    print(f"\nCORS ヘッダー:")
    print(f"  Allow-Origin: {cors_origin}")
    print(f"  Allow-Methods: {cors_methods}")
    print(f"  Allow-Headers: {cors_headers}")
    
    if cors_origin == FRONTEND_URL or cors_origin == "*":
        print("\n✅ CORS設定OK！")
    else:
        print(f"\n⚠️ CORS設定が不足")
        print(f"   期待値: {FRONTEND_URL}")
        print(f"   実際値: {cors_origin}")
        
except Exception as e:
    print(f"❌ エラー: {e}")

# 実際のAPIリクエスト
print("\n[2/2] 実際のAPIリクエスト...")
try:
    response = requests.get(
        f"{BACKEND_URL}/api/rankings/?limit=3",
        headers={"Origin": FRONTEND_URL},
        timeout=15
    )
    
    print(f"ステータス: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"✅ データ取得: {len(rankings)} 件")
        
        cors_origin = response.headers.get('Access-Control-Allow-Origin', 'なし')
        print(f"   CORS Origin: {cors_origin}")
        
        if rankings:
            print(f"   1位: {rankings[0]['book']['title'][:50]}")
    else:
        print(f"❌ エラーレスポンス: {response.text[:200]}")
        
except Exception as e:
    print(f"❌ エラー: {e}")

print("\n" + "="*60)
print("確認完了")
print("="*60)
print("\n💡 次のステップ:")
print("  1. CORSがOKなら、ブラウザでページを再読み込み")
print("     → https://qiibrary.vercel.app")
print("  2. まだエラーが出る場合はブラウザのキャッシュをクリア")
print("="*60)



