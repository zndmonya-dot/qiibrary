"""
ランキング計算方式の比較スクリプト

異なるスコアリング方式を使用して、ランキングがどのように変わるかを比較します。
"""

import sys
from pathlib import Path

# プロジェクトのルートディレクトリをPythonパスに追加
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import logging
from app.database import SessionLocal
from app.services.ranking_service import get_ranking_service

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger(__name__)


def compare_rankings(days: int = 1, limit: int = 10):
    """
    異なるスコアリング方式でランキングを比較
    
    Args:
        days: 過去N日間のランキング（1=24時間、30=30日間、365=365日間）
        limit: 表示件数
    """
    db = SessionLocal()
    try:
        service = get_ranking_service(db)
        
        # 期間のラベル
        period_label = {
            1: "24時間",
            30: "30日間",
            365: "365日間"
        }.get(days, f"過去{days}日間")
        
        logger.info(f"\n{'='*80}")
        logger.info(f"📊 ランキング比較（{period_label}）")
        logger.info(f"{'='*80}\n")
        
        # 各スコアリング方式でランキングを取得
        methods = {
            "simple": "シンプル（言及数のみ）",
            "weighted": "加重スコア（推奨）",
            "quality": "品質重視"
        }
        
        all_rankings = {}
        for method, label in methods.items():
            logger.info(f"\n🎯 【{label}】")
            logger.info(f"{'-'*80}")
            
            rankings = service.get_ranking(days=days, limit=limit, scoring_method=method)
            all_rankings[method] = rankings
            
            if not rankings:
                logger.info("  ⚠️ データがありません")
                continue
            
            # ランキング表示
            for item in rankings:
                rank = item['rank']
                book = item['book']
                stats = item['stats']
                
                # タイトル（長い場合は省略）
                title = book['title'] or f"ISBN: {book['isbn']}"
                if len(title) > 50:
                    title = title[:47] + "..."
                
                logger.info(f"  {rank:2d}位: {title}")
                logger.info(f"       言及: {stats['mention_count']:3d}件 | "
                          f"記事: {stats['article_count']:3d}件 | "
                          f"総いいね: {stats['total_likes']:5d} | "
                          f"平均いいね: {stats['avg_likes']:6.2f} | "
                          f"スコア: {stats['score']:8.2f}")
        
        # ランキングの違いを分析
        logger.info(f"\n{'='*80}")
        logger.info(f"📈 ランキングの違い分析")
        logger.info(f"{'='*80}\n")
        
        if all_rankings["simple"] and all_rankings["weighted"]:
            logger.info("🔄 シンプル vs 加重スコア")
            logger.info(f"{'-'*80}")
            
            simple_isbns = [item['book']['isbn'] for item in all_rankings["simple"]]
            weighted_isbns = [item['book']['isbn'] for item in all_rankings["weighted"]]
            
            # 順位が変わった書籍
            changes = []
            for isbn in set(simple_isbns + weighted_isbns):
                simple_rank = simple_isbns.index(isbn) + 1 if isbn in simple_isbns else None
                weighted_rank = weighted_isbns.index(isbn) + 1 if isbn in weighted_isbns else None
                
                if simple_rank and weighted_rank and simple_rank != weighted_rank:
                    # 書籍情報を取得
                    book_info = next((item['book'] for item in all_rankings["simple"] if item['book']['isbn'] == isbn), None) or \
                               next((item['book'] for item in all_rankings["weighted"] if item['book']['isbn'] == isbn), None)
                    
                    stats_info = next((item['stats'] for item in all_rankings["weighted"] if item['book']['isbn'] == isbn), None)
                    
                    title = book_info['title'] or f"ISBN: {book_info['isbn']}"
                    if len(title) > 40:
                        title = title[:37] + "..."
                    
                    change = weighted_rank - simple_rank
                    changes.append((change, simple_rank, weighted_rank, title, stats_info))
            
            # 順位変動でソート
            changes.sort(key=lambda x: x[0])
            
            if changes:
                logger.info("\n  【順位上昇した書籍（加重スコア）】")
                for change, simple_rank, weighted_rank, title, stats in changes:
                    if change < 0:  # 順位が上がった
                        logger.info(f"    {simple_rank}位 → {weighted_rank}位 ({change:+d}): {title}")
                        if stats:
                            logger.info(f"      → 平均いいね: {stats['avg_likes']:.2f}, 総いいね: {stats['total_likes']}")
                
                logger.info("\n  【順位下降した書籍（加重スコア）】")
                for change, simple_rank, weighted_rank, title, stats in changes:
                    if change > 0:  # 順位が下がった
                        logger.info(f"    {simple_rank}位 → {weighted_rank}位 ({change:+d}): {title}")
                        if stats:
                            logger.info(f"      → 平均いいね: {stats['avg_likes']:.2f}, 総いいね: {stats['total_likes']}")
            else:
                logger.info("\n  ℹ️ 順位の変動はありません")
        
        logger.info(f"\n{'='*80}")
        logger.info(f"✅ 比較完了")
        logger.info(f"{'='*80}\n")
        
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="ランキング計算方式の比較")
    parser.add_argument(
        "--days",
        type=int,
        default=1,
        help="過去N日間のランキング（1=24時間、30=30日間、365=365日間）"
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=10,
        help="表示件数"
    )
    
    args = parser.parse_args()
    
    compare_rankings(days=args.days, limit=args.limit)

