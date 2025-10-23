'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBackForward = useRef(false);

  useEffect(() => {
    // popstateイベント（戻る・進む）を検出
    const handlePopState = () => {
      isBackForward.current = true;
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    // 戻る・進むの場合はスクロールしない
    if (isBackForward.current) {
      isBackForward.current = false;
      return;
    }

    // 通常のナビゲーション（リンククリックなど）の場合のみページトップへ
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return <>{children}</>;
}

