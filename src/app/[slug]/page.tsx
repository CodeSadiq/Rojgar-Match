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
          <div className="flex flex-col gap-3">
            {data.map((item, idx) => (
              <Link
                key={idx}
                href={`/bulletin/${item.id}`}
                className="group bg-white border border-gray-100 rounded-xl p-4 md:p-6 flex items-center justify-between gap-4 no-underline hover:bg-gray-50 hover:border-gray-200 transition-all mb-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 truncate">{item.time}</span>
                  </div>

                  <h3 className="text-[14px] md:text-lg font-bold text-navy leading-snug group-hover:text-blue-700 transition-colors line-clamp-2">
                    {item.text}
                  </h3>
                </div>

                {/* 🔘 Action */}
                <div className="text-navy/20 group-hover:text-navy group-hover:translate-x-1 transition-all shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </Link>
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
