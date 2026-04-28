'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getRegistryData } from '@/lib/data-service';
import { getTimeAgo } from '@/lib/helpers';
import ForceScrollTop from '@/components/ForceScrollTop';
import { getCachedRegistry, setCachedRegistry } from '@/lib/store';

const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconCheckGreen = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;

export default function BulletinViewer() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [registry, setRegistry] = React.useState<any>(null);

  React.useEffect(() => {
    async function loadRegistry() {
      const cached = getCachedRegistry();
      if (cached) {
        setRegistry(cached);
        return;
      }
      const data = await getRegistryData();
      setRegistry(data);
      setCachedRegistry(data);
    }
    loadRegistry();
  }, []);

  // Find the bulletin in either primary NOTIFICATIONS or CATEGORY_DATA
  let notification: any = null;

  if (registry) {
    notification = registry.notifications.find((n: any) => n.id === id);

    if (!notification) {
      Object.values(registry.categories).forEach((list: any) => {
        const found = list.find((item: any) => item.id === id);
        if (found) notification = found;
      });
    }
  }

  if (!notification && registry) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-navy/10 mb-4 uppercase tracking-tighter">Content Absent</h1>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-8">The requested bulletin manifest (ID: {id}) could not be retrieved.</p>
        <Link href="/" className="px-8 py-3 bg-navy text-white rounded-full text-[11px] font-black uppercase tracking-widest no-underline">Return to Dashboard</Link>
      </div>
    );
  }

  if (!notification) return null; // Wait for registry

  return (
    <div className="jd min-h-screen bg-[#fafaf9] flex flex-col font-sans selection:bg-navy/5">
      <ForceScrollTop />
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
        </header>

        {/* 📄 Formatted Briefing */}
        <div className="max-w-[700px] mr-auto">
          <div className="space-y-6">
            <div className="jd-content">
              {notification.desc}
            </div>

            {/* 🔗 Institutional Verification Channels */}
            {notification.links && notification.links.length > 0 && (
              <div className="flex flex-col gap-3 pt-2">
                {notification.links.map((link: any, i: number) => (
                  <a
                    key={i}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 group no-underline"
                  >
                    <span className="text-[13px] font-bold text-navy group-hover:text-blue-600 border-b border-transparent group-hover:border-blue-600/30 transition-all uppercase tracking-tight">{link.title}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20 group-hover:text-blue-600 transition-all"><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                ))}
              </div>
            )}
          </div>

          <div className="pt-8 space-y-8">
            {notification.routedTo && (
              <Link href={notification.routedTo} className="px-10 py-3.5 bg-navy text-white text-[11px] font-black uppercase tracking-[0.15em] rounded-full no-underline hover:bg-slate-800 transition-all text-center inline-block shadow-lg shadow-navy/20">
                view Details ➜
              </Link>
            )}

            <div className="space-y-4 pt-8 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                  <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.1em] font-mono whitespace-nowrap">
                    Published {notification.createdAt ? getTimeAgo(notification.createdAt) : notification.time}
                  </span>
                </div>
                <span className="hidden md:block w-1 h-3 bg-gray-200"></span>
                <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.1em] font-mono whitespace-nowrap">
                  {notification.category || 'Institutional'}
                </span>

                {/* Classification Tags Integration into Primary Metadata Line */}
                {notification.tags && notification.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-x-3">
                    <span className="hidden md:block w-1 h-3 bg-gray-200"></span>
                    {notification.tags.map((tag: string, i: number) => (
                      <span key={i} className="text-[9px] font-black text-navy/30 uppercase tracking-widest italic hover:text-navy transition-colors whitespace-nowrap">#{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
