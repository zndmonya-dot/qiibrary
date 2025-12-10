'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // メニューが開いている時はスクロールを無効化
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-4 ${
        isScrolled ? 'bg-black border-green-500 py-2' : 'bg-black/90 border-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" prefetch={true} onClick={handleLogoClick} className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-green-500 flex items-center justify-center rounded-sm shadow-[0_0_10px_#39ff14]">
              <span className="font-pixel text-2xl text-black font-bold">Q</span>
            </div>
            <h1 className="text-xl md:text-2xl font-pixel text-white tracking-widest group-hover:text-green-400 transition-colors">
              Qiibrary
            </h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {['ABOUT', 'CONTACT'].map((item) => (
              <Link 
                key={item}
                href={`/${item.toLowerCase()}`} 
                prefetch={true}
                className="font-pixel text-xs text-gray-400 hover:text-green-400 hover:scale-110 transition-all duration-200"
              >
                {item}
              </Link>
            ))}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="メニューを開く"
          >
            <i className={`text-2xl text-green-500 transition-transform duration-300 ${
              isMenuOpen ? 'ri-close-line rotate-90' : 'ri-menu-line'
            }`}></i>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/95 md:hidden"
          onClick={handleMenuClose}
        >
          <nav 
            className="flex flex-col items-center justify-center h-full space-y-8"
            onClick={(e) => e.stopPropagation()}
          >
            <Link 
              href="/"
              onClick={handleMenuClose}
              className="font-pixel text-2xl text-green-500 hover:text-green-400 transition-colors"
            >
              HOME
            </Link>
            <Link 
              href="/about"
              onClick={handleMenuClose}
              className="font-pixel text-2xl text-white hover:text-green-400 transition-colors"
            >
              ABOUT
            </Link>
            <Link 
              href="/contact"
              onClick={handleMenuClose}
              className="font-pixel text-2xl text-white hover:text-green-400 transition-colors"
            >
              CONTACT
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
