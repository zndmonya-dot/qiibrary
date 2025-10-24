"""
管理者API認証ミドルウェア

管理者APIエンドポイントへのアクセスを認証トークンで保護します。
"""
import os
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging

logger = logging.getLogger(__name__)

security = HTTPBearer()


def verify_admin_token(credentials: HTTPAuthorizationCredentials) -> bool:
    """
    管理者トークンを検証
    
    Args:
        credentials: HTTPベアラー認証の資格情報
        
    Returns:
        bool: トークンが有効な場合True
    """
    admin_token = os.getenv("ADMIN_TOKEN", "")
    
    if not admin_token:
        logger.error("ADMIN_TOKEN環境変数が設定されていません")
        return False
    
    # タイミング攻撃対策のため、常に同じ時間で比較
    import secrets
    return secrets.compare_digest(credentials.credentials, admin_token)


async def verify_admin_access(request: Request):
    """
    管理者APIアクセスを検証するミドルウェア関数
    
    Args:
        request: リクエストオブジェクト
        
    Raises:
        HTTPException: 認証失敗時に401エラー
    """
    # 管理者APIパスかチェック
    if not request.url.path.startswith("/api/admin"):
        return
    
    # ヘルスチェックは認証不要
    if request.url.path == "/api/admin/health":
        return
    
    # Authorizationヘッダーをチェック
    authorization = request.headers.get("Authorization")
    
    if not authorization:
        logger.warning(f"認証ヘッダーなしで管理者APIへのアクセス試行: {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="認証が必要です",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Bearer トークン形式かチェック
    if not authorization.startswith("Bearer "):
        logger.warning(f"不正な認証形式で管理者APIへのアクセス試行: {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer トークンが必要です",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # トークンを抽出
    token = authorization[7:]  # "Bearer " を除去
    
    # トークンを検証
    admin_token = os.getenv("ADMIN_TOKEN", "")
    
    if not admin_token:
        logger.error("ADMIN_TOKEN環境変数が設定されていません")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="サーバー設定エラー",
        )
    
    # タイミング攻撃対策のため、secrets.compare_digestを使用
    import secrets
    if not secrets.compare_digest(token, admin_token):
        logger.warning(f"不正なトークンで管理者APIへのアクセス試行: {request.client.host}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="無効なトークンです",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"管理者APIへの認証成功: {request.url.path}")

