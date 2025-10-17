from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from datetime import date, datetime, timedelta
import random
from ..schemas.book import RankingItem, Book, BookStats

router = APIRouter()


def generate_rating_and_reviews() -> tuple[float, int]:
    """星評価とレビュー数を生成"""
    rating = round(random.uniform(3.5, 5.0), 1)
    review_count = random.randint(50, 5000)
    return rating, review_count


def generate_sale_info(price: int) -> tuple[Optional[int], Optional[int]]:
    """セール情報を生成（30%の確率でセール中）"""
    if random.random() < 0.3:
        discount_rate = random.choice([10, 15, 20, 25, 30])
        sale_price = int(price * (1 - discount_rate / 100))
        return sale_price, discount_rate
    return None, None


def generate_publication_date() -> str:
    """発売日を生成（2018年〜2024年の範囲でランダム）"""
    start_date = datetime(2018, 1, 1)
    end_date = datetime(2024, 12, 31)
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return (start_date + timedelta(days=random_number_of_days)).strftime("%Y-%m-%d")


# サンプルデータ（50冊のIT技術書）
def generate_sample_books():
    books = []
    book_data = [
        # 日本語書籍 (ASIN, Title, Author, Publisher, Price, Views, Mentions, Locale, Description)
        ("4873115655", "リーダブルコード", "Dustin Boswell, Trevor Foucher", "オライリージャパン", 2640, 1234567, 8, "ja", 
         "コードは理解しやすくなければならない。本書はこの原則を日々のコーディングの様々な場面に当てはめる方法を紹介します。名前の付け方、コメントの書き方など、エンジニアが本当に知りたかった基本原則とテクニックを解説。"),
        ("4297125218", "プログラマーのためのCPU入門", "Takenobu T.", "技術評論社", 3080, 987654, 6, "ja",
         "CPUの基礎知識から最新アーキテクチャまでを網羅。プログラマーが知っておくべきCPUの動作原理、キャッシュメモリ、パイプライン処理などを分かりやすく解説します。"),
        ("4297124394", "良いコード/悪いコードで学ぶ設計入門", "仙塲 大也", "技術評論社", 3278, 856432, 7, "ja",
         "コードの良し悪しを具体例で学ぶ。保守性の高い設計、適切な命名、責務の分離など、現場で即戦力となる設計スキルを実践的に習得できます。"),
        ("4873119049", "ゼロから作るDeep Learning", "斎藤 康毅", "オライリージャパン", 3740, 745321, 9, "ja",
         "ディープラーニングの本格的な入門書。外部のライブラリに頼らずに、Pythonでゼロから実装していくことで、ディープラーニングの本質を理解できます。"),
        ("4297127830", "現場で使える！pandas データ前処理入門", "株式会社ロンバート", "技術評論社", 2948, 632145, 4, "ja",
         "データ分析の8割を占める前処理を徹底解説。pandasを使った実践的なデータクレンジング、変換、集計のテクニックを豊富な事例とともに紹介します。"),
        
        # 英語書籍
        ("0132350882", "Clean Code: A Handbook of Agile Software Craftsmanship", "Robert C. Martin", "Prentice Hall", 4280, 612345, 10, "en",
         "A handbook of agile software craftsmanship that teaches practical techniques for writing clean, maintainable code. Learn how to tell the difference between good and bad code."),
        ("020161622X", "The Pragmatic Programmer", "David Thomas, Andrew Hunt", "Addison-Wesley", 4580, 587432, 9, "en",
         "From journeyman to master. This classic book illustrates the best practices and major pitfalls of many different aspects of software development."),
        ("0134685997", "Effective Java", "Joshua Bloch", "Addison-Wesley", 4680, 543678, 8, "en",
         "The definitive guide to Java best practices. Learn from one of the language's creators about how to write robust, high-performance Java code."),
        ("0596007124", "Head First Design Patterns", "Eric Freeman, Elisabeth Robson", "O'Reilly Media", 4180, 521234, 7, "en",
         "A brain-friendly guide to design patterns. Using the latest research in neurobiology, cognitive science, and learning theory to craft a multi-sensory learning experience."),
        ("0134757599", "Refactoring: Improving the Design of Existing Code", "Martin Fowler", "Addison-Wesley", 5280, 498321, 9, "en",
         "Master the art of improving code without changing its external behavior. Learn proven refactoring techniques that make your code more readable, maintainable, and efficient."),
        
        # 日本語書籍（続き）
        ("4873118468", "プログラミングTypeScript", "Boris Cherny", "オライリージャパン", 3740, 476543, 5, "ja",
         "TypeScriptの基本から応用まで徹底解説。型安全性を活かした堅牢なアプリケーション開発のためのベストプラクティスを学べます。"),
        ("4873119480", "Go言語による並行処理", "Katherine Cox-Buday", "オライリージャパン", 3520, 465432, 6, "ja",
         "Goの並行処理パターンを実践的に解説。ゴルーチン、チャネル、selectなど、並行プログラミングの基礎から高度なテクニックまで網羅。"),
        ("4297126362", "SQLアンチパターン", "Bill Karwin", "オライリージャパン", 3520, 445678, 7, "ja",
         "開発現場でよく見られるSQL設計の失敗パターンとその対策を解説。データベース設計の落とし穴を避けるための必読書。"),
        ("4873118778", "入門 Kubernetes", "Brendan Burns", "オライリージャパン", 3740, 432109, 5, "ja",
         "Kubernetesの基礎から実践まで。コンテナオーケストレーションの決定版ツールを使いこなすための包括的ガイド。"),
        ("4873119030", "Effective Python", "Brett Slatkin", "オライリージャパン", 3520, 421098, 6, "ja",
         "Pythonらしいコードの書き方を90の項目で解説。言語の特性を活かした効率的で読みやすいコードを書くためのノウハウが満載。"),
        
        # 英語書籍（続き）
        ("0735619670", "Code Complete", "Steve McConnell", "Microsoft Press", 6280, 408765, 8, "en",
         "Widely considered one of the best practical guides to programming. Discusses the art and science of software construction with hundreds of code examples."),
        ("0262033844", "Introduction to Algorithms", "Thomas H. Cormen", "MIT Press", 8680, 398654, 7, "en",
         "The bible of algorithms. Provides a comprehensive introduction to the modern study of computer algorithms with rigorous analysis and mathematical rigor."),
        ("0262510871", "Structure and Interpretation of Computer Programs", "Harold Abelson", "MIT Press", 7280, 387654, 6, "en",
         "A classic text in computer science. Teaches fundamental principles of computer programming through the lens of Scheme and functional programming."),
        ("1617294551", "Grokking Algorithms", "Aditya Bhargava", "Manning", 3980, 376543, 7, "en",
         "An illustrated guide for programmers. Learn algorithms through visual explanations and friendly examples that make complex topics accessible."),
        ("0136291554", "Clean Architecture", "Robert C. Martin", "Prentice Hall", 4580, 365432, 8, "en",
         "Essential principles of software architecture. Learn how to build systems that are flexible, maintainable, and testable with Uncle Bob's proven patterns."),
        
        # 日本語書籍（続き）
        ("4873119243", "データ指向アプリケーションデザイン", "Martin Kleppmann", "オライリージャパン", 5060, 354321, 8, "ja",
         "データ集約型アプリケーション設計の決定版。分散システム、データベース、ストレージエンジンの内部構造を深く理解できる。"),
        ("4297124513", "プロを目指す人のためのRuby入門", "伊藤 淳一", "技術評論社", 3278, 343210, 5, "ja",
         "Ruby初心者からプロフェッショナルへ。言語の基礎から実践的なテクニックまで、現場で求められるRubyスキルを体系的に学べます。"),
        ("4873119367", "ハンズオンNode.js", "Noel Rappim", "オライリージャパン", 3960, 332109, 4, "ja",
         "Node.jsの実践的な開発手法を学ぶ。非同期処理、Express、データベース連携など、Webアプリケーション開発に必要な知識を網羅。"),
        ("4297127474", "Django Webアプリ開発 実装ハンドブック", "鈴木 翔", "技術評論社", 3520, 321098, 5, "ja",
         "Djangoによる実践的なWebアプリケーション開発。MVTアーキテクチャ、ORM、認証、デプロイまで、開発の全工程を解説。"),
        ("4873119014", "実用 Git", "Jon Loeliger", "オライリージャパン", 3740, 310987, 7, "ja",
         "バージョン管理システムGitの実践ガイド。基本操作からブランチ戦略、チーム開発での活用法まで、現場で使える技術を習得。"),
        
        # 英語書籍（続き）
        ("1449355730", "Designing Data-Intensive Applications", "Martin Kleppmann", "O'Reilly Media", 5680, 298765, 9, "en",
         "The big ideas behind reliable, scalable, and maintainable systems. Navigate the diverse landscape of technologies for storing and processing data."),
        ("0321127420", "Patterns of Enterprise Application Architecture", "Martin Fowler", "Addison-Wesley", 5480, 287654, 6, "en",
         "A catalog of enterprise application patterns. Learn how to structure complex business applications with proven architectural patterns."),
        ("0321573513", "Algorithms", "Robert Sedgewick", "Addison-Wesley", 7680, 276543, 7, "en",
         "Essential information on algorithms and data structures. Combines rigorous academic approach with practical implementations in Java."),
        ("0596517742", "JavaScript: The Good Parts", "Douglas Crockford", "O'Reilly Media", 3480, 265432, 8, "en",
         "Master the elegant parts of JavaScript. Focus on the beautiful, powerful features while avoiding the rough edges of this quirky language."),
        ("0321934113", "Don't Make Me Think", "Steve Krug", "New Riders", 3680, 254321, 6, "en",
         "A common sense approach to web usability. Learn how to design intuitive navigation and information design with humor and practical examples."),
        
        # 日本語書籍（続き）
        ("4297126593", "Docker実践ガイド", "古賀 政純", "技術評論社", 3520, 243210, 4, "ja",
         "Dockerの基礎から実践までを網羅。コンテナ技術の理解を深め、開発環境の構築からプロダクション運用まで幅広くカバー。"),
        ("4873119375", "Pythonではじめる機械学習", "Andreas C. Muller", "オライリージャパン", 3740, 232109, 6, "ja",
         "機械学習の入門書として最適。scikit-learnを使った実践的なアプローチで、アルゴリズムの理解と実装スキルを同時に習得。"),
        ("4297124262", "詳解 システム・パフォーマンス", "Brendan Gregg", "技術評論社", 6380, 221098, 5, "ja",
         "システムパフォーマンスの決定版。カーネル、ファイルシステム、ネットワークなど、あらゆるレイヤーの最適化手法を解説。"),
        ("4873118689", "マイクロサービスアーキテクチャ", "Sam Newman", "オライリージャパン", 3740, 210987, 6, "ja",
         "マイクロサービスの設計と実装。モノリスからの移行戦略、サービス分割、分散システムの課題への対処法を実践的に学べる。"),
        ("4297123568", "基礎から学ぶVue.js", "mio", "技術評論社", 3278, 198765, 5, "ja",
         "Vue.jsの入門から実践まで。コンポーネント指向開発、状態管理、ルーティングなど、モダンなSPA開発に必要な知識を体系的に習得。"),
        
        # 英語書籍（続き）
        ("1491950358", "Building Microservices", "Sam Newman", "O'Reilly Media", 4880, 187654, 7, "en",
         "A comprehensive guide to microservices architecture. Learn how to design, develop, and deploy microservices systems with practical patterns and real-world examples."),
        ("0135957052", "The Clean Coder", "Robert C. Martin", "Prentice Hall", 3980, 176543, 6, "en",
         "A code of conduct for professional programmers. Learn what it means to behave as a true software craftsman with practical advice and inspiring anecdotes."),
        ("0201633612", "Design Patterns", "Gang of Four", "Addison-Wesley", 5680, 165432, 9, "en",
         "The classic book on design patterns. Essential reading for understanding reusable object-oriented software design with 23 fundamental patterns."),
        ("1492040347", "Software Engineering at Google", "Titus Winters", "O'Reilly Media", 5280, 154321, 5, "en",
         "Learn how Google builds and maintains software. Discover lessons from engineering practices used across one of the world's largest software companies."),
        ("0137081073", "The Phoenix Project", "Gene Kim", "IT Revolution Press", 4180, 143210, 8, "en",
         "A novel about IT, DevOps, and helping your business win. Learn about DevOps principles through an engaging story of a failing IT organization's transformation."),
        
        # 日本語書籍（続き）
        ("4873119170", "Webを支える技術", "山本 陽平", "技術評論社", 2948, 132109, 7, "ja",
         "Web技術の基礎を体系的に学ぶ。HTTP、URI、HTMLなど、Webの根幹を成す技術の仕組みと設計思想を丁寧に解説。"),
        ("4873119219", "プログラミングRust", "Jim Blandy", "オライリージャパン", 4620, 121098, 4, "ja",
         "Rustの包括的な入門書。所有権システム、型安全性、並行処理など、Rustの強力な機能を実践的なコード例とともに学べる。"),
        ("4297124270", "AWS認定資格試験テキスト", "山下 光洋", "技術評論社", 2948, 110987, 5, "ja",
         "AWS認定試験の対策本。クラウドサービスの基礎から実践的な知識まで、試験合格に必要な内容を効率的にカバー。"),
        ("4873119863", "Fluent Python", "Luciano Ramalho", "オライリージャパン", 6380, 98765, 6, "ja",
         "Pythonの真髄を学ぶ。イディオム、デザインパターン、ライブラリの活用法など、Pythonicなコードを書くための深い洞察を提供。"),
        ("4297124289", "React実践の教科書", "石橋 啓太", "技術評論社", 3278, 87654, 4, "ja",
         "Reactの実践的な開発手法。Hooks、状態管理、パフォーマンス最適化など、モダンなReactアプリケーション開発のノウハウを習得。"),
        
        # 英語書籍（最後）
        ("1492052205", "System Design Interview", "Alex Xu", "Independently Published", 3880, 76543, 7, "en",
         "An insider's guide to system design interviews. Learn how to design scalable systems with step-by-step frameworks and real interview questions."),
        ("1098101095", "Learning Python", "Mark Lutz", "O'Reilly Media", 6280, 65432, 5, "en",
         "Comprehensive introduction to Python programming. Master the fundamentals and advanced features of Python with hands-on tutorials and real-world examples."),
        ("1119609828", "Cracking the Coding Interview", "Gayle Laakmann McDowell", "CareerCup", 4380, 54321, 8, "en",
         "The ultimate guide for programming interviews. Features 189 programming questions and solutions with strategies from a former Google interviewer."),
        ("1617295981", "Deep Learning with Python", "François Chollet", "Manning", 5180, 43210, 6, "en",
         "Written by the creator of Keras. Learn deep learning fundamentals and practical techniques using Python and the powerful Keras library."),
        ("1492043451", "Fundamentals of Software Architecture", "Mark Richards", "O'Reilly Media", 4880, 32109, 5, "en",
         "An engineering approach to software architecture. Explore architectural characteristics, patterns, and trade-offs for building modern systems."),
    ]
    
    for idx, (asin, title, author, publisher, price, views, mentions, locale, description) in enumerate(book_data[:50], 1):
        # localeに基づいてAmazonドメインとタグを設定
        amazon_domain = "amazon.co.jp" if locale == "ja" else "amazon.com"
        affiliate_tag = "yourtag-22" if locale == "ja" else "yourtag-20"
        
        # 各種データを生成
        rating, review_count = generate_rating_and_reviews()
        sale_price, discount_rate = generate_sale_info(price)
        publication_date = generate_publication_date()
        
        books.append({
            "id": idx,
            "asin": asin,
            "title": title,
            "author": author,
            "publisher": publisher,
            "publication_date": publication_date,
            "price": price,
            "sale_price": sale_price,
            "discount_rate": discount_rate,
            "rating": rating,
            "review_count": review_count,
            "image_url": f"https://m.media-amazon.com/images/P/{asin}.jpg",
            "amazon_url": f"https://www.{amazon_domain}/dp/{asin}",
            "affiliate_url": f"https://www.{amazon_domain}/dp/{asin}?tag={affiliate_tag}",
            "description": description,
            "total_views": views,
            "total_mentions": mentions,
            "locale": locale,
            "latest_mention_at": "2025-10-15T10:00:00+09:00",
            "created_at": "2025-01-01T00:00:00+09:00",
            "updated_at": "2025-10-17T00:00:00+09:00"
        })
    
    return books

