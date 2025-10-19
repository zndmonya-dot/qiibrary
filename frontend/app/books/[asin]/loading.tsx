import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg flex flex-col items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}

