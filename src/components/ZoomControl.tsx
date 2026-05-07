'use client';

import React, { useState, useEffect } from 'react';

export default function ZoomControl() {
  const [zoom, setZoom] = useState(100);

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
    <div className="fixed bottom-6 right-6 z-[100]">
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
  );
}
