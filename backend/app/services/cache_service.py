"""
キャッシングサービス
NEONのデータ転送量を削減するため、頻繁にアクセスされるデータをメモリにキャッシュ
"""

import logging
import hashlib
import json
from typing import Any, Optional, Callable
from datetime import datetime, timedelta
from functools import wraps
import threading

logger = logging.getLogger(__name__)


class CacheEntry:
    """キャッシュエントリー"""
    
    def __init__(self, value: Any, expires_at: datetime):
        self.value = value
        self.expires_at = expires_at
        self.created_at = datetime.now()
        self.hit_count = 0
    
    def is_expired(self) -> bool:
        """有効期限切れかチェック"""
        return datetime.now() > self.expires_at
    
    def increment_hit(self):
        """ヒットカウントをインクリメント"""
        self.hit_count += 1


class CacheService:
    """
    メモリベースのキャッシングサービス
    
    Features:
    - TTL（有効期限）サポート
    - スレッドセーフ
    - 自動クリーンアップ
    - キャッシュヒット率の統計
    """
    
    def __init__(self):
        self._cache: dict[str, CacheEntry] = {}
        self._lock = threading.RLock()
        self._hits = 0
        self._misses = 0
        logger.info("🚀 CacheService initialized")
    
    def _generate_key(self, prefix: str, **kwargs) -> str:
        """
        キャッシュキーを生成
        
        Args:
            prefix: キーのプレフィックス
            **kwargs: キーに含めるパラメータ
        
        Returns:
            ハッシュ化されたキー
        """
        # ソートして一貫性を保つ
        params = json.dumps(kwargs, sort_keys=True, default=str)
        hash_value = hashlib.md5(params.encode()).hexdigest()[:16]
        return f"{prefix}:{hash_value}"
    
    def get(self, key: str) -> Optional[Any]:
        """
        キャッシュからデータを取得
        
        Args:
            key: キャッシュキー
        
        Returns:
            キャッシュされたデータ、または None
        """
        with self._lock:
            entry = self._cache.get(key)
            
            if entry is None:
                self._misses += 1
                return None
            
            if entry.is_expired():
                del self._cache[key]
                self._misses += 1
                logger.debug(f"Cache expired: {key}")
                return None
            
            entry.increment_hit()
            self._hits += 1
            logger.debug(f"Cache hit: {key} (hits: {entry.hit_count})")
            return entry.value
    
    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        """
        データをキャッシュに保存
        
        Args:
            key: キャッシュキー
            value: 保存するデータ
            ttl_seconds: 有効期限（秒）
        """
        with self._lock:
            expires_at = datetime.now() + timedelta(seconds=ttl_seconds)
            self._cache[key] = CacheEntry(value, expires_at)
            logger.debug(f"Cache set: {key} (TTL: {ttl_seconds}s)")
    
    def delete(self, key: str):
        """
        キャッシュからデータを削除
        
        Args:
            key: キャッシュキー
        """
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                logger.debug(f"Cache deleted: {key}")
    
    def clear(self):
        """すべてのキャッシュをクリア"""
        with self._lock:
            count = len(self._cache)
            self._cache.clear()
            logger.info(f"Cache cleared: {count} entries removed")
    
    def cleanup_expired(self):
        """期限切れのキャッシュをクリーンアップ"""
        with self._lock:
            expired_keys = [
                key for key, entry in self._cache.items()
                if entry.is_expired()
            ]
            
            for key in expired_keys:
                del self._cache[key]
            
            if expired_keys:
                logger.info(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def get_stats(self) -> dict:
        """
        キャッシュの統計情報を取得
        
        Returns:
            統計情報の辞書
        """
        with self._lock:
            total = self._hits + self._misses
            hit_rate = (self._hits / total * 100) if total > 0 else 0
            
            return {
                "entries": len(self._cache),
                "hits": self._hits,
                "misses": self._misses,
                "total_requests": total,
                "hit_rate_percent": round(hit_rate, 2),
            }
    
    def get_or_set(
        self,
        key: str,
        factory: Callable[[], Any],
        ttl_seconds: int = 300
    ) -> Any:
        """
        キャッシュから取得、なければfactoryで生成してキャッシュ
        
        Args:
            key: キャッシュキー
            factory: データ生成関数
            ttl_seconds: 有効期限（秒）
        
        Returns:
            キャッシュまたは生成されたデータ
        """
        value = self.get(key)
        if value is not None:
            return value
        
        # キャッシュミス：データを生成
        value = factory()
        self.set(key, value, ttl_seconds)
        return value


# グローバルキャッシュインスタンス
_cache_service: Optional[CacheService] = None


def get_cache_service() -> CacheService:
    """キャッシュサービスのシングルトンインスタンスを取得"""
    global _cache_service
    if _cache_service is None:
        _cache_service = CacheService()
    return _cache_service


def cached(
    prefix: str,
    ttl_seconds: int = 300,
    key_params: Optional[list[str]] = None
):
    """
    関数の戻り値をキャッシュするデコレータ
    
    Args:
        prefix: キャッシュキーのプレフィックス
        ttl_seconds: 有効期限（秒）
        key_params: キャッシュキーに含める引数名のリスト
    
    Example:
        @cached(prefix="rankings", ttl_seconds=600, key_params=["tags", "days"])
        def get_rankings(tags=None, days=None):
            return expensive_query()
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs):
            cache = get_cache_service()
            
            # キャッシュキーを生成
            if key_params:
                cache_params = {k: kwargs.get(k) for k in key_params if k in kwargs}
            else:
                cache_params = kwargs
            
            cache_key = cache._generate_key(prefix, **cache_params)
            
            # キャッシュから取得
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                return cached_value
            
            # キャッシュミス：関数を実行
            result = func(*args, **kwargs)
            cache.set(cache_key, result, ttl_seconds)
            return result
        
        return wrapper
    return decorator

