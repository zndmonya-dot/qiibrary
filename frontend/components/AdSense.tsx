'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdSenseProps {
  adSlot: string;
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Google AdSense 広告コンポーネント
 * 
 * @param adSlot - AdSenseの広告ユニットID（AdSense管理画面で確認）
 * @param adFormat - 広告フォーマット（デフォルト: auto）
 * @param fullWidthResponsive - レスポンシブで全幅表示するか
 * @param className - 追加のCSSクラス
 */
export default function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className = '',
  style = {}
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // 開発環境では広告を表示しない
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // 既にロード済みの場合はスキップ
    if (isLoaded.current) {
      return;
    }

    try {
      // adsbygoogleが存在しない場合は初期化
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  // 開発環境ではプレースホルダーを表示
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`bg-gray-800 border-2 border-dashed border-gray-600 p-4 text-center ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <span className="font-pixel text-xs text-gray-500">
          [AD PLACEHOLDER - DEV MODE]
        </span>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      className={`adsbygoogle ${className}`}
      style={{ display: 'block', ...style }}
      data-ad-client="ca-pub-4335284954366086"
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? 'true' : 'false'}
    />
  );
}

/**
 * インフィード広告（リスト内に表示する広告）
 */
export function AdSenseInFeed({ adSlot, layoutKey, className = '' }: { adSlot: string; layoutKey?: string; className?: string }) {
  const adRef = useRef<HTMLModElement>(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;
    if (isLoaded.current) return;

    try {
      if (typeof window !== 'undefined') {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        isLoaded.current = true;
      }
    } catch (err) {
      console.error('AdSense InFeed error:', err);
    }
  }, []);

  // 開発環境ではプレースホルダーを表示
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`my-6 ${className}`}>
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 relative" style={{ minHeight: '150px' }}>
          <span className="absolute top-1 right-2 text-[10px] font-pixel text-gray-500">SPONSORED</span>
          <div className="flex items-center justify-center h-full">
            <span className="font-pixel text-xs text-gray-500">[INFEED AD - DEV MODE]</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-6 ${className}`}>
      <div className="bg-black border border-gray-800 p-4 relative">
        <span className="absolute top-1 right-2 text-[10px] font-pixel text-gray-600">
          SPONSORED
        </span>
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-format="fluid"
          data-ad-layout-key={layoutKey || '-f1+5d+7q-d8-2t'}
          data-ad-client="ca-pub-4335284954366086"
          data-ad-slot={adSlot}
        />
      </div>
    </div>
  );
}

/**
 * ディスプレイ広告（バナー型）
 */
export function AdSenseDisplay({ adSlot, className = '' }: { adSlot: string; className?: string }) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="bg-black border-2 border-green-900/50 p-2 relative">
        <span className="absolute -top-3 left-4 bg-black px-2 text-[10px] font-pixel text-gray-600">
          ADVERTISEMENT
        </span>
        <AdSense 
          adSlot={adSlot} 
          adFormat="horizontal"
          style={{ minHeight: '90px' }}
        />
      </div>
    </div>
  );
}

