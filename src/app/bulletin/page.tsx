'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { NOTIFICATIONS } from '@/lib/data';
import { getRegistryData } from '@/lib/data-service';
import { getTimeAgo } from '@/lib/helpers';

export default function BulletinRegistryPage() {
  const [registry, setRegistry] = useState<any>(null);

  useEffect(() => {
    setRegistry(getRegistryData());
  }, []);

  const bulletinList = React.useMemo(() => {
    if (!registry) return NOTIFICATIONS;
    return registry.notifications || NOTIFICATIONS;
  }, [registry]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5">
      <main className="flex-1 max-w-[1440px] mx-auto w-full p-6 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <header className="mb-16 border-b border-gray-200 pb-10">
          <h1 className="text-3xl font-black text-navy uppercase tracking-tight">Bulletin Index.</h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest mt-3 text-[11px]">Official Verified Government Announcements and Recruitment Bulletins</p>
        </header>

        <div className="space-y-12">
          {bulletinList.map((n: any, i: number) => (
            <div key={i} className="border-b border-gray-200 pb-12 last:border-0 last:pb-0 group">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-4">
                {n.createdAt ? getTimeAgo(n.createdAt) : n.time}
              </span>
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
          RojgarMatch Verification Protocol — Baseline Manifest Version 2.0.4
        </p>
      </main>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-10 px-6 md:px-12 mt-auto text-center">
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">© 2026 RojgarMatch Institutional Manifest</p>
      </footer>
    </div>
  );
}
