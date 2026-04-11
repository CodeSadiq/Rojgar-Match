'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { CATEGORY_DATA } from '@/lib/data';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Map slug back to category name
  const categoryMap: Record<string, string> = {
    'admission': 'Admission',
    'syllabus': 'Syllabus',
    'result': 'Result',
    'admit-card': 'Admit Card',
    'important': 'Important',
    'all-jobs': 'All Jobs'
  };

  const categoryName = categoryMap[slug] || 'Notifications';
  const data = CATEGORY_DATA[categoryName] || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-1 max-w-[1440px] mx-auto p-4 md:p-12 w-full animate-in fade-in duration-700">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-navy transition-colors mb-8 md:mb-12 no-underline"
        >
          <IconArrowLeft /> Back to Dashboard
        </Link>

        <header className="mb-8 md:mb-14 border-b-2 md:border-b-4 border-navy pb-6 md:pb-10">
          <div className="mb-2 md:mb-4">
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-navy uppercase leading-tight">{categoryName}.</h1>
          </div>
          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
            Institutional Registry for {categoryName} announcements.
          </p>
        </header>

        {data.length > 0 ? (
          <div className="space-y-0 translate-y-[-20px]">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col md:flex-row md:items-center justify-between py-6 md:py-8 border-b-2 border-navy/5 hover:bg-white/40 transition-all group gap-4 px-2"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 md:gap-3 mb-1.5 md:mb-2 text-nowrap">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 bg-navy/20 rounded-full group-hover:bg-navy transition-colors"></span>
                    <div className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-navy/40">{item.time}</div>
                  </div>
                  <h3 className="text-sm md:text-xl font-bold text-navy leading-tight line-clamp-2 md:line-clamp-none">
                    {item.text}
                  </h3>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 pt-2 md:pt-0 border-t border-navy/5 md:border-t-0 mt-2 md:mt-0">
                  <div className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-[#2563EB] bg-[#2563EB]/5 px-2 md:px-3 py-1 rounded">Official Notification</div>
                  <button className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-navy hover:text-white bg-white/40 border-2 border-navy/5 hover:bg-navy px-4 md:px-6 py-2.5 md:py-3 transition-all rounded-lg whitespace-nowrap">
                    Check Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 p-10 md:p-20 text-center rounded-2xl md:rounded-3xl flex flex-col items-center justify-center">
            <p className="text-sm md:text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
              The {categoryName} registry is currently being synchronized. Please check back later.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
