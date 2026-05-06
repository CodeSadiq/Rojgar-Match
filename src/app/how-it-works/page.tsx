'use client';

import React from 'react';
import BackButton from '@/components/BackButton';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5 selection:text-navy">
      <main className="max-w-[800px] mx-auto px-6 py-12 md:py-20 pb-40">

        {/* 🔙 BACK NAVIGATION */}
        <div className="mb-12 md:mb-20 animate-in fade-in duration-500">
          <BackButton />
        </div>

        {/* 🏛 THE PROTOCOL */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-7xl font-serif font-bold text-navy mb-4 leading-tight tracking-tight">
            How it Works
          </h1>
          <p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] text-navy/30 mb-16 md:mb-24">
            Simple. Automated. Accurate.
          </p>

          <div className="space-y-16 md:space-y-24">

            {/* STEP 01 */}
            <div className="space-y-4">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-navy/40">Step 01</h3>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy/90">Smart Filtering</h2>
              <p className="text-[16px] md:text-[20px] text-navy/60 leading-relaxed font-medium">
                Rojgar Match finds government jobs for you based on three things: your <span className="text-navy font-bold">Course</span>, your <span className="text-navy font-bold">Branch</span>, and your <span className="text-navy font-bold">Gender</span>.
              </p>
            </div>

            {/* STEP 02 */}
            <div className="space-y-4">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-navy/40">Step 02</h3>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy/90">Why it helps you</h2>
              <p className="text-[16px] md:text-[20px] text-navy/60 leading-relaxed font-medium">
                Every job has different rules for age or experience, but matching by your <span className="text-navy font-bold">Education</span> is the best way to find jobs that truly fit you. It saves you time and effort.
              </p>
            </div>

            {/* STEP 03 */}
            <div className="space-y-4">
              <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-navy/40">Step 03</h3>
              <h2 className="text-2xl md:text-4xl font-serif font-bold text-navy/90">Instant Email Alerts</h2>
              <p className="text-[16px] md:text-[20px] text-navy/60 leading-relaxed font-medium">
                You don't have to check the website every day. We will send you an <strong>Email</strong> the same moment a job matching your profile is published.
              </p>
            </div>

          </div>
        </section>

      </main>
    </div>
  );
}
