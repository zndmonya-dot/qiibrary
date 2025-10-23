'use client';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  // スクロール制御は各ページコンポーネントで個別に管理
  return <>{children}</>;
}

