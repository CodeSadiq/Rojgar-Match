'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import { getRegistryData } from '@/lib/data-service';

export default function AdminPage() {
  const [publishedJobs, setPublishedJobs] = useState<any[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);

  const fetchPublishedJobs = async () => {
    setIsLoadingJobs(true);
    try {
      const res = await fetch('/api/jobs');
      if (res.ok) {
        const data = await res.json();
        setPublishedJobs(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch jobs:', e);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchPublishedJobs();
  }, []);

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this recruitment record permanently?')) return;
    try {
      const res = await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPublishedJobs();
      } else {
        const d = await res.json();
        alert('Deletion failed: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error during deletion');
    }
  };

  // ── FUZZY MATCHING LOGIC ──────────────────────
  const isFuzzyMatch = (target: any, searchQuery: string) => {
    const t = String(target || "").toLowerCase();
    const q = searchQuery.toLowerCase();
    if (t.includes(q)) return true;
    if (q.length < 3) return false;

    const levDist = (s1: string, s2: string) => {
      const d: number[][] = [];
      for (let i = 0; i <= s1.length; i++) d[i] = [i];
      for (let j = 0; j <= s2.length; j++) d[0][j] = j;
      for (let i = 1; i <= s1.length; i++) {
        for (let j = 1; j <= s2.length; j++) {
          const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
          d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        }
      }
      return d[s1.length][s2.length];
    };

    const words = t.split(/[\s,]+/);
    const threshold = q.length > 5 ? 2 : 1;
    return words.some(word => levDist(word, q) <= threshold);
  };

  const filteredJobs = publishedJobs.filter(job => {
    const queryTerms = adminSearchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return queryTerms.length === 0 || queryTerms.every(term => 
      isFuzzyMatch(job.title, term) ||
      isFuzzyMatch(job.organization || job.org, term) ||
      isFuzzyMatch(job.id, term) ||
      (job.tags || []).some((t: string) => isFuzzyMatch(t, term))
    );
  });


  const [activeTab, setActiveTab] = useState<'recruitment' | 'bulletin'>('recruitment');
  const [bulletinSearch, setBulletinSearch] = useState('');
  const [dynamicRegistry, setDynamicRegistry] = useState<any>(null);

  useEffect(() => {
    setDynamicRegistry(getRegistryData());
  }, []);

  // BULLETIN DATA LOGIC (Archival Manifests only)
  const allBulletins = dynamicRegistry ? [
    ...(dynamicRegistry.categories['Important'] || []).map((n: any) => ({ ...n, category: 'IMPORTANT' })),
    ...(dynamicRegistry.categories['Admission'] || []).map((n: any) => ({ ...n, category: 'ADMISSION' })),
    ...(dynamicRegistry.categories['Syllabus'] || []).map((n: any) => ({ ...n, category: 'SYLLABUS' })),
    ...(dynamicRegistry.categories['Result'] || []).map((n: any) => ({ ...n, category: 'RESULT' })),
    ...(dynamicRegistry.categories['Admit Card'] || []).map((n: any) => ({ ...n, category: 'ADMIT CARD' })),
  ] : [];

  const filteredBulletins = allBulletins.filter(b => 
    b.text.toLowerCase().includes(bulletinSearch.toLowerCase()) || 
    b.id.toLowerCase().includes(bulletinSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-10 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* UNIFIED COMMAND HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
           <div className="space-y-1">
             <h1 className="text-2xl font-black text-navy uppercase tracking-tighter">Command Registry</h1>
             <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest leading-none">Institutional Control Console</p>
           </div>
           
           <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
              <button 
                onClick={() => setActiveTab('recruitment')}
                className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'recruitment' ? 'bg-navy text-white shadow-lg' : 'bg-transparent text-navy/40 hover:text-navy'}`}
              >
                Recruitments
              </button>
              <button 
                onClick={() => setActiveTab('bulletin')}
                className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'bulletin' ? 'bg-navy text-white shadow-lg' : 'bg-transparent text-navy/40 hover:text-navy'}`}
              >
                Bulletins
              </button>
           </div>
        </div>

        {activeTab === 'recruitment' ? (
          /* RECRUITMENT SECTION */
          <div className="space-y-6 animate-in slide-in-from-left duration-500">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="SEARCH RECRUITMENT REGISTRY..."
                  value={adminSearchQuery}
                  onChange={(e) => setAdminSearchQuery(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-4 rounded-xl text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-12 shadow-sm outline-none focus:border-navy transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <Link
                href="/admin/editor"
                className="px-8 py-4 bg-navy text-white rounded-xl text-[11px] font-black uppercase tracking-widest no-underline hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Assemble New Listing <span className="text-lg leading-none">+</span>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
              {isLoadingJobs ? (
                <div className="py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest animate-pulse">Syncing Registry...</div>
              ) : filteredJobs.length === 0 ? (
                <div className="py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest">No matching records found</div>
              ) : (
                filteredJobs.map((job) => (
                  <div key={job.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        <code className="text-[9px] font-black text-navy/30 uppercase tracking-widest">{job.id}</code>
                      </div>
                      <h3 className="text-base font-serif font-bold text-navy truncate">{job.title}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/editor?id=${job.id}`} className="px-5 py-2 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-lg no-underline hover:bg-slate-800">Edit</Link>
                      <button onClick={() => handleDeleteJob(job.id)} className="px-5 py-2 text-red-500 text-[9px] font-black uppercase tracking-widest hover:text-red-700 bg-transparent border-none">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* BULLETIN SECTION */
          <div className="space-y-6 animate-in slide-in-from-right duration-500">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="SEARCH BULLETIN MANIFEST..."
                  value={bulletinSearch}
                  onChange={(e) => setBulletinSearch(e.target.value)}
                  className="w-full bg-white border border-gray-200 p-4 rounded-xl text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-12 shadow-sm outline-none focus:border-navy transition-all"
                />
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <Link
                href="/admin/bulletin-editor"
                className="px-8 py-4 bg-navy text-white rounded-xl text-[11px] font-black uppercase tracking-widest no-underline hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                New Broadcast <span className="text-lg leading-none">+</span>
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 shadow-sm">
              {filteredBulletins.length === 0 ? (
                <div className="py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest">No bulletins manifest found</div>
              ) : (
                filteredBulletins.map((b) => (
                  <div key={b.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-2 py-0.5 bg-navy/5 text-navy/50 text-[8px] font-black uppercase tracking-widest rounded border border-navy/10">
                          {b.category}
                        </span>
                        <code className="text-[9px] font-black text-navy/20 tracking-tighter uppercase">{b.id}</code>
                      </div>
                      <h3 className="text-base font-serif font-bold text-navy truncate">{b.text}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/bulletin-editor?id=${b.id}`} className="px-5 py-2 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-lg no-underline hover:bg-slate-800">Edit</Link>
                      <button onClick={() => alert('Record decommissioning requested.')} className="px-5 py-2 text-red-500 text-[9px] font-black uppercase tracking-widest hover:text-red-700 bg-transparent border-none">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
