'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { NOTIFICATIONS } from '@/lib/data';

export default function BulletinRegistryPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5">
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-16 border-b border-gray-200 pb-10">
          <h1 className="text-3xl font-black text-navy uppercase tracking-tight">Bulletin Index.</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-3 text-[11px]">Official Verified Government Announcements and Recruitment Bulletins</p>
        </header>

        <div className="space-y-12">
          {NOTIFICATIONS.map((n, i) => (
            <div key={i} className="border-b border-gray-100 pb-12 last:border-0 last:pb-0 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">{n.time}</span>
              <h4 className="text-[18px] font-bold text-navy mb-3 leading-snug group-hover:text-[#2563EB] transition-colors">{n.text}</h4>
              <p className="text-[14px] text-gray-600 font-medium leading-relaxed mb-6">{n.desc}</p>
              <Link 
                href={`/bulletin/${n.id}`}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy bg-white border border-gray-200 px-6 py-2.5 rounded-lg hover:bg-navy hover:text-white transition-all no-underline"
              >
                View Manifest Details ➜
              </Link>
            </div>
          ))}
        </div>
        
        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-24">
          GovRecruit Verification Protocol — Baseline Manifest Version 2.0.4
        </p>
      </main>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6 md:px-12 mt-auto text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">© 2026 GovRecruit Institutional Manifest</p>
      </footer>
    </div>
  );
}

