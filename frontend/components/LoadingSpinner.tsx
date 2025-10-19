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

  return (
    <div className="p-12">
      <div className="flex flex-col justify-center items-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-qiita-green dark:border-dark-green mb-4`}></div>
        <p className="text-qiita-text dark:text-dark-text text-sm font-medium animate-pulse">{message}</p>
      </div>
    </div>
  );
}

