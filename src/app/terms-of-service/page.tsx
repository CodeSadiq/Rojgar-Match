'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5">
      <main className="max-w-[800px] mx-auto px-6 py-20 pb-40">
        
        <Link href="/" className="inline-flex items-center gap-2 text-navy/40 hover:text-navy transition-all no-underline mb-12 group">
          <IconArrowLeft />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>

        {/* ── TERMS OF SERVICE ── */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-10 leading-tight">Terms of Service</h1>
          <div className="prose prose-slate max-w-[650px] text-navy/60 space-y-6">
            <p className="font-bold text-navy">
              Agreement to Terms
            </p>
            <p>
              By using Rojgar Match, you agree to ensure the accuracy of the academic data you provide. The information 
              displayed on this platform is curated from official government gazettes and recruitment notifications.
            </p>
            <p>
              While we strive for 100% accuracy in our matching engine, users are advised to verify details with the 
              original recruitment notification linked in each post.
            </p>
            <hr className="border-gray-100 my-8" />
            <p className="font-bold text-navy">
              No Government Affiliation
            </p>
            <p>
              Rojgar Match is an independent platform designed to simplify recruitment tracking. We are not officially 
              affiliated with any government body, though we use official public data to provide our services.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
