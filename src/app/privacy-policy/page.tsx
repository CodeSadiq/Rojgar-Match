'use client';

import React from 'react';
import Link from 'next/link';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-navy selection:bg-navy/5">
      <main className="max-w-[800px] mx-auto px-6 py-20 pb-40">
        
        <Link href="/" className="inline-flex items-center gap-2 text-navy/40 hover:text-navy transition-all no-underline mb-12 group">
          <IconArrowLeft />
          <span className="text-[11px] font-black uppercase tracking-[0.2em]">Return Home</span>
        </Link>

        {/* ── PRIVACY POLICY ── */}
        <section className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-navy mb-10 leading-tight">Privacy Policy</h1>
          <div className="prose prose-slate max-w-[650px] text-navy/60 space-y-6">
            <p>
              Your privacy is our primary commitment. Rojgar Match stores your sensitive academic data locally on your device 
              using your browser's secure storage. 
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Numerical and academic data is never sold to third-party advertisers.</li>
              <li>Your profile information is only used to calculate job eligibility in real-time.</li>
              <li>You can clear your entire profile and registry history at any time from the Profile page.</li>
            </ul>
            <p>
              We do not track your identity or browsing habits. Our mission is to match you with career opportunities, 
              not to harvest your personal information.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
