'use client';

import React, { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';
import Link from 'next/link';
import { getSiteStats } from '@/lib/api';

interface StatBoxProps {
  label: string;
  value: number;
  color: string;
}

const StatBox: React.FC<StatBoxProps> = ({ label, value, color }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const end = value;
    const duration = 2000;
    let startTime: number | null = null;

    const animateCount = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * (end - start) + start));
      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          requestAnimationFrame(animateCount);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById(`stat-box-${label.replace(/\s/g, '-')}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [value, label]);

  const getColorStyle = () => {
    switch (color) {
      case 'green': return { border: '#39ff14', text: '#39ff14', shadow: '#166534' };
      case 'cyan': return { border: '#00ffff', text: '#00ffff', shadow: '#0e7490' };
      case 'pink': return { border: '#ff00ff', text: '#ff00ff', shadow: '#86198f' };
      default: return { border: '#39ff14', text: '#39ff14', shadow: '#166534' };
    }
  };

  const colors = getColorStyle();

  return (
    <div 
      id={`stat-box-${label.replace(/\s/g, '-')}`} 
      className="bg-black border-4 p-4 relative overflow-hidden group transition-colors"
      style={{ 
        borderColor: colors.border,
        boxShadow: `4px 4px 0 ${colors.shadow}`
      }}
    >
      <p className="font-pixel text-[10px] text-gray-400 mb-2 uppercase tracking-wider">{label}</p>
      <h3 
        className="text-xl md:text-2xl font-pixel"
        style={{ color: colors.text }}
      >
        {formatNumber(count)}
      </h3>
      {/* Scanline decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-30"></div>
    </div>
  );
};

export default function HeroSection() {
  const [stats, setStats] = useState({
    totalArticles: 15200,
    totalLikes: 540200,
    totalBooks: 17446,
  });

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const data = await getSiteStats();
        if (!isMounted) return;
        setStats({
          totalArticles: data.total_articles ?? 0,
          totalLikes: data.total_likes ?? 0,
          totalBooks: data.total_books ?? 0,
        });
      } catch {
        // フォールバック（固定値）のまま
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="relative pt-28 pb-12 overflow-hidden bg-black border-b-4 border-green-500">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-20">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(57,255,20,0.1)_1px,transparent_1px),linear-gradient(180deg,rgba(57,255,20,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Status Badge */}
        <div className="inline-block mb-6 px-4 py-1 border border-green-500 bg-green-900/20 rounded-full animate-pulse">
          <span className="font-pixel text-xs text-green-400">SYSTEM READY</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-pixel text-white leading-tight mb-6 text-shadow-glow">
          KNOWLEDGE<br />
          <span className="text-green-500">UNLOCKED</span>
        </h2>
        
        <p className="text-gray-400 mb-10 max-w-xl mx-auto font-mono text-sm border-l-4 border-green-500 pl-4 text-left md:text-center md:border-l-0 md:pl-0">
          Qiitaの記事で言及された数多の技術書から、<br className="hidden md:inline"/>
          エンジニアに真に支持されている良書を見つけよう。
        </p>

        <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-3xl mx-auto mb-10">
          <StatBox label="Books" value={stats.totalBooks} color="green" />
          <StatBox label="QIITA BLOGS" value={stats.totalArticles} color="cyan" />
          <StatBox label="Likes" value={stats.totalLikes} color="pink" />
        </div>

        <div>
          <Link 
            href="#rankings" 
            className="inline-block font-pixel text-sm text-green-500 border-4 border-green-500 bg-black px-6 py-3 shadow-[4px_4px_0_#166534] hover:bg-green-500 hover:text-black hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            ▶ START GAME
          </Link>
        </div>
      </div>
    </section>
  );
}
