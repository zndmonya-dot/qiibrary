"""
セキュリティ監査スクリプト

依存関係の脆弱性チェックとログの機密情報確認を実行します。
"""
import subprocess
import sys
import re
from pathlib import Path

def check_vulnerabilities():
    """依存関係の脆弱性をチェック"""
    print("=" * 60)
    print("依存関係の脆弱性チェック")
    print("=" * 60)
    
    try:
        # pip-auditがインストールされているか確認
        result = subprocess.run(
            [sys.executable, "-m", "pip", "show", "pip-audit"],
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            print("pip-auditをインストール中...")
            subprocess.run(
                [sys.executable, "-m", "pip", "install", "pip-audit", "--quiet"],
                check=True
            )
        
        # 脆弱性スキャン実行
        print("\n脆弱性スキャン実行中...")
        result = subprocess.run(
            [sys.executable, "-m", "pip_audit"],
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print("✅ 脆弱性は検出されませんでした")
        else:
            print("⚠️ 脆弱性が検出されました:")
            print(result.stdout)
            
    except Exception as e:
        print(f"❌ エラー: {e}")
        print("\n手動でチェックしてください:")
        print("  pip install pip-audit")
        print("  pip-audit")


def check_sensitive_info_in_logs():
    """ログファイルから機密情報を検索"""
    print("\n" + "=" * 60)
    print("ログファイルの機密情報チェック")
    print("=" * 60)
    
    # 機密情報のパターン
    patterns = {
        "パスワード": re.compile(r'password["\s]*[:=]["\s]*([^\s"]+)', re.IGNORECASE),
        "APIキー": re.compile(r'api[_-]?key["\s]*[:=]["\s]*([^\s"]+)', re.IGNORECASE),
        "トークン": re.compile(r'token["\s]*[:=]["\s]*([^\s"]+)', re.IGNORECASE),
        "シークレット": re.compile(r'secret["\s]*[:=]["\s]*([^\s"]+)', re.IGNORECASE),
        "データベースURL": re.compile(r'postgresql://[^:]+:[^@]+@', re.IGNORECASE),
    }
    
    # チェック対象のディレクトリ
    backend_dir = Path(__file__).parent.parent
    
    # ログファイルを検索
    log_files = []
    if (backend_dir / "logs").exists():
        log_files.extend((backend_dir / "logs").glob("*.log"))
    
    # *.logファイルも検索
    log_files.extend(backend_dir.glob("*.log"))
    
    if not log_files:
        print("✅ ログファイルが見つかりませんでした")
        return
    
    found_sensitive = False
    
    for log_file in log_files:
        try:
            with open(log_file, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                
            for name, pattern in patterns.items():
                matches = pattern.findall(content)
                if matches:
                    if not found_sensitive:
                        print("\n⚠️ 機密情報が検出されました:")
                        found_sensitive = True
                    print(f"\n  ファイル: {log_file.name}")
                    print(f"  種類: {name}")
                    print(f"  検出数: {len(matches)}")
                    
        except Exception as e:
            print(f"❌ {log_file.name} の読み込みエラー: {e}")
    
    if not found_sensitive:
        print("✅ 機密情報は検出されませんでした")


def check_env_files():
    """環境ファイルの.gitignore登録を確認"""
    print("\n" + "=" * 60)
    print("環境ファイルの保護確認")
    print("=" * 60)
    
    backend_dir = Path(__file__).parent.parent
    gitignore_path = backend_dir.parent / ".gitignore"
    
    if not gitignore_path.exists():
        print("⚠️ .gitignoreファイルが見つかりません")
        return
    
    with open(gitignore_path, 'r', encoding='utf-8') as f:
        gitignore_content = f.read()
    
    required_entries = ['.env', '.env.local', '.env.production']
    missing = []
    
    for entry in required_entries:
        if entry not in gitignore_content:
            missing.append(entry)
    
    if missing:
        print(f"⚠️ .gitignoreに以下を追加してください:")
        for entry in missing:
            print(f"  - {entry}")
    else:
        print("✅ 環境ファイルは適切に保護されています")


def check_hardcoded_secrets():
    """ハードコードされたシークレットをチェック"""
    print("\n" + "=" * 60)
    print("ハードコードされたシークレットのチェック")
    print("=" * 60)
    
    backend_dir = Path(__file__).parent.parent
    
    # Pythonファイルを検索
    py_files = [
        f for f in backend_dir.rglob("*.py")
        if "venv" not in str(f) and "__pycache__" not in str(f)
    ]
    
    patterns = {
        "パスワード": re.compile(r'password\s*=\s*["\'](?!.*\$|.*os\.getenv|.*YOUR_|.*your_)[^"\']{8,}["\']', re.IGNORECASE),
        "APIキー": re.compile(r'api[_-]?key\s*=\s*["\'](?!.*\$|.*os\.getenv|.*YOUR_|.*your_)[^"\']{16,}["\']', re.IGNORECASE),
    }
    
    found_secrets = False
    
    for py_file in py_files:
        try:
            with open(py_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            for name, pattern in patterns.items():
                if pattern.search(content):
                    if not found_secrets:
                        print("\n⚠️ ハードコードされたシークレットが検出されました:")
                        found_secrets = True
                    print(f"\n  ファイル: {py_file.relative_to(backend_dir)}")
                    print(f"  種類: {name}")
                    
        except Exception as e:
            pass
    
    if not found_secrets:
        print("✅ ハードコードされたシークレットは検出されませんでした")


if __name__ == "__main__":
    print("🔒 Qiibrary セキュリティ監査")
    print("=" * 60)
    
    check_vulnerabilities()
    check_sensitive_info_in_logs()
    check_env_files()
    check_hardcoded_secrets()
    
    print("\n" + "=" * 60)
    print("監査完了")
    print("=" * 60)

