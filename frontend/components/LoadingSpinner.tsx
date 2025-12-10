import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full">
      <div className="relative mb-6">
        {/* Outer Box */}
        <div className="w-16 h-16 border-4 border-green-500 flex items-center justify-center animate-[spin_3s_linear_infinite]">
          <div className="w-8 h-8 bg-green-500 animate-pulse"></div>
        </div>
        {/* Glitch Effect Layers */}
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-red-500 opacity-30 animate-pulse" style={{ transform: 'translate(4px, 0)' }}></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 opacity-30 animate-pulse" style={{ animationDelay: '0.1s', transform: 'translate(-4px, 0)' }}></div>
      </div>
      
      <div className="font-pixel text-xl text-green-500 tracking-widest animate-pulse">
        LOADING DATA...
      </div>
      
      {/* Progress Bar */}
      <div className="mt-4 w-64 h-6 border-2 border-green-500 p-1 bg-black shadow-[4px_4px_0_#39ff14]">
        <div className="h-full bg-green-500 animate-loading-bar w-full origin-left"></div>
      </div>
    </div>
  );
}
