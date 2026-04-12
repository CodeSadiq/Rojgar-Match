'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackButton({ 
  className = "", 
  children = "Back" 
}: { 
  className?: string; 
  children?: React.ReactNode;
}) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()}
      className={`inline-flex items-center gap-4 no-underline bg-transparent border-none cursor-pointer p-0 group ${className}`}
    >
      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 group-hover:bg-navy group-hover:text-white transition-all">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </div>
      {children}
    </button>
  );
}
