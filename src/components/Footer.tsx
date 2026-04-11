'use client';

import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0D244D] border-t border-white/5 py-12 md:py-20 px-6 md:px-12 mt-auto w-full">
      <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10 md:gap-16">
        <div className="flex items-center gap-4">
          <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm">
            <img src="/logo.png" alt="Rojgar Match" className="w-7 h-7 object-contain" />
          </div>
          <div className="flex flex-col">
            <strong className="text-white text-[14px] font-black uppercase tracking-[0.3em]">Rojgar Match</strong>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mt-1.5">Real-time Recruitment Matching</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
          <Link href="/how-it-works" className="text-[11px] text-white/40 font-bold uppercase tracking-widest hover:text-white transition-all no-underline">How it Works</Link>
          <Link href="/privacy-policy" className="text-[11px] text-white/40 font-bold uppercase tracking-widest hover:text-white transition-all no-underline">Privacy Policy</Link>
          <Link href="/terms-of-service" className="text-[11px] text-white/40 font-bold uppercase tracking-widest hover:text-white transition-all no-underline">Terms of Service</Link>
          <Link href="/help-center" className="text-[11px] text-white/40 font-bold uppercase tracking-widest hover:text-white transition-all no-underline">Help Center</Link>
          <p className="text-[11px] text-white/10 font-bold uppercase tracking-[0.15em] md:ml-16">© 2026 ROJGAR MATCH</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
