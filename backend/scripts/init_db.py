"""
データベース初期化スクリプト
テスト用のサンプルデータを投入
"""

import sys
from pathlib import Path

# プロジェクトルートをパスに追加
sys.path.append(str(Path(__file__).resolve().parents[1]))

from datetime import datetime, date, timedelta
import random
from app.database import SessionLocal, engine, Base
from app.models import Book, BookDailyStat, YouTubeVideo, BookMention, SearchKeyword


def create_sample_data(db: SessionLocal):
    """サンプルデータを作成"""
    
    print("📚 サンプルデータ作成開始...")
    
    # サンプル書籍データ
    sample_books = [
        {
            "asin": "4873115655",
            "title": "リーダブルコード",
            "author": "Dustin Boswell, Trevor Foucher",
            "publisher": "オライリージャパン",
            "publication_date": date(2012, 6, 23),
            "price": 2640,
            "rating": 4.4,
            "review_count": 892,
            "image_url": "https://m.media-amazon.com/images/I/51MgH8Jmr+L.jpg",
            "description": "コードは理解しやすくなければならない。本書はこの原則を日々のコーディングの様々な場面に当てはめる方法を紹介します。",
            "locale": "ja",
        },
        {
            "asin": "4297124394",
            "title": "良いコード/悪いコードで学ぶ設計入門",
            "author": "仙塲 大也",
            "publisher": "技術評論社",
            "publication_date": date(2022, 4, 30),
            "price": 3278,
            "sale_price": 2622,
            "discount_rate": 20,
            "rating": 4.5,
            "review_count": 456,
            "image_url": "https://m.media-amazon.com/images/I/51Q5Z4JmR+L.jpg",
            "description": "コードの良し悪しを具体例で学ぶ。保守性の高い設計、適切な命名、責務の分離など、現場で即戦力となる設計スキルを実践的に習得できます。",
            "locale": "ja",
        },
        {
            "asin": "4873119049",
            "title": "ゼロから作るDeep Learning",
            "author": "斎藤 康毅",
            "publisher": "オライリージャパン",
            "publication_date": date(2016, 9, 24),
            "price": 3740,
            "rating": 4.3,
            "review_count": 678,
            "image_url": "https://m.media-amazon.com/images/I/51ZBvVBUSQL.jpg",
            "description": "ディープラーニングの本格的な入門書。外部のライブラリに頼らずに、Pythonでゼロから実装していくことで、ディープラーニングの本質を理解できます。",
            "locale": "ja",
        },
    ]
    
    books = []
    for book_data in sample_books:
        # Amazon URLとアフィリエイトURLを生成
        asin = book_data["asin"]
        domain = "amazon.co.jp" if book_data["locale"] == "ja" else "amazon.com"
        tag = "yourtag-22" if book_data["locale"] == "ja" else "yourtag-20"
        
        book = Book(
            **book_data,
            amazon_url=f"https://www.{domain}/dp/{asin}",
            affiliate_url=f"https://www.{domain}/dp/{asin}?tag={tag}",
            total_views=0,
            total_mentions=0,
        )
        db.add(book)
        books.append(book)
    
    db.commit()
    print(f"✅ {len(books)}冊の書籍を追加しました")
    
    # サンプルYouTube動画
    sample_videos = [
        {
            "video_id": "dQw4w9WgXcQ",
            "title": "【2024年版】現役エンジニアがおすすめするプログラミング本10選",
            "description": "今回は、実際に読んで役立ったプログラミング本を紹介します。\n\n1. リーダブルコード https://www.amazon.co.jp/dp/4873115655",
            "channel_id": "UCabcdefghijk123",
            "channel_name": "エンジニアTV",
            "view_count": 125000,
            "like_count": 4500,
            "duration_seconds": 1245,
            "published_at": datetime.now() - timedelta(days=10),
            "locale": "ja",
        },
        {
            "video_id": "abc123xyz",
            "title": "【完全保存版】設計の勉強におすすめの本",
            "description": "設計を学ぶならこの本！\n\n・良いコード/悪いコードで学ぶ設計入門 https://www.amazon.co.jp/dp/4297124394",
            "channel_id": "UC987654321xyz",
            "channel_name": "プログラミングチャンネル",
            "view_count": 89000,
            "like_count": 3200,
            "duration_seconds": 1680,
            "published_at": datetime.now() - timedelta(days=5),
            "locale": "ja",
        },
    ]
    
    videos = []
    for video_data in sample_videos:
        video_id = video_data["video_id"]
        video = YouTubeVideo(
            **video_data,
            video_url=f"https://www.youtube.com/watch?v={video_id}",
            channel_url=f"https://www.youtube.com/channel/{video_data['channel_id']}",
            thumbnail_url=f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
        )
        db.add(video)
        videos.append(video)
    
    db.commit()
    print(f"✅ {len(videos)}件の動画を追加しました")
    
    # 書籍と動画の関連付け
    mentions = [
        (books[0], videos[0]),  # リーダブルコード - 動画1
        (books[1], videos[1]),  # 良いコード - 動画2
    ]
    
    for book, video in mentions:
        mention = BookMention(
            book_id=book.id,
            video_id=video.id,
            mentioned_at=video.published_at,
            extracted_from_url=video.video_url,
        )
        db.add(mention)
    
    db.commit()
    print(f"✅ {len(mentions)}件の関連付けを追加しました")
    
    # 日次統計データを生成（過去30日分）
    for i in range(30):
        target_date = date.today() - timedelta(days=i)
        
        for book in books:
            # ランダムな再生回数を生成（古い日ほど少なく）
            base_views = random.randint(1000, 5000)
            daily_views = int(base_views * (1 - i / 60))  # 日が古いほど減少
            
            stat = BookDailyStat(
                book_id=book.id,
                date=target_date,
                daily_views=daily_views,
                daily_mentions=random.randint(1, 3),
            )
            db.add(stat)
    
    db.commit()
    print(f"✅ 過去30日分の統計データを追加しました")
    
    # 書籍のキャッシュ情報を更新
    for book in books:
        total_views = db.query(func.sum(BookDailyStat.daily_views)).filter(
            BookDailyStat.book_id == book.id
        ).scalar() or 0
        
        total_mentions = db.query(func.count(BookMention.id)).filter(
            BookMention.book_id == book.id
        ).scalar() or 0
        
        latest_mention = db.query(func.max(BookMention.mentioned_at)).filter(
            BookMention.book_id == book.id
        ).scalar()
        
        book.total_views = int(total_views)
        book.total_mentions = int(total_mentions)
        book.latest_mention_at = latest_mention
    
    db.commit()
    print("✅ 書籍キャッシュを更新しました")


