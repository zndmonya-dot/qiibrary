interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ message = '読み込み中...', size = 'md' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const zundamonMessages = [
    'データを集めてるのだ...📚',
    'ちょっと待ってほしいのだ...⏳',
    '技術書を探してるのだ...🔍',
    'もうすぐなのだ...✨',
  ];

  const randomMessage = zundamonMessages[Math.floor(Math.random() * zundamonMessages.length)];

  return (
    <div className="p-12">
      <div className="flex flex-col justify-center items-center">
        {/* ズンダモンっぽい緑のスピナー */}
        <div className="relative mb-6">
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-3 border-b-3 border-green-500 dark:border-green-400`}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-bounce">🍡</span>
          </div>
        </div>
        
        {/* ズンダモン風メッセージ */}
        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl px-6 py-3 relative">
          <div className="absolute -top-2 left-6 w-4 h-4 bg-green-50 dark:bg-green-900/20 border-l-2 border-t-2 border-green-300 dark:border-green-700 transform rotate-45"></div>
          <p className="text-green-800 dark:text-green-300 text-sm md:text-base font-bold animate-pulse">
            {randomMessage}
          </p>
        </div>
      </div>
    </div>
  );
}

