export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-youtube-red mb-4"></div>
      <p className="text-secondary text-lg animate-pulse">読み込み中...</p>
    </div>
  );
}

