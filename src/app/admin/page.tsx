'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

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

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-14 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1240px] mx-auto space-y-12 animate-in fade-in duration-700">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-12 border-b-2 border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-navy animate-pulse"></div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy/30">Admin Registry</h2>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-navy uppercase leading-none tracking-tighter">
              Recruitment Manager
            </h1>
          </div>

          <Link
            href="/admin/editor"
            className="flex items-center gap-3 px-6 py-3 bg-navy text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-navy/20 no-underline"
          >
            Add New Job <span className="text-xl">+</span>
          </Link>
        </div>

        {/* MANAGEMENT SECTION */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white border-2 border-gray-200 p-4 rounded-xl shadow-sm">
            <label className="relative flex-1 group cursor-text flex items-center min-h-[44px]">
              <input
                type="text"
                placeholder="SEARCH RECRUITMENT REGISTRY (ID, TITLE, ORG)..."
                value={adminSearchQuery}
                onChange={(e) => setAdminSearchQuery(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-10 ring-0 focus:ring-0"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-navy/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </label>
            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[9px] font-black text-navy/30 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                Total Records: {publishedJobs.length}
              </span>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="space-y-4">
            {isLoadingJobs ? (
              <div className="py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest animate-pulse bg-white border-2 border-gray-100 rounded-3xl">
                Accessing National Registry...
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="py-20 text-center text-[10px] font-black text-navy/10 uppercase tracking-widest bg-white border-2 border-gray-100 rounded-3xl">
                No matching recruitment records found
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className={`p-5 md:p-8 rounded-[28px] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors duration-300 group relative border-[1.5px] ${adminSearchQuery ? 'bg-navy/[0.03] border-navy' : 'bg-white border-gray-200'}`}>
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-md border border-green-100 flex items-center gap-2 shrink-0">
                        <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></span>
                        Published
                      </span>
                      <code className="text-[9px] font-black text-navy/60 uppercase tracking-widest bg-navy/5 px-2 py-1 rounded border border-navy/10">{job.id}</code>
                    </div>
                    <h3 className="text-lg md:text-2xl font-serif font-bold text-navy leading-tight group-hover:text-navy transition-colors">{job.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-gray-50">
                    <Link
                      href={`/admin/editor?id=${job.id}`}
                      className="flex-1 md:flex-none px-6 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-navy/90 transition-all shadow-lg shadow-navy/10 no-underline text-center"
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="flex-1 md:flex-none px-6 py-3 bg-red-50 text-red-500 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}
