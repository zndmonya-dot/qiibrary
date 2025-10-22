"""
デイリートップ書籍情報取得API
X（Twitter）投稿用の情報を提供
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..database import get_db
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/daily-top")
def get_daily_top(db: Session = Depends(get_db)):
    """
    24時間ランキングの1位を取得し、ツイート用の情報を返す
    """
    try:
        # 24時間前からのデータを取得
        date_condition = "AND bqm.mentioned_at >= NOW() - INTERVAL '1 day'"
        
        # 1位のみ取得
        sql = text(f"""
            WITH book_stats AS (
                SELECT
                    b.id, b.isbn, b.title, b.author, b.publisher,
                    b.thumbnail_url, b.amazon_affiliate_url,
                    COUNT(DISTINCT bqm.id) as mention_count,
                    COUNT(DISTINCT qa.id) as article_count,
                    COUNT(DISTINCT qa.author_id) as unique_user_count,
                    COALESCE(SUM(qa.likes_count), 0) as total_likes,
                    MAX(bqm.mentioned_at) as latest_mention_at
                FROM books b
                JOIN book_qiita_mentions bqm ON b.id = bqm.book_id
                JOIN qiita_articles qa ON bqm.article_id = qa.id
                WHERE b.total_mentions > 0
                {date_condition}
                GROUP BY b.id, b.isbn, b.title, b.author, b.publisher,
                         b.thumbnail_url, b.amazon_affiliate_url
            )
            SELECT
                *,
                unique_user_count * (1 + LN(CASE WHEN article_count > 0 THEN (total_likes::float / article_count) + 1 ELSE 1 END)) as calculated_score
            FROM book_stats
            ORDER BY calculated_score DESC
            LIMIT 1
        """)
        
        result = db.execute(sql)
        row = result.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail="24時間以内のランキングデータがありません")
        
        # データを辞書に変換
        book_data = {
            "id": row.id,
            "isbn": row.isbn,
            "title": row.title,
            "author": row.author,
            "publisher": row.publisher,
            "thumbnail_url": row.thumbnail_url,
            "amazon_affiliate_url": row.amazon_affiliate_url,
            "article_count": row.article_count,
            "unique_user_count": row.unique_user_count,
            "total_likes": row.total_likes,
            "mention_count": row.mention_count,
        }
        
        # ツイート文を生成
        tweet_text = generate_tweet_text(book_data)
        
        return {
            "book": book_data,
            "tweet": tweet_text,
            "generated_at": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching daily top: {str(e)}")
        raise HTTPException(status_code=500, detail="デイリートップの取得に失敗しました")


def generate_tweet_text(book_data: dict) -> str:
    """
    ツイート文を生成
    """
    title = book_data["title"]
    author = book_data["author"]
    article_count = book_data["article_count"]
    total_likes = book_data["total_likes"]
    
    # いいね数をK表記に変換
    likes_display = format_number(total_likes)
    
    # ASINを取得（ISBNからハイフンを削除したもの、またはISBNそのもの）
    asin = book_data.get("isbn", "").replace("-", "") if book_data.get("isbn") else ""
    
    # URL生成
    book_url = f"https://qiibrary.com/books/{asin}" if asin else "https://qiibrary.com"
    
    # ツイート文生成（280文字制限を考慮）
    tweet = f"""📚 本日の24時間ランキング1位 📚

『{title}』

👥 {article_count}件のQiita記事で紹介
❤️ 総いいね数: {likes_display}

詳しくはこちら👇
{book_url}

#プログラミング #技術書 #Qiita #エンジニア"""
    
    return tweet


def format_number(num: int) -> str:
    """
    数値を見やすい形式に変換（1000 -> 1.0K）
    """
    if num >= 1000000:
        return f"{num / 1000000:.1f}M"
    elif num >= 1000:
        return f"{num / 1000:.1f}K"
    else:
        return str(num)

