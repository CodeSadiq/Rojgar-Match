'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ZoomControl() {
  const [zoom, setZoom] = useState(100);
  const router = useRouter();

  useEffect(() => {
    const savedZoom = localStorage.getItem('rojgarmatch_zoom');
    if (savedZoom) {
      const z = parseInt(savedZoom);
      setZoom(z);
      document.documentElement.style.setProperty('--app-zoom', (z / 100).toString());
    } else {
      // Default zoom for new users: 70% on mobile, 100% on desktop
      const isMobile = window.innerWidth < 768;
      const initialZoom = isMobile ? 70 : 100;
      setZoom(initialZoom);
      document.documentElement.style.setProperty('--app-zoom', (initialZoom / 100).toString());
    }
  }, []);

  const changeZoom = (delta: number) => {
    const newZoom = Math.min(Math.max(zoom + delta, 20), 150);
    setZoom(newZoom);
    localStorage.setItem('rojgarmatch_zoom', newZoom.toString());
    document.documentElement.style.setProperty('--app-zoom', (newZoom / 100).toString());
  };

  return (
    <>
      {/* Desktop View: Bottom-6 Right-6, Includes Back Button */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-[100] flex-col gap-3 items-end">
        <button 
          onClick={() => router.back()} 
          className="bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-2 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all w-12 h-12"
          aria-label="Go Back"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>

        <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => changeZoom(10)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-navy rounded-full active:bg-navy active:text-white transition-all font-bold text-xl"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => changeZoom(-10)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-navy rounded-full active:bg-navy active:text-white transition-all font-bold text-xl"
            aria-label="Zoom Out"
          >
            −
          </button>
        </div>
      </div>

      {/* Mobile View: Bottom-6 (back button is placed above at bottom-20) */}
      <div className="md:hidden fixed bottom-6 right-6 z-[100] flex flex-col gap-3 items-end">
        <div className="bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-1 flex items-center gap-1">
          <button
            onClick={() => changeZoom(10)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-navy rounded-full active:bg-navy active:text-white transition-all font-bold text-xl"
            aria-label="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => changeZoom(-10)}
            className="w-10 h-10 flex items-center justify-center bg-gray-50 text-navy rounded-full active:bg-navy active:text-white transition-all font-bold text-xl"
            aria-label="Zoom Out"
          >
            −
          </button>
        </div>
      </div>
    </>
  );
}
