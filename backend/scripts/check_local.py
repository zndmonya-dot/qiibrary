"""ローカルバックエンドの動作確認"""
import requests
import time
import sys
import io

# Windows環境のエンコーディング対策
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

print("ローカルバックエンド起動確認中...")
time.sleep(2)

try:
    response = requests.get("http://localhost:8000/health", timeout=5)
    print(f"OK バックエンド起動成功: {response.json()}")
    
    # ランキングAPI確認
    response = requests.get("http://localhost:8000/api/rankings/?limit=3", timeout=10)
    if response.status_code == 200:
        data = response.json()
        rankings = data.get('rankings', [])
        print(f"OK ランキングAPI動作: {len(rankings)} 件取得")
        if rankings:
            print(f"   1位: {rankings[0]['book']['title'][:50]}")
    else:
        print(f"WARNING ランキングAPI: {response.status_code}")
        print(f"   {response.text[:200]}")
        
except requests.exceptions.ConnectionError:
    print("ERROR バックエンドに接続できません")
    print("   起動中か確認してください")
except Exception as e:
    print(f"ERROR エラー: {e}")

print("\n次のステップ:")
print("  1. ブラウザで http://localhost:8000/docs を開いて確認")
print("  2. フロントエンドも起動する場合:")
print("     cd frontend && npm run dev")
