'use client';

import Image from 'next/image';

interface BookImageProps {
  src: string | null;
  alt: string;
  width?: number;
  height?: number;
  rank?: number;
  className?: string;
  priority?: boolean;
}

/**
 * 書籍画像コンポーネント
 * 画像読み込みエラー時のフォールバック処理を含む
 */
export default function BookImage({
  src,
  alt,
  width = 160,
  height = 240,
  rank,
  className = '',
  priority,
}: BookImageProps) {
  const sizeClass = `w-[${width}px] h-[${height}px]`;
  
  if (!src) {
    return (
      <div className={`${sizeClass} bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border ${className}`}>
        <i className="ri-book-2-line text-5xl md:text-6xl text-qiita-text-light dark:text-dark-text-light"></i>
        <span className="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像なし</span>
      </div>
    );
  }

  return (
    <div className={`relative ${sizeClass} ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded shadow-lg w-full h-full object-cover"
        loading={rank && rank > 10 ? "lazy" : "eager"}
        priority={priority !== undefined ? priority : rank ? rank <= 5 : false}
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.parentElement) {
            target.parentElement.innerHTML = `<div class="${sizeClass} bg-qiita-surface dark:bg-dark-surface-light rounded shadow-sm flex flex-col items-center justify-center gap-3 border border-qiita-border dark:border-dark-border"><i class="ri-image-2-line text-4xl md:text-6xl text-qiita-text-light dark:text-dark-text-light"></i><span class="text-xs text-qiita-text dark:text-dark-text font-medium px-2 text-center">画像読込失敗</span></div>`;
          }
        }}
      />
    </div>
  );
}

