"""
セキュリティヘッダーミドルウェア

アプリケーションのセキュリティを強化するための各種HTTPヘッダーを追加します。
- HSTS (HTTP Strict Transport Security)
- CSP (Content Security Policy)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- Permissions-Policy
"""
import os
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
from starlette.types import ASGIApp
import logging

logger = logging.getLogger(__name__)


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """セキュリティヘッダーを追加するミドルウェア"""
    
    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.environment = os.getenv("ENVIRONMENT", "development")
        self.is_production = self.environment == "production"
        
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        
        # HSTS (HTTP Strict Transport Security)
        # 本番環境のみ有効化（HTTPS必須）
        if self.is_production:
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        
        # CSP (Content Security Policy)
        # APIサーバーなので厳格に設定
        response.headers["Content-Security-Policy"] = (
            "default-src 'none'; "
            "frame-ancestors 'none'; "
            "base-uri 'none'"
        )
        
        # X-Frame-Options - クリックジャッキング対策
        response.headers["X-Frame-Options"] = "DENY"
        
        # X-Content-Type-Options - MIMEタイプスニッフィング対策
        response.headers["X-Content-Type-Options"] = "nosniff"
        
        # Referrer-Policy - リファラー情報の制御
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        # Permissions-Policy - ブラウザ機能のアクセス制御
        response.headers["Permissions-Policy"] = (
            "geolocation=(), "
            "microphone=(), "
            "camera=(), "
            "payment=(), "
            "usb=(), "
            "magnetometer=(), "
            "gyroscope=(), "
            "accelerometer=()"
        )
        
        # X-XSS-Protection (古いブラウザ向け)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        # Cache-Control - 機密データのキャッシュ防止
        if request.url.path.startswith("/api/admin"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, private"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        
        return response