SAMPLE_BOOKS = generate_sample_books()


@router.get("/daily")
async def get_daily_ranking(
    date: Optional[str] = Query(None, description="日付 (YYYY-MM-DD)"),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", description="言語 (ja or en)")
):
    """日別ランキング取得"""
    ranking_date = date if date else datetime.now().strftime("%Y-%m-%d")
    
    # 地域別にフィルタリング
    filtered_books = [book for book in SAMPLE_BOOKS if book["locale"] == locale]
    
    rankings = []
    for idx, book_data in enumerate(filtered_books[:limit], 1):
        rankings.append({
            "rank": idx,
            "book": book_data,
            "stats": {
                "total_views": book_data["total_views"],
                "daily_views": 5000 + (idx * 100),
                "mention_count": book_data["total_mentions"]
            }
        })
    
    return {
        "rankings": rankings,
        "period": {
            "type": "daily",
            "date": ranking_date
        }
    }


@router.get("/monthly")
async def get_monthly_ranking(
    year: int = Query(..., description="年"),
    month: int = Query(..., ge=1, le=12, description="月"),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", description="言語 (ja or en)")
):
    """月別ランキング取得"""
    # 地域別にフィルタリング
    filtered_books = [book for book in SAMPLE_BOOKS if book["locale"] == locale]
    
    rankings = []
    for idx, book_data in enumerate(filtered_books[:limit], 1):
        rankings.append({
            "rank": idx,
            "book": book_data,
            "stats": {
                "total_views": book_data["total_views"],
                "monthly_views": 150000 + (idx * 5000),
                "mention_count": book_data["total_mentions"]
            }
        })
    
    return {
        "rankings": rankings,
        "period": {
            "type": "monthly",
            "year": year,
            "month": month
        }
    }


@router.get("/yearly")
async def get_yearly_ranking(
    year: int = Query(..., description="年"),
    limit: int = Query(50, ge=1, le=100),
    locale: str = Query("ja", description="言語 (ja or en)")
):
    """年別ランキング取得"""
    # 地域別にフィルタリング
    filtered_books = [book for book in SAMPLE_BOOKS if book["locale"] == locale]
    
    rankings = []
    for idx, book_data in enumerate(filtered_books[:limit], 1):
        rankings.append({
            "rank": idx,
            "book": book_data,
            "stats": {
                "total_views": book_data["total_views"],
                "yearly_views": book_data["total_views"],
                "mention_count": book_data["total_mentions"]
            }
        })
    
    return {
        "rankings": rankings,
        "period": {
            "type": "yearly",
            "year": year
        }
    }

