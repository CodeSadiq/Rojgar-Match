'use client';

import React from 'react';

export const CardSkeleton = () => (
  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 space-y-4 overflow-hidden relative group">
    <div className="flex justify-between items-start">
      <div className="space-y-3 flex-1">
        <div className="h-4 bg-gray-100 rounded-md w-3/4 animate-pulse"></div>
        <div className="h-3 bg-gray-50 rounded-md w-1/2 animate-pulse"></div>
      </div>
      <div className="w-12 h-12 bg-gray-50 rounded-xl animate-pulse"></div>
    </div>
    <div className="pt-4 border-t border-gray-50 flex gap-3">
      <div className="h-6 bg-gray-50 rounded-full w-20 animate-pulse"></div>
      <div className="h-6 bg-gray-50 rounded-full w-24 animate-pulse"></div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
    <style jsx>{`
      @keyframes shimmer {
        100% { transform: translateX(100%); }
      }
    `}</style>
  </div>
);

export const Spinner = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`${sizes[size]} border-navy/10 border-t-navy rounded-full animate-spin shadow-sm`}></div>
    </div>
  );
};

export const GlobalLoading = () => (
  <div className="fixed inset-0 top-[56px] bg-[#F8FAFC] z-[50] flex flex-col items-center justify-center space-y-6">
    <Spinner size="lg" />
    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/30 animate-pulse">
      Initialising Secure Session...
    </div>
  </div>
);
