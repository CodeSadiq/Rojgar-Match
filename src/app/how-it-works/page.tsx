'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5">
      <main className="max-w-[800px] mx-auto px-6 py-20 pb-40">

        <Link href="/" className="inline-flex items-center gap-2 text-navy/40 hover:text-navy transition-all no-underline mb-12 group">
          <IconArrowLeft />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>

        {/* ── HOW IT WORKS ── */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-10 leading-tight">How it Works</h1>
          <div className="space-y-12">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2563EB] mb-4">Step 01</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">The Multi-Level Registry</h2>
              <p className="text-navy/60 leading-relaxed max-w-[650px]">
                Unlike traditional platforms that only ask for your latest degree, Rojgar Match builds a complete academic manifest.
                You can record your 10th, 12th, Diploma, and Graduation details simultaneously. This ensures our matching engine knows
                the full breadth of your eligibility.
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2563EB] mb-4">Step 02</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">Independent Eligibility Logic</h2>
              <p className="text-navy/60 leading-relaxed max-w-[650px]">
                Our engine evaluates every qualification in your profile independently. If a job requires a 10th-pass (like SSC MTS)
                but you have a B.Tech, the system still identifies the match. You will never miss an opportunity because you are
                "over-qualified."
              </p>
            </div>

            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#2563EB] mb-4">Step 03</h3>
              <h2 className="text-2xl font-serif font-bold mb-4">Personalized Feed</h2>
              <p className="text-navy/60 leading-relaxed max-w-[650px]">
                Your "For You" feed is a live mirror of your academic registry. Every job card explicitly states why you matched
                (e.g., <strong>"Matched on 10th, 12th"</strong>), providing total transparency into your daily recruitment opportunities.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
