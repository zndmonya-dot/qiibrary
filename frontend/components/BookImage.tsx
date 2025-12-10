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
  
  // 画像なしの場合のフォールバック（レトロゲーム風）
  if (!src) {
    return (
      <div className={`bg-gray-900 border-2 border-gray-700 flex flex-col items-center justify-center gap-2 relative ${className}`}>
        <div className="text-green-500 text-4xl animate-pulse">
          <i className="ri-book-2-line"></i>
        </div>
        <div className="font-pixel text-[10px] text-gray-500 text-center px-2">
          NO IMAGE
        </div>
        {/* Scanline effect */}
        <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      loading={rank && rank > 10 ? "lazy" : "eager"}
      priority={priority !== undefined ? priority : rank ? rank <= 5 : false}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        if (target.parentElement) {
          const fallback = document.createElement('div');
          fallback.className = 'bg-gray-900 border-2 border-red-900 flex flex-col items-center justify-center gap-2 w-full h-full relative';
          fallback.innerHTML = `
            <div class="text-red-500 text-4xl">
              <i class="ri-error-warning-line"></i>
            </div>
            <div class="font-pixel text-[10px] text-red-400 text-center px-2">
              LOAD ERROR
            </div>
            <div class="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
          `;
          target.parentElement.appendChild(fallback);
        }
      }}
    />
  );
}
