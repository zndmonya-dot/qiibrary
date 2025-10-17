"""
YouTube検索キーワード設定
IT技術書を効率的に発見するためのキーワード戦略
"""

from typing import List, Dict
from datetime import datetime

# 日本語キーワード（ja）
JAPANESE_KEYWORDS = {
    # 一般的な技術書キーワード
    "general": [
        "プログラミング 本 おすすめ",
        "技術書 レビュー",
        "IT 書籍 紹介",
        "エンジニア 本",
        "プログラマー 必読書",
        "技術書典",
        "オライリー 本",
    ],
    
    # プログラミング言語別
    "languages": [
        "Python 本 おすすめ",
        "JavaScript 本",
        "TypeScript 書籍",
        "Java 本",
        "Go言語 本",
        "Rust 本",
        "Ruby 本",
        "PHP 本",
        "C++ 本",
        "Kotlin 本",
        "Swift 本",
    ],
    
    # フレームワーク・ライブラリ
    "frameworks": [
        "React 本",
        "Next.js 本",
        "Vue.js 本",
        "Django 本",
        "FastAPI 本",
        "Spring Boot 本",
        "Node.js 本",
    ],
    
    # インフラ・DevOps
    "infrastructure": [
        "AWS 本 おすすめ",
        "Docker 本",
        "Kubernetes 本",
        "Linux 本",
        "ネットワーク 本",
        "クラウド 本",
        "インフラ 本",
    ],
    
    # データベース
    "database": [
        "SQL 本",
        "PostgreSQL 本",
        "MySQL 本",
        "NoSQL 本",
        "データベース 本",
    ],
    
    # 設計・アーキテクチャ
    "design": [
        "設計 本 プログラミング",
        "Clean Code 本",
        "リファクタリング 本",
        "デザインパターン 本",
        "アーキテクチャ 本",
        "DDD 本",
    ],
    
    # アルゴリズム・データ構造
    "algorithms": [
        "アルゴリズム 本",
        "データ構造 本",
        "競技プログラミング 本",
    ],
    
    # Web開発
    "web": [
        "Web開発 本",
        "フロントエンド 本",
        "バックエンド 本",
        "API 本",
    ],
    
    # データサイエンス・機械学習
    "data_science": [
        "機械学習 本",
        "ディープラーニング 本",
        "データサイエンス 本",
        "AI 本",
        "統計学 本",
    ],
    
    # キャリア・スキル
    "career": [
        "エンジニア キャリア 本",
        "プログラマー 勉強法",
        "技術書 読み方",
    ],
}

# 英語キーワード（en）
ENGLISH_KEYWORDS = {
    "general": [
        "programming books review",
        "best programming books",
        "tech books recommendation",
        "software engineering books",
        "must read books for developers",
        "O'Reilly books",
    ],
    
    "languages": [
        "Python books",
        "JavaScript books",
        "TypeScript books",
        "Java books",
        "Go programming books",
        "Rust books",
        "Ruby books",
        "PHP books",
        "C++ books",
    ],
    
    "frameworks": [
        "React books",
        "Next.js books",
        "Vue.js books",
        "Django books",
        "FastAPI books",
        "Spring Boot books",
        "Node.js books",
    ],
    
    "infrastructure": [
        "AWS books",
        "Docker books",
        "Kubernetes books",
        "Linux books",
        "DevOps books",
        "Cloud computing books",
    ],
    
    "database": [
        "SQL books",
        "PostgreSQL books",
        "MySQL books",
        "NoSQL books",
        "Database design books",
    ],
    
    "design": [
        "software design books",
        "Clean Code",
        "refactoring books",
        "design patterns books",
        "software architecture books",
        "DDD books",
    ],
    
    "algorithms": [
        "algorithms books",
        "data structures books",
        "competitive programming books",
        "coding interview books",
    ],
    
    "web": [
        "web development books",
        "frontend books",
        "backend books",
        "API design books",
    ],
    
    "data_science": [
        "machine learning books",
        "deep learning books",
        "data science books",
        "AI books",
        "statistics books",
    ],
    
    "career": [
        "software developer career books",
        "programming career books",
        "tech interview books",
    ],
}

# 高優先度キーワード（まず最初に試すべき）
# 注: YouTube API クォータ節約のため、1日5-10個に制限
HIGH_PRIORITY_KEYWORDS_JA = [
    "プログラミング 本 おすすめ 2024",
    "技術書 レビュー",
    "エンジニア 本 おすすめ",
    "Python 本",
    "JavaScript 本",
    "React 本",
    "AWS 本",
    "設計 本",
    "Clean Code",
    "リーダブルコード",
]

