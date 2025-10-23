'use client';

import { useState } from 'react';

export default function ZundamonMascot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);

  const tips = [
    { title: 'Qiibraryって何なのだ？', content: 'Qiitaで紹介された技術書をランキング形式で見られるサイトなのだ！📚' },
    { title: '使い方なのだ', content: '気になる本を見つけたら、クリックして詳細を見るのだ〜✨' },
    { title: '期間を選べるのだ', content: '24時間、30日、365日、全期間でランキングを切り替えられるのだ！⏰' },
    { title: 'YouTube動画もあるのだ', content: '本の詳細ページには、解説動画も表示されるのだ〜🎥' },
    { title: 'OSに合わせてるのだ', content: 'サイトのテーマは、あなたのOSの設定に自動で合わせてるのだ！🌓' },
  ];

  const handleClick = () => {
    if (isOpen) {
      // 次のTipsを表示
      setMessageIndex((prev) => (prev + 1) % tips.length);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      {/* ヘルプ吹き出し */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 border-3 border-green-400 dark:border-green-600 rounded-2xl shadow-2xl p-4 max-w-xs animate-scale-in relative">
          {/* 閉じるボタン */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            aria-label="閉じる"
          >
            <i className="ri-close-line text-lg"></i>
          </button>

          {/* コンテンツ */}
          <div className="pr-6">
            <h3 className="text-green-700 dark:text-green-400 font-bold text-sm mb-2">
              {tips[messageIndex].title}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 text-xs leading-relaxed">
              {tips[messageIndex].content}
            </p>
          </div>

          {/* 次へボタン */}
          <button
            onClick={handleClick}
            className="mt-3 w-full bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <span>次のヒント</span>
            <i className="ri-arrow-right-line"></i>
          </button>

          {/* 吹き出しの三角 */}
          <div className="absolute -bottom-3 right-8 w-6 h-6 bg-white dark:bg-gray-800 border-r-3 border-b-3 border-green-400 dark:border-green-600 transform rotate-45"></div>
        </div>
      )}

      {/* マスコットボタン */}
      <button
        onClick={handleClick}
        className="group relative w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 dark:from-green-500 dark:to-green-700 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center animate-bounce-slow"
        aria-label="ズンダモンのヘルプ"
      >
        {/* ズンダモンっぽいデザイン */}
        <span className="text-3xl filter drop-shadow-lg">🍡</span>
        
        {/* ホバー時のグロー効果 */}
        <div className="absolute inset-0 rounded-full bg-green-400/50 dark:bg-green-500/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
        
        {/* 新着バッジ（初回のみ） */}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-xs font-bold">?</span>
          </div>
        )}
      </button>
    </div>
  );
}

