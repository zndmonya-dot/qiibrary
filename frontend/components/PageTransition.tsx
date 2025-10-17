'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    // ページ遷移開始
    setIsTransitioning(true);
    
    // スクロール位置を即座にトップにリセット
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    // 短い遅延後にトランジション終了
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div style={{ 
      opacity: isTransitioning ? 0.7 : 1, 
      transition: 'opacity 0.15s ease-out' 
    }}>
      {children}
    </div>
  );
}

