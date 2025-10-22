"""
本日のツイート文を返すAPIエンドポイント
"""
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..database import SessionLocal
from ..services.ranking_service import RankingService
from ..models.book import Book, BookQiitaMention
from ..models.qiita_article import QiitaArticle

router = APIRouter()


# データベース依存性
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        try:
            db.close()
        except Exception:
            pass


def format_number(num: int) -> str:
    """数値をフォーマット（K、M単位）"""
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    if num >= 1_000:
        return f"{num / 1_000:.1f}K"
    return str(num)


@router.get("/daily-tweet")
async def get_daily_tweet(db: Session = Depends(get_db)):
    """
    24時間ランキング1位のツイート文を返す
    """
    try:
        # 24時間ランキングを取得
        ranking_service = RankingService(db)
        rankings_data = ranking_service.get_ranking_fast(days=1, limit=1)
        
        if not rankings_data or not rankings_data.rankings:
            raise HTTPException(
                status_code=404,
                detail="24時間以内のランキングデータがありません"
            )
        
        # 1位を取得
        top_item = rankings_data.rankings[0]
        book: Book = top_item.book
        
        # 累計いいね数を計算
        total_likes = db.query(
            db.func.sum(QiitaArticle.likes_count)
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        # 累計記事数を計算
        article_count = db.query(
            db.func.count(db.func.distinct(QiitaArticle.id))
        ).join(
            BookQiitaMention,
            QiitaArticle.id == BookQiitaMention.article_id
        ).filter(
            BookQiitaMention.book_id == book.id
        ).scalar() or 0
        
        # ツイート文を生成
        likes_display = format_number(total_likes)
        asin = book.isbn.replace('-', '') if book.isbn else ''
        book_url = f"https://qiibrary.com/books/{asin}" if asin else "https://qiibrary.com"
        
        tweet = f"""【Qiita技術書ランキング 本日の1位】

{book.title}

📝 記事掲載数: {article_count}件
❤️ 総評価数: {likes_display}

Qiitaで話題の技術書をランキング化

詳細: {book_url}
購入: {book.amazon_affiliate_url}

#技術書 #Qiita #Qiibrary"""
        
        return {
            "tweet": tweet,
            "book_title": book.title,
            "article_count": article_count,
            "total_likes": total_likes,
            "character_count": len(tweet)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"エラーが発生しました: {str(e)}")

