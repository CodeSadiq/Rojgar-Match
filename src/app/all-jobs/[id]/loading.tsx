import React from 'react';
import { Spinner } from '@/components/LoadingState';

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-500">
      <div className="scale-125">
        <Spinner size="lg" />
      </div>
      <div className="space-y-3">
        <h2 className="font-serif text-2xl font-bold text-navy/80">Loading Job Notification</h2>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/30">
          Fetching Official Recruitment Details
        </p>
      </div>
      
      {/* Decorative Skeleton masthead */}
      <div className="w-full max-w-[800px] mt-12 space-y-6 opacity-20">
        <div className="h-1 bg-navy/10 w-full"></div>
        <div className="h-12 bg-navy/5 w-3/4 mx-auto rounded-lg"></div>
        <div className="h-4 bg-navy/5 w-1/2 mx-auto rounded-md"></div>
      </div>
    </div>
  );
}
