'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';

const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconCheckGreen = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

export default function BulletinViewer() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Find the bulletin in either primary NOTIFICATIONS or CATEGORY_DATA
  let notification = NOTIFICATIONS.find(n => n.id === id);

  if (!notification) {
    Object.values(CATEGORY_DATA).forEach(list => {
      const found = list.find(item => item.id === id);
      if (found) notification = found;
    });
  }

  if (!notification) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-navy/10 mb-4 uppercase tracking-tighter">Content Absent</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">The requested bulletin manifest (ID: {id}) could not be retrieved.</p>
        <Link href="/" className="px-8 py-3 bg-navy text-white rounded-full text-[11px] font-black uppercase tracking-widest no-underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="jd min-h-screen bg-[#fafaf9] flex flex-col font-sans selection:bg-navy/5">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');
        
        .jd {
          --serif:  'Libre Baskerville', Georgia, serif;
          --sans:   'Source Sans 3', system-ui, sans-serif;
          --mono:   'Roboto Mono', monospace;
          --navy:   #1e3a5f;
          --ink:    #1c1917;
          --border: #d6d3d1;
          
          font-family: var(--sans);
          color: var(--ink);
        }

        .jd-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px 40px 120px;
        }

        .jd-eyebrow {
           font-family: var(--mono);
           font-size: 10px;
           font-weight: 500;
           letter-spacing: 0.14em;
           text-transform: uppercase;
           color: #78716c;
           margin-bottom: 24px;
           display: flex;
           align-items: center;
           gap: 12px;
        }
        .jd-eyebrow::before, .jd-eyebrow::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #d6d3d1;
        }
        .jd-title {
          font-family: var(--serif);
          font-size: clamp(20px, 3.5vw, 28px);
          font-weight: 700;
          line-height: 1.25;
          color: #1e3a5f;
          text-align: left;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .jd-meta {
          font-family: var(--mono);
          font-size: 10px;
          color: #78716c;
          text-align: left;
          margin-bottom: 32px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .jd-content {
          font-family: var(--serif);
          font-size: 15px;
          line-height: 1.7;
          color: #1c1917;
          border-left: 2px solid #1e3a5f;
          padding-left: 18px;
          margin: 32px 0;
          opacity: 0.9;
        }
      `}</style>

      <main className="jd-wrap animate-in fade-in duration-700">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] text-navy/40 hover:text-navy transition-all mb-8 pt-0 -ml-2 md:-ml-4 no-underline bg-transparent border-none cursor-pointer group"
        >
          <div className="w-9 h-9 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 group-hover:bg-navy group-hover:text-white transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </div>
          Back
        </button>

        {/* 🏛 Institutional Header */}
        <header className="mb-10 pt-6">
           <h1 className="jd-title">{notification.text}</h1>
           <div className="jd-meta">Broadcasted {notification.time}</div>
        </header>

        {/* 📄 Formatted Briefing (Simplified & Compact) */}
        <div className="max-w-[700px] mr-auto">
           <div className="jd-content">
              {notification.desc}
           </div>

           <div className="pt-12 flex justify-start">
              <Link href="/all-jobs" className="px-10 py-3.5 bg-navy text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-lg no-underline hover:bg-slate-800 transition-all text-center">
                View Details ➜
              </Link>
           </div>
        </div>

      </main>
    </div>
  );
}
