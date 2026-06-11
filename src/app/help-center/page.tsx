'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5">
      <main className="max-w-[800px] mx-auto px-6 py-20 pb-40">

        {/* ── HELP CENTER ── */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-10 leading-tight">Help Center</h1>
          
          <div className="prose prose-slate max-w-[650px] text-navy/60 space-y-12">
            <p className="text-lg">
              Our support team is dedicated to assisting with technical verification, data synchronization issues, 
              or any questions regarding the recruitment matching protocol.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/30">Institutional Support</p>
                <div className="flex flex-col gap-1">
                  <a href="mailto:sadiq.imam404@gmail.com" className="text-lg font-bold text-navy no-underline hover:text-blue-600 transition-colors">
                    sadiq.imam404@gmail.com
                  </a>
                  <p className="text-[11px] font-medium italic">Standard response time: 24-48 hours</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/30">Direct Verification line</p>
                <div className="flex flex-col gap-1">
                  <a href="tel:+918951214641" className="text-lg font-bold text-navy no-underline hover:text-blue-600 transition-colors tracking-widest">
                    +91 8951214641
                  </a>
                  <p className="text-[11px] font-medium italic">Available Mon-Fri, 10:00 - 18:00 IST</p>
                </div>
              </div>
            </div>

            <p className="pt-8 border-t border-gray-100">
              For security reasons, please do not share your browser's local storage keys or detailed profile JSON 
              payloads in clear text via email. Our team will never ask for your private authentication tokens.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