HIGH_PRIORITY_KEYWORDS_EN = [
    "best programming books 2024",
    "software engineering books",
    "Python books",
    "JavaScript books",
    "React books",
    "AWS books",
    "Clean Code",
    "design patterns books",
]

# ローテーション用キーワードグループ（曜日別に使用）
KEYWORD_ROTATION_JA = {
    0: ["プログラミング 本 おすすめ 2024", "Python 本", "JavaScript 本"],  # 月曜日
    1: ["技術書 レビュー", "React 本", "AWS 本"],  # 火曜日
    2: ["エンジニア 本 おすすめ", "設計 本", "Clean Code"],  # 水曜日
    3: ["リーダブルコード", "Docker 本", "SQL 本"],  # 木曜日
    4: ["Kubernetes 本", "TypeScript 本", "Go言語 本"],  # 金曜日
    5: ["機械学習 本", "データサイエンス 本", "統計学 本"],  # 土曜日
    6: ["アルゴリズム 本", "Web開発 本", "アーキテクチャ 本"],  # 日曜日
}

KEYWORD_ROTATION_EN = {
    0: ["best programming books 2024", "Python books", "JavaScript books"],
    1: ["software engineering books", "React books", "AWS books"],
    2: ["Clean Code", "design patterns books", "refactoring books"],
    3: ["Docker books", "Kubernetes books", "DevOps books"],
    4: ["TypeScript books", "Go programming books", "Rust books"],
    5: ["machine learning books", "data science books", "AI books"],
    6: ["algorithms books", "web development books", "system design books"],
}

# 除外キーワード（これらを含む動画は除外）
EXCLUDE_KEYWORDS = [
    "漫画",
    "まんが",
    "マンガ",
    "小説",
    "ラノベ",
    "アニメ",
    "ゲーム",
    "manga",
    "anime",
    "novel",
    "fiction",
]


def get_all_keywords(locale: str = "ja") -> List[str]:
    """全キーワードを取得"""
    keywords_dict = JAPANESE_KEYWORDS if locale == "ja" else ENGLISH_KEYWORDS
    all_keywords = []
    for category, keywords in keywords_dict.items():
        all_keywords.extend(keywords)
    return all_keywords


def get_high_priority_keywords(locale: str = "ja") -> List[str]:
    """高優先度キーワードを取得"""
    return HIGH_PRIORITY_KEYWORDS_JA if locale == "ja" else HIGH_PRIORITY_KEYWORDS_EN


def get_keywords_by_category(category: str, locale: str = "ja") -> List[str]:
    """カテゴリ別にキーワードを取得"""
    keywords_dict = JAPANESE_KEYWORDS if locale == "ja" else ENGLISH_KEYWORDS
    return keywords_dict.get(category, [])


def should_exclude_video(title: str, description: str) -> bool:
    """動画を除外すべきか判定"""
    text = f"{title} {description}".lower()
    return any(keyword in text for keyword in EXCLUDE_KEYWORDS)


# 検索戦略の設定
SEARCH_CONFIG = {
    # YouTube API の検索パラメータ
    "max_results_per_query": 50,  # 1クエリあたりの最大取得件数
    "video_duration": "medium",    # short, medium, long
    "video_definition": "any",     # any, high, standard
    "order": "relevance",          # relevance, date, rating, viewCount
    
    # フィルタリング設定
    "min_views": 100,              # 最低再生回数
    "min_video_length": 60,        # 最低動画長（秒）
    "max_video_age_days": 365,     # 最大動画年齢（日）
    
    # Amazon リンク抽出
    "amazon_domains": [
        "amazon.co.jp",
        "amazon.com",
        "amzn.to",
        "amzn.asia",
    ],
    
    # スケジュール設定
    "search_interval_hours": 24,   # 検索実行間隔（時間）
    "update_ranking_hours": 1,     # ランキング更新間隔（時間）
    
    # YouTube API クォータ管理
    "daily_quota_limit": 10000,    # 1日の最大クォータ
    "search_quota_cost": 100,      # 検索1回のコスト
    "video_detail_quota_cost": 1,  # 動画詳細1件のコスト
    "max_searches_per_day": 10,    # 1日の最大検索回数（クォータ節約）
    "keywords_per_search": 3,      # 1回の検索で使用するキーワード数（曜日ローテーション）
}

