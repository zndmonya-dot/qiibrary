"""
BookTuber セットアップ & データ収集スクリプト

このスクリプトは以下を実行します：
1. データベーステーブルの作成
2. YouTube APIから実際の動画を検索
3. 動画説明からAmazonリンクを抽出
4. Amazon APIで書籍情報を取得
5. データベースに保存
"""

import sys
import os
from pathlib import Path

# プロジェクトルートをPythonパスに追加
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from datetime import datetime, timedelta
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import NullPool

from app.config import settings
from app.database import Base
from app.models.book import Book, BookDailyStat
from app.models.youtube_video import YouTubeVideo, BookMention
from app.models.search_keyword import SearchKeyword
from app.services.youtube_service import YouTubeService
from app.services.amazon_link_extractor import AmazonLinkExtractor
from app.services.amazon_service import get_amazon_service
from app.config import get_high_priority_keywords, should_exclude_video, SEARCH_CONFIG


class BookTuberSetup:
    def __init__(self):
        """初期化"""
        self.engine = create_engine(
            settings.DATABASE_URL,
            poolclass=NullPool,
            echo=False
        )
        self.SessionLocal = sessionmaker(bind=self.engine)
        self.youtube_service = YouTubeService(settings.YOUTUBE_API_KEY)
        self.link_extractor = AmazonLinkExtractor()
        
    def create_tables(self):
        """テーブル作成"""
        print("📊 データベーステーブルを作成中...")
        try:
            Base.metadata.create_all(bind=self.engine)
            print("✅ テーブル作成完了\n")
        except Exception as e:
            print(f"❌ テーブル作成エラー: {e}")
            raise
    
    def clear_existing_data(self):
        """既存データをクリア"""
        print("🗑️  既存データを削除中...")
        db = self.SessionLocal()
        try:
            # 外部キー制約を一時的に無効化（PostgreSQL）
            db.execute(text("SET CONSTRAINTS ALL DEFERRED;"))
            
            # 各テーブルを削除
            db.query(BookDailyStat).delete()
            db.query(BookMention).delete()
            db.query(YouTubeVideo).delete()
            db.query(SearchKeyword).delete()
            db.query(Book).delete()
            
            db.commit()
            print("✅ 既存データ削除完了\n")
        except Exception as e:
            db.rollback()
            print(f"❌ データ削除エラー: {e}")
            raise
        finally:
            db.close()
    
    def search_videos_for_keyword(self, keyword: str, locale: str, max_results: int = 20):
        """キーワードで動画を検索"""
        try:
            videos = self.youtube_service.search_videos(
                query=keyword,
                locale=locale,
                max_results=max_results
            )
            print(f"  ✓ '{keyword}' で {len(videos)} 件の動画を発見")
            return videos
        except Exception as e:
            print(f"  ✗ '{keyword}' の検索エラー: {e}")
            return []
    
    def extract_amazon_links_from_video(self, video: dict, locale: str):
        """動画からAmazonリンクを抽出"""
        description = video.get('description', '')
        amazon_info = self.link_extractor.extract_amazon_info(description)
        
        # ロケールに合ったASINのみを抽出
        asins = []
        for info in amazon_info:
            asin = info.get('asin')
            marketplace = info.get('marketplace', 'jp')
            
            # ロケールに応じてフィルタリング
            if locale == 'ja' and marketplace == 'jp':
                asins.append(asin)
            elif locale == 'en' and marketplace == 'com':
                asins.append(asin)
            elif marketplace == 'unknown':
                # マーケットプレイスが不明な場合は現在のロケールと仮定
                asins.append(asin)
        
        return asins
    
    def get_book_info_from_asin(self, asin: str, locale: str):
        """ASINから書籍情報を取得"""
        amazon_service = get_amazon_service(locale)
        
        try:
            # Amazon APIから実際のデータを取得（同期版）
            book_info = amazon_service.get_book_info_sync(asin, locale)
            if book_info:
                print(f"  ✓ Amazon API: '{book_info.get('title', asin)}' の情報を取得")
                return book_info
        except Exception as e:
            print(f"  ⚠ Amazon API エラー (ASIN: {asin}): {e}")
        
        # APIが失敗した場合はダミーデータを返す
        domain = 'amazon.co.jp' if locale == 'ja' else 'amazon.com'
        print(f"  ℹ ダミーデータを使用: {asin}")
        return {
            'asin': asin,
            'title': f"Book {asin}",
            'author': None,
            'publisher': None,
            'publication_date': None,
            'price': None,
            'sale_price': None,
            'discount_rate': None,
            'rating': None,
            'review_count': None,
            'image_url': f"https://m.media-amazon.com/images/I/{asin}.jpg",
            'description': None,
            'amazon_url': f"https://www.{domain}/dp/{asin}",
            'affiliate_url': f"https://www.{domain}/dp/{asin}?tag={amazon_service.associate_tag}",
            'locale': locale,
        }
    
    def collect_data_for_locale(self, locale: str, max_keywords: int = 5):
        """特定ロケールのデータを収集"""
        print(f"\n{'='*60}")
        print(f"📍 ロケール: {locale.upper()}")
        print(f"{'='*60}\n")
        
        db = self.SessionLocal()
        try:
            # 高優先度キーワードを取得
            keywords = get_high_priority_keywords(locale)[:max_keywords]
            print(f"🔍 検索キーワード: {', '.join(keywords)}\n")
            
            # 各キーワードで動画を検索
            all_videos = []
            for keyword in keywords:
                videos = self.search_videos_for_keyword(keyword, locale, max_results=10)
                all_videos.extend(videos)
            
            print(f"\n📺 合計 {len(all_videos)} 件の動画を取得")
            
            # 除外フィルタリング
            filtered_videos = []
            for video in all_videos:
                if not should_exclude_video(video['title'], video.get('description', '')):
                    filtered_videos.append(video)
            
            print(f"✅ フィルタリング後: {len(filtered_videos)} 件\n")
            
            # 動画からAmazonリンクを抽出
            book_mentions = {}  # {asin: {'book': book_data, 'videos': [video_data]}}
            
            for video in filtered_videos:
                # Amazonリンクを抽出
                amazon_links = self.extract_amazon_links_from_video(video, locale)
                
                if amazon_links:
                    print(f"📚 [{video['title'][:40]}...] から {len(amazon_links)} 冊発見")
                    
                    for asin in amazon_links:
                        if asin not in book_mentions:
                            # 書籍情報を取得
                            book_info = self.get_book_info_from_asin(asin, locale)
                            book_mentions[asin] = {
                                'book': book_info,
                                'videos': []
                            }
                        
                        book_mentions[asin]['videos'].append(video)
            
            print(f"\n📖 合計 {len(book_mentions)} 冊のユニークな書籍を発見\n")
            
            # データベースに保存
            print("💾 データベースに保存中...\n")
            
            book_count = 0
            video_count = 0
            mention_count = 0
            
            for asin, data in book_mentions.items():
                book_info = data['book']
                videos = data['videos']
                
                # 書籍を保存
                existing_book = db.query(Book).filter_by(asin=asin).first()
                if not existing_book:
                    book = Book(
                        asin=book_info['asin'],
                        title=book_info['title'],
                        author=book_info.get('author'),
                        publisher=book_info.get('publisher'),
                        publication_date=book_info.get('publication_date'),
                        price=book_info.get('price'),
                        sale_price=book_info.get('sale_price'),
                        discount_rate=book_info.get('discount_rate'),
                        rating=book_info.get('rating'),
                        review_count=book_info.get('review_count'),
                        image_url=book_info.get('image_url'),
                        description=book_info.get('description'),
                        amazon_url=book_info['amazon_url'],
                        affiliate_url=book_info['affiliate_url'],
                        locale=locale,
                        total_views=0,
                        total_mentions=0,
                    )
                    db.add(book)
                    db.flush()
                    book_count += 1
                else:
                    book = existing_book
                
                # 動画を保存
                for video_data in videos:
                    video_id = video_data['video_id']
                    
                    existing_video = db.query(YouTubeVideo).filter_by(video_id=video_id).first()
                    if not existing_video:
                        # published_at が文字列の場合は datetime に変換
                        published_at_raw = video_data.get('published_at', datetime.now())
                        if isinstance(published_at_raw, str):
                            # ISO形式の文字列をdatetimeに変換
                            published_at = datetime.fromisoformat(published_at_raw.replace('Z', '+00:00'))
                        else:
                            published_at = published_at_raw
                        
                        video = YouTubeVideo(
                            video_id=video_id,
                            title=video_data['title'],
                            description=video_data.get('description', ''),
                            channel_id=video_data.get('channel_id', 'unknown'),
                            channel_name=video_data.get('channel_name', 'Unknown'),
                            thumbnail_url=video_data.get('thumbnail_url'),
                            video_url=f"https://www.youtube.com/watch?v={video_id}",
                            view_count=video_data.get('view_count', 0),
                            like_count=video_data.get('like_count', 0),
                            published_at=published_at,
                            locale=locale,
                        )
                        db.add(video)
                        db.flush()
                        video_count += 1
                    else:
                        video = existing_video
                    
                    # 関連付けを保存
                    existing_mention = db.query(BookMention).filter_by(
                        book_id=book.id,
                        video_id=video.id
                    ).first()
                    
                    if not existing_mention:
                        mention = BookMention(
                            book_id=book.id,
                            video_id=video.id,
                            mentioned_at=video.published_at,
                        )
                        db.add(mention)
                        mention_count += 1
                    
                    # 書籍の統計を更新
                    book.total_views += video.view_count
                    book.total_mentions += 1
                    
                    # datetimeのタイムゾーンを統一して比較
                    video_pub_naive = video.published_at.replace(tzinfo=None) if video.published_at.tzinfo else video.published_at
                    book_mention_naive = book.latest_mention_at.replace(tzinfo=None) if (book.latest_mention_at and book.latest_mention_at.tzinfo) else book.latest_mention_at
                    
                    if not book_mention_naive or video_pub_naive > book_mention_naive:
                        book.latest_mention_at = video.published_at
            
            db.commit()
            
            print(f"✅ {book_count} 冊の書籍を保存")
            print(f"✅ {video_count} 件の動画を保存")
            print(f"✅ {mention_count} 件の関連付けを保存")
            
        except Exception as e:
            db.rollback()
            print(f"❌ データ収集エラー ({locale}): {e}")
            raise
        finally:
            db.close()
    
    def generate_statistics(self):
        """統計データを生成"""
        print("\n" + "="*60)
        print("📊 統計データを生成中...")
        print("="*60 + "\n")
        
        db = self.SessionLocal()
        try:
            # 過去30日分の統計データを生成
            books = db.query(Book).all()
            today = datetime.now().date()
            
            stats_count = 0
            
            for book in books:
                for days_ago in range(30):
                    date = today - timedelta(days=days_ago)
                    
                    # その日の統計を計算（簡易版）
                    daily_views = book.total_views // 30  # 均等分散（仮）
                    daily_mentions = max(1, book.total_mentions // 30)
                    
                    stat = BookDailyStat(
                        book_id=book.id,
                        date=date,
                        daily_views=daily_views,
                        daily_mentions=daily_mentions,
                    )
                    db.add(stat)
                    stats_count += 1
            
            db.commit()
            print(f"✅ {stats_count} 件の統計データを生成\n")
            
        except Exception as e:
            db.rollback()
            print(f"❌ 統計生成エラー: {e}")
            raise
        finally:
            db.close()
    
    def run(self, clear_data: bool = True, max_keywords_per_locale: int = 5):
        """メイン実行"""
        print("\n" + "="*60)
        print("🚀 BookTuber セットアップ & データ収集開始")
        print("="*60 + "\n")
        
        start_time = datetime.now()
        
        try:
            # 1. テーブル作成
            self.create_tables()
            
            # 2. 既存データクリア
            if clear_data:
                self.clear_existing_data()
            
            # 3. 日本語データ収集
            self.collect_data_for_locale('ja', max_keywords=max_keywords_per_locale)
            
            # 4. 英語データ収集
            self.collect_data_for_locale('en', max_keywords=max_keywords_per_locale)
            
            # 5. 統計データ生成
            self.generate_statistics()
            
            # 完了
            elapsed = datetime.now() - start_time
            print("\n" + "="*60)
            print(f"🎉 すべての処理が完了しました！")
            print(f"⏱️  所要時間: {elapsed.total_seconds():.1f}秒")
            print("="*60 + "\n")
            
            print("次のステップ:")
            print("1. バックエンドを起動: cd backend && uvicorn app.main:app --reload")
            print("2. フロントエンドを起動: cd frontend && npm run dev")
            print("3. ブラウザで http://localhost:3000 を開く\n")
            
        except Exception as e:
            print(f"\n❌ エラーが発生しました: {e}")
            import traceback
            traceback.print_exc()
            sys.exit(1)


def main():
    """エントリーポイント"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='BookTuber セットアップ & データ収集'
    )
    parser.add_argument(
        '--no-clear',
        action='store_true',
        help='既存データをクリアしない（追加モード）'
    )
    parser.add_argument(
        '--keywords',
        type=int,
        default=5,
        help='ロケールごとの検索キーワード数（デフォルト: 5）'
    )
    
    args = parser.parse_args()
    
    setup = BookTuberSetup()
    setup.run(
        clear_data=not args.no_clear,
        max_keywords_per_locale=args.keywords
    )


if __name__ == '__main__':
    main()

