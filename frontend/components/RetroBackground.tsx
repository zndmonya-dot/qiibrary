'use client';

import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export default function RetroBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    // Initialize stars - sparse and subtle
    const initStars = () => {
      const numStars = 80; // Fewer stars
      starsRef.current = [];
      
      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.floor(Math.random() * 2) + 1, // 1-2px pixels
          speed: Math.random() * 1 + 0.3, // Slower
          brightness: Math.random() * 0.3 + 0.1, // More subtle
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Animation loop
    const animate = () => {
      // Fade effect
      ctx.fillStyle = 'rgba(2, 4, 10, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw and update stars
      starsRef.current.forEach((star) => {
        // Update position (scrolling down)
        star.y += star.speed;
        
        // Reset if off screen
        if (star.y > canvas.height) {
          star.y = 0;
          star.x = Math.random() * canvas.width;
        }

        // Subtle flicker
        const flicker = Math.random() * 0.2 + 0.9;
        const alpha = star.brightness * flicker;

        // Draw pixel star (square for retro feel)
        ctx.fillStyle = `rgba(57, 255, 20, ${alpha})`;
        ctx.fillRect(
          Math.floor(star.x),
          Math.floor(star.y),
          star.size,
          star.size
        );
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ 
        imageRendering: 'pixelated',
        background: '#020408'
      }}
    />
  );
}
