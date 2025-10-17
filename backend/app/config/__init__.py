"""
Configuration package
"""

from .settings import Settings, settings
from .search_keywords import (
    JAPANESE_KEYWORDS,
    ENGLISH_KEYWORDS,
    HIGH_PRIORITY_KEYWORDS_JA,
    HIGH_PRIORITY_KEYWORDS_EN,
    KEYWORD_ROTATION_JA,
    KEYWORD_ROTATION_EN,
    EXCLUDE_KEYWORDS,
    SEARCH_CONFIG,
    get_all_keywords,
    get_high_priority_keywords,
    get_keywords_by_category,
    should_exclude_video,
)

__all__ = [
    'Settings',
    'settings',
    'JAPANESE_KEYWORDS',
    'ENGLISH_KEYWORDS',
    'HIGH_PRIORITY_KEYWORDS_JA',
    'HIGH_PRIORITY_KEYWORDS_EN',
    'KEYWORD_ROTATION_JA',
    'KEYWORD_ROTATION_EN',
    'EXCLUDE_KEYWORDS',
    'SEARCH_CONFIG',
    'get_all_keywords',
    'get_high_priority_keywords',
    'get_keywords_by_category',
    'should_exclude_video',
]

