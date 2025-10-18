'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // スクロール位置を即座にトップにリセット
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return <>{children}</>;
}

