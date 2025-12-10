'use client';

import { useEffect, useRef, useId } from 'react';

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
 */
export default function AdSense({ 
  adSlot, 
  adFormat = 'auto', 
  fullWidthResponsive = true,
  className = '',
  style = {}
}: AdSenseProps) {
  const adRef = useRef<HTMLModElement>(null);
  const uniqueId = useId();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          // 既に広告がロードされているかチェック
          if (adRef.current.dataset.adStatus === 'loaded') return;
          
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.error('AdSense error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot, uniqueId]);

  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`bg-gray-800 border-2 border-dashed border-gray-600 p-4 text-center ${className}`}
        style={{ minHeight: '100px', ...style }}
      >
        <span className="font-pixel text-xs text-gray-500">
          [AD: {adSlot}]
        </span>
      </div>
    );
  }

  return (
    <ins
      ref={adRef}
      key={`ad-${adSlot}-${uniqueId}`}
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
export function AdSenseInFeed({ 
  adSlot, 
  layoutKey, 
  className = '' 
}: { 
  adSlot: string; 
  layoutKey?: string; 
  className?: string 
}) {
  const adRef = useRef<HTMLModElement>(null);
  const uniqueId = useId();

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') return;

    const timer = setTimeout(() => {
      try {
        if (typeof window !== 'undefined' && adRef.current) {
          if (adRef.current.dataset.adStatus === 'loaded') return;
          
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
        }
      } catch (err) {
        console.error('AdSense InFeed error:', err);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [adSlot, uniqueId]);

  if (process.env.NODE_ENV === 'development') {
    return (
      <div className={`my-6 ${className}`}>
        <div className="bg-gray-800 border-2 border-dashed border-gray-600 p-4 relative" style={{ minHeight: '120px' }}>
          <span className="absolute top-1 right-2 text-[10px] font-pixel text-gray-500">SPONSORED</span>
          <div className="flex items-center justify-center h-full">
            <span className="font-pixel text-xs text-gray-500">[INFEED: {adSlot}]</span>
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
          key={`infeed-${adSlot}-${uniqueId}`}
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