def main():
    """メイン処理"""
    print("🚀 データベース初期化スクリプト開始\n")
    
    # テーブル作成
    print("📊 テーブル作成中...")
    Base.metadata.create_all(bind=engine)
    print("✅ テーブル作成完了\n")
    
    # サンプルデータ投入
    db = SessionLocal()
    try:
        from sqlalchemy import func
        
        # 既存データをチェック
        book_count = db.query(func.count(Book.id)).scalar()
        
        if book_count > 0:
            print(f"⚠️  既に{book_count}冊の書籍が存在します")
            response = input("データをクリアして再作成しますか？ (y/N): ")
            
            if response.lower() == 'y':
                print("🗑️  既存データを削除中...")
                db.query(BookDailyStat).delete()
                db.query(BookMention).delete()
                db.query(YouTubeVideo).delete()
                db.query(Book).delete()
                db.query(SearchKeyword).delete()
                db.commit()
                print("✅ 削除完了\n")
            else:
                print("❌ 処理を中止しました")
                return
        
        create_sample_data(db)
        
        print("\n🎉 データベース初期化完了！")
        print("\n次のステップ:")
        print("1. バックエンドを起動: cd backend && uvicorn app.main:app --reload")
        print("2. フロントエンドを起動: cd frontend && npm run dev")
        print("3. ブラウザで http://localhost:3000 を開く")
    
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        db.rollback()
        import traceback
        traceback.print_exc()
    
    finally:
        db.close()


if __name__ == "__main__":
    main()

