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
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b-4 bg-black ${
        isScrolled ? 'border-green-500 py-2' : 'border-transparent py-4'
      }`}>
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" prefetch={true} onClick={handleLogoClick} className="flex items-center space-x-3 group">
            {/* Q Icon - SVG */}
            <div className="w-10 h-10 relative">
              <svg viewBox="0 0 32 32" className="w-full h-full" style={{ imageRendering: 'pixelated' }}>
                <rect width="32" height="32" fill="#39ff14"/>
                <rect x="0" y="0" width="32" height="2" fill="#166534"/>
                <rect x="0" y="30" width="32" height="2" fill="#166534"/>
                <rect x="0" y="0" width="2" height="32" fill="#166534"/>
                <rect x="30" y="0" width="2" height="32" fill="#166534"/>
                <rect x="8" y="6" width="16" height="4" fill="#000"/>
                <rect x="8" y="22" width="12" height="4" fill="#000"/>
                <rect x="6" y="8" width="4" height="16" fill="#000"/>
                <rect x="22" y="8" width="4" height="16" fill="#000"/>
                <rect x="18" y="20" width="4" height="4" fill="#000"/>
                <rect x="20" y="22" width="4" height="4" fill="#000"/>
                <rect x="22" y="24" width="4" height="4" fill="#000"/>
              </svg>
              <div className="absolute inset-0 rounded-sm shadow-[0_0_15px_#39ff14] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            </div>
            {/* Logo Text */}
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-pixel tracking-wide">
                <span className="text-green-400 group-hover:text-green-300 transition-colors">Qii</span>
                <span className="text-white group-hover:text-green-400 transition-colors">brary</span>
              </h1>
              <span className="text-[8px] font-mono text-gray-500 tracking-widest hidden md:block">TECH BOOK DATABASE</span>
            </div>
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
