'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5">
      <main className="max-w-[800px] mx-auto px-6 py-20 pb-40">
        
        <Link href="/" className="inline-flex items-center gap-2 text-navy/40 hover:text-navy transition-all no-underline mb-12 group">
          <IconArrowLeft />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>

        {/* ── HELP CENTER ── */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-10 leading-tight">Help Center</h1>
          <div className="bg-gray-50 p-10 md:p-16 rounded-[40px] border border-gray-100">
            <h2 className="text-3xl font-serif font-bold mb-6">Institutional Support</h2>
            <p className="text-navy/60 leading-relaxed mb-10 max-w-[500px]">
              Our support team is available for technical assistance, reporting data inaccuracies, or answering 
              questions about our matching logic.
            </p>
            
            <div className="space-y-8">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/30 mb-2">Institutional Email</p>
                <a href="mailto:sadiq.imam404@gmail.com" className="text-lg md:text-2xl text-navy font-black no-underline border-b-2 border-transparent hover:border-navy transition-all pb-1 break-all">
                  sadiq.imam404@gmail.com
                </a>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/30 mb-2">Direct Helpline</p>
                <a href="tel:+918951214641" className="text-xl md:text-2xl text-navy font-black tracking-widest no-underline border-b-2 border-transparent hover:border-navy transition-all pb-1">
                  +91-8951214641
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
