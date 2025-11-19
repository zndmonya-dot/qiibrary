"""
Sentryエラー監視設定

アプリケーションのエラーをリアルタイムで監視・通知します。
"""
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os
import logging

logger = logging.getLogger(__name__)


def init_sentry():
    """
    Sentryを初期化
    
    環境変数SENTRY_DSNが設定されている場合のみSentryを有効化します。
    本番環境での使用を推奨します。
    """
    sentry_dsn = os.getenv("SENTRY_DSN", "")
    environment = os.getenv("ENVIRONMENT", "development")
    
    if not sentry_dsn:
        logger.info("Sentryは無効です（SENTRY_DSN未設定）")
        return
    
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            # 環境名
            environment=environment,
            
            # サンプリングレート（本番環境では調整推奨）
            traces_sample_rate=1.0 if environment == "development" else 0.1,
            
            # プロファイリング（パフォーマンス監視）
            profiles_sample_rate=1.0 if environment == "development" else 0.1,
            
            # 統合機能
            integrations=[
                FastApiIntegration(
                    transaction_style="url",  # URLパスでトランザクションをグループ化
                ),
                SqlalchemyIntegration(),  # SQLクエリのエラーも追跡
            ],
            
            # リリースバージョン（オプション）
            release=os.getenv("GIT_COMMIT_SHA", "unknown"),
            
            # エラーレベルのフィルタリング
            before_send=before_send_filter,
        )
        
        logger.info(f"✅ Sentry初期化完了（環境: {environment}）")
        
    except Exception as e:
        logger.error(f"❌ Sentry初期化エラー: {e}")


def before_send_filter(event, hint):
    """
    Sentryに送信する前にイベントをフィルタリング
    
    特定のエラーを除外したり、機密情報を削除したりします。
    """
    # 404エラーは送信しない（ノイズ削減）
    if event.get("exception"):
        for exception in event["exception"].get("values", []):
            if "404" in str(exception.get("type", "")):
                return None
    
    # ヘルスチェックエンドポイントのエラーは送信しない
    if event.get("request"):
        url = event["request"].get("url", "")
        if "/health" in url or "/docs" in url:
            return None
    
    # 機密情報の除外（念のため）
    if event.get("request"):
        headers = event["request"].get("headers", {})
        # Authorizationヘッダーを削除
        if "Authorization" in headers:
            headers["Authorization"] = "[Filtered]"
    
    return event


def capture_exception_with_context(exception: Exception, context: dict = None):
    """
    コンテキスト情報付きで例外をキャプチャ
    
    Args:
        exception: キャプチャする例外
        context: 追加のコンテキスト情報（ユーザーID、リクエスト情報など）
    """
    if context:
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_context(key, value)
            sentry_sdk.capture_exception(exception)
    else:
        sentry_sdk.capture_exception(exception)

