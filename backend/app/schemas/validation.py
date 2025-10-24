"""
入力検証用スキーマ

APIエンドポイントへの入力を厳格に検証します。
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
import re


class RankingQueryParams(BaseModel):
    """ランキング取得APIのクエリパラメータ"""
    
    tags: Optional[str] = Field(
        None,
        max_length=200,
        description="タグ（カンマ区切り）"
    )
    days: Optional[int] = Field(
        None,
        ge=1,
        le=3650,
        description="過去N日間（1-3650）"
    )
    year: Optional[int] = Field(
        None,
        ge=2010,
        le=2100,
        description="年（2010-2100）"
    )
    month: Optional[int] = Field(
        None,
        ge=1,
        le=12,
        description="月（1-12）"
    )
    limit: Optional[int] = Field(
        25,
        ge=1,
        le=100,
        description="取得件数（1-100）"
    )
    offset: Optional[int] = Field(
        0,
        ge=0,
        le=10000,
        description="オフセット（0-10000）"
    )
    search: Optional[str] = Field(
        None,
        max_length=100,
        description="検索キーワード"
    )
    
    @field_validator('tags')
    def validate_tags(cls, v):
        if v is None:
            return v
        # タグの形式を検証（英数字、日本語、ハイフン、アンダースコアのみ）
        tags = [tag.strip() for tag in v.split(',')]
        for tag in tags:
            if not re.match(r'^[\w\-ぁ-んァ-ヶー一-龠々〆〤]+$', tag):
                raise ValueError(f'不正なタグ形式: {tag}')
        return v
    
    @field_validator('search')
    def validate_search(cls, v):
        if v is None:
            return v
        # 検索キーワードから危険な文字を除外
        if re.search(r'[<>"\';\\]', v):
            raise ValueError('検索キーワードに使用できない文字が含まれています')
        return v


class ISBNParam(BaseModel):
    """ISBN検証"""
    
    isbn: str = Field(
        ...,
        min_length=10,
        max_length=13,
        description="ISBN（10桁または13桁）"
    )
    
    @field_validator('isbn')
    def validate_isbn(cls, v):
        # ISBNの形式を検証（数字のみ）
        if not re.match(r'^\d{10}(\d{3})?$', v):
            raise ValueError('ISBNは10桁または13桁の数字である必要があります')
        return v


class AdminCacheAction(BaseModel):
    """管理者キャッシュ操作"""
    
    action: str = Field(
        ...,
        pattern=r'^(clear|cleanup|stats)$',
        description="アクション（clear, cleanup, stats）"
    )


class SearchQuery(BaseModel):
    """検索クエリ"""
    
    query: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="検索クエリ"
    )
    
    @field_validator('query')
    def validate_query(cls, v):
        # 検索クエリから危険な文字を除外
        if re.search(r'[<>"\';\\]', v):
            raise ValueError('検索クエリに使用できない文字が含まれています')
        # 連続した空白を1つにまとめる
        v = re.sub(r'\s+', ' ', v).strip()
        return v


class DateRangeParams(BaseModel):
    """日付範囲パラメータ"""
    
    start_date: Optional[str] = Field(
        None,
        pattern=r'^\d{4}-\d{2}-\d{2}$',
        description="開始日（YYYY-MM-DD）"
    )
    end_date: Optional[str] = Field(
        None,
        pattern=r'^\d{4}-\d{2}-\d{2}$',
        description="終了日（YYYY-MM-DD）"
    )
    
    @field_validator('start_date', 'end_date')
    def validate_date(cls, v):
        if v is None:
            return v
        # 日付の妥当性をチェック
        from datetime import datetime
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('日付形式が不正です（YYYY-MM-DD）')
        return v

