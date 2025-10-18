export default function BookDetailLoading() {
  return (
    <div className="min-h-screen bg-qiita-bg dark:bg-dark-bg flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-qiita-green dark:border-dark-green mb-4"></div>
      <p className="text-secondary text-lg animate-pulse">書籍情報を読み込み中...</p>
    </div>
  );
}

