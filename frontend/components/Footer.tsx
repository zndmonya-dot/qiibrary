'use client';

import Link from 'next/link';
import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-500 py-8 border-t-4 border-green-500 relative">
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20"></div>
      
      <div className="container mx-auto px-4 text-center font-pixel text-[10px] relative z-10">
        <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-6">
          <Link href="/about" className="hover:text-green-500 transition-colors">► ABOUT</Link>
          <Link href="/terms" className="hover:text-green-500 transition-colors">► TERMS</Link>
          <Link href="/privacy" className="hover:text-green-500 transition-colors">► PRIVACY</Link>
          <Link href="/contact" className="hover:text-green-500 transition-colors">► CONTACT</Link>
        </div>
        
        <div className="mb-6">
          <a 
            href="https://github.com/zndmonya-dot/qiibrary" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block p-2 border-2 border-gray-700 hover:border-green-500 hover:text-green-500 transition-colors shadow-[2px_2px_0_#374151] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
          >
            <i className="ri-github-fill text-xl"></i>
          </a>
        </div>
        
        <div className="text-gray-600 space-y-1">
          <p className="text-green-500 animate-pulse">PRESS START TO CONTINUE</p>
          <p>&copy; {new Date().getFullYear()} QIIBRARY. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
