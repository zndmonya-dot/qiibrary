import LoadingSpinner from '@/components/LoadingSpinner';

export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center">
      <LoadingSpinner />
    </div>
  );
}
