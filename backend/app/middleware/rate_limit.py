"""
レート制限ミドルウェア
IPアドレスごとのリクエスト数を制限してボット攻撃や過度なアクセスを防ぐ
"""

import time
import logging
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Tuple

logger = logging.getLogger(__name__)


class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    レート制限ミドルウェア
    
    制限:
    - 1分間に30リクエスト
    - 1時間に300リクエスト
    """
    
    def __init__(self, app):
        super().__init__(app)
        # IP別のリクエスト履歴 {ip: [(timestamp, count), ...]}
        self.requests: Dict[str, list[Tuple[float, int]]] = defaultdict(list)
        self.minute_limit = 30  # 1分間の制限
        self.hour_limit = 300   # 1時間の制限
    
    def _get_client_ip(self, request: Request) -> str:
        """クライアントIPアドレスを取得"""
        # X-Forwarded-Forヘッダーを優先（プロキシ経由の場合）
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        
        # X-Real-IPヘッダー（Nginx経由の場合）
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # 直接接続の場合
        if request.client:
            return request.client.host
        
        return "unknown"
    
    def _cleanup_old_requests(self, ip: str, current_time: float):
        """1時間以上古いリクエスト履歴を削除"""
        if ip in self.requests:
            self.requests[ip] = [
                (ts, count) for ts, count in self.requests[ip]
                if current_time - ts < 3600  # 1時間以内のみ保持
            ]
    
    def _check_rate_limit(self, ip: str, current_time: float) -> Tuple[bool, str]:
        """
        レート制限をチェック
        
        Returns:
            (制限内か, エラーメッセージ)
        """
        # 古いエントリをクリーンアップ
        self._cleanup_old_requests(ip, current_time)
        
        # 1分間のリクエスト数をカウント
        minute_ago = current_time - 60
        minute_requests = sum(
            count for ts, count in self.requests[ip]
            if ts > minute_ago
        )
        
        if minute_requests >= self.minute_limit:
            return False, f"1分間のリクエスト制限（{self.minute_limit}回）を超過しました。しばらく待ってから再試行してください。"
        
        # 1時間のリクエスト数をカウント
        hour_ago = current_time - 3600
        hour_requests = sum(
            count for ts, count in self.requests[ip]
            if ts > hour_ago
        )
        
        if hour_requests >= self.hour_limit:
            return False, f"1時間のリクエスト制限（{self.hour_limit}回）を超過しました。しばらく待ってから再試行してください。"
        
        return True, ""
    
    async def dispatch(self, request: Request, call_next):
        # 特定のパスは制限から除外（health check など）
        excluded_paths = ["/health", "/docs", "/openapi.json", "/redoc"]
        if request.url.path in excluded_paths:
            return await call_next(request)
        
        # クライアントIPを取得
        client_ip = self._get_client_ip(request)
        current_time = time.time()
        
        # レート制限チェック
        is_allowed, error_message = self._check_rate_limit(client_ip, current_time)
        
        if not is_allowed:
            logger.warning(f"⚠️ レート制限: {client_ip} - {request.url.path}")
            raise HTTPException(
                status_code=429,
                detail=error_message
            )
        
        # リクエストを記録
        self.requests[client_ip].append((current_time, 1))
        
        # リクエストを処理
        response = await call_next(request)
        
        return response

