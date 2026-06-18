'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import { getRegistryData } from '@/lib/data-service';
import { daysFromNow } from '@/lib/helpers';

function AdminPageContent() {
  const [publishedJobs, setPublishedJobs] = useState<any[]>([]);
  const [adminSearchQuery, setAdminSearchQuery] = useState('');
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [filterExpired, setFilterExpired] = useState(false);

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
    const lastDate = job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate;
    const isExpired = lastDate ? (daysFromNow(lastDate) ?? 0) < 0 : false;

    if (filterExpired && !isExpired) return false;

    const queryTerms = adminSearchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return queryTerms.length === 0 || queryTerms.every(term =>
      isFuzzyMatch(job.title, term) ||
      isFuzzyMatch(job.organization || job.org, term) ||
      isFuzzyMatch(job.id, term) ||
      (job.tags || []).some((t: string) => isFuzzyMatch(t, term))
    );
  });


  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'recruitment' | 'bulletin'>('recruitment');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'bulletin') setActiveTab('bulletin');
    else if (tab === 'recruitment') setActiveTab('recruitment');
  }, [searchParams]);
  const [bulletinSearch, setBulletinSearch] = useState('');
  const [dynamicRegistry, setDynamicRegistry] = useState<any>(null);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');


  const fetchBulletins = async () => {
    const data = await getRegistryData(true);
    setDynamicRegistry(data);
  };

  const fetchDbCategories = async () => {
    try {
      const res = await fetch('/api/bulletin-categories?all=true');
      if (res.ok) {
        const data = await res.json();
        setDbCategories(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchBulletins();
    fetchDbCategories();
  }, []);

  const handleDeleteBulletin = async (id: string) => {
    if (!window.confirm('Decommission this bulletin manifest permanently?')) return;
    try {
      const res = await fetch(`/api/bulletins?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchBulletins();
      } else {
        const d = await res.json();
        alert('Decommissioning failed: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error during decommissioning');
    }
  };

  const handleToggleBulletinVisibility = async (bulletin: any) => {
    const nextActive = bulletin.active === false ? true : false;
    try {
      const payload = {
        id: bulletin.id,
        text: bulletin.text,
        desc: bulletin.desc,
        time: bulletin.time,
        links: bulletin.links,
        routedTo: bulletin.routedTo,
        tags: bulletin.tags,
        active: nextActive,
        category: bulletin.dbCategory
      };

      const res = await fetch('/api/bulletins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchBulletins();
      } else {
        const d = await res.json();
        alert('Visibility toggle failed: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error during visibility toggle');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const res = await fetch('/api/bulletin-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim(), active: true })
      });

      if (res.ok) {
        setNewCategoryName('');
        fetchDbCategories();
        fetchBulletins();
      } else {
        const d = await res.json();
        alert('Failed to add category: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error when adding category');
    }
  };

  const handleToggleCategoryActive = async (cat: any) => {
    const nextActive = cat.active === false ? true : false;
    const actionText = nextActive ? 'show' : 'hide';
    if (!window.confirm(`Are you sure you want to ${actionText} the "${cat.name}" panel and all its bulletins?`)) return;

    try {
      const res = await fetch('/api/bulletin-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cat.name, active: nextActive })
      });

      if (res.ok) {
        fetchDbCategories();
        fetchBulletins();
      } else {
        const d = await res.json();
        alert('Failed to toggle category: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error toggling category');
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (!window.confirm(`Are you sure you want to delete the custom panel "${name}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`/api/bulletin-categories?name=${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchDbCategories();
        fetchBulletins();
      } else {
        const d = await res.json();
        alert('Failed to delete category: ' + (d.error || 'Unknown error'));
      }
    } catch (e) {
      console.error(e);
      alert('Network error deleting category');
    }
  };

  // BULLETIN DATA LOGIC (Archival Manifests only)
  const allBulletins = dynamicRegistry ? [
    ...(dynamicRegistry.notifications || []).map((n: any) => ({ ...n, displayCategory: 'IMPORTANT', dbCategory: 'Important' })),
    ...Object.entries(dynamicRegistry.categories).flatMap(([cat, list]: [string, any]) =>
      list.map((item: any) => ({ ...item, displayCategory: cat.toUpperCase(), dbCategory: cat }))
    )
  ] : [];

  const filteredBulletins = allBulletins.filter(b =>
    b.text.toLowerCase().includes(bulletinSearch.toLowerCase()) ||
    b.id.toLowerCase().includes(bulletinSearch.toLowerCase())
  ).sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-10 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1100px] mx-auto space-y-8 animate-in fade-in duration-700">

        {/* UNIFIED COMMAND HEADER */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-navy uppercase tracking-tighter">Command Registry</h1>
            <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest leading-none">Institutional Control Console</p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/admin/limits"
              className="px-6 py-2.5 bg-white border border-gray-200 text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all no-underline flex items-center gap-2 shadow-sm"
            >
              ⚙️ System Limits
            </Link>
            <Link
              href="/admin/users"
              className="px-6 py-2.5 bg-navy text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all flex items-center gap-2 shadow-md no-underline"
            >
              📊 Analyse Users
            </Link>
            <Link
              href="/admin/registry"
              className="px-6 py-2.5 bg-white border border-gray-200 text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all no-underline flex items-center gap-2 shadow-sm"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              Edit Candidate Form
            </Link>
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
              <button
                onClick={() => setFilterExpired(!filterExpired)}
                className={`px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border-2 ${filterExpired ? 'bg-red-600 border-red-600 text-white' : 'bg-white border-gray-100 text-navy/40 hover:text-navy hover:border-gray-200'}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                {filterExpired ? 'All Posts' : `Find Expired (${publishedJobs.filter(job => {
                  const ld = job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate;
                  return ld ? (daysFromNow(ld) ?? 0) < 0 : false;
                }).length})`}
              </button>
              <Link
                href="/admin/editor"
                className="px-8 py-4 bg-navy text-white rounded-xl text-[11px] font-black uppercase tracking-widest no-underline hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                Assemble New Listing <span className="text-lg leading-none">+</span>
              </Link>
            </div>

            {filterExpired && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">⚠ Currently showing only expired recruitments for cleanup</span>
                <button onClick={() => setFilterExpired(false)} className="text-[10px] font-black uppercase tracking-widest text-red-600 underline bg-transparent border-none cursor-pointer">Clear Filter</button>
              </div>
            )}

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
                        <span className={`w-1.5 h-1.5 rounded-full ${(() => {
                          const ld = job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate;
                          const expired = ld ? (daysFromNow(ld) ?? 0) < 0 : false;
                          return expired ? 'bg-red-500' : 'bg-green-500';
                        })()}`}></span>
                        <code className="text-[9px] font-black text-navy/30 uppercase tracking-widest">{job.id}</code>
                        {(() => {
                          const ld = job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate;
                          const expired = ld ? (daysFromNow(ld) ?? 0) < 0 : false;
                          return expired && <span className="text-[8px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase tracking-widest">Expired</span>;
                        })()}
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
                          {b.displayCategory}
                        </span>
                        {b.active === false && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-widest rounded border border-amber-200">
                            Hidden
                          </span>
                        )}
                        <code className="text-[9px] font-black text-navy/20 tracking-tighter uppercase">{b.id}</code>
                      </div>
                      <h3 className="text-base font-serif font-bold text-navy truncate">{b.text}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/admin/bulletin-editor?id=${b.id}`} className="px-5 py-2 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-lg no-underline hover:bg-slate-800">Edit</Link>
                      <button
                        onClick={() => handleToggleBulletinVisibility(b)}
                        className={`px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg border transition-all active:scale-95 ${
                          b.active === false
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {b.active === false ? 'Unhide' : 'Hide'}
                      </button>
                      <button onClick={() => handleDeleteBulletin(b.id)} className="px-5 py-2 text-red-500 text-[9px] font-black uppercase tracking-widest hover:text-red-700 bg-transparent border-none">Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* MANAGE BULLETIN PANELS (CATEGORIES) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6 mt-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h3 className="text-sm font-black text-navy uppercase tracking-wider">Manage Bulletin Panels</h3>
                  <p className="text-[9px] text-navy/40 font-bold uppercase tracking-widest mt-0.5">Add, hide, or delete bulletin categories</p>
                </div>
                <form onSubmit={handleAddCategory} className="flex gap-2 w-full sm:w-auto">
                  <input
                    type="text"
                    placeholder="New panel name (e.g., Scholarships)..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="bg-gray-50 border border-gray-100 px-4 py-2 rounded-xl text-[10px] font-bold text-navy uppercase tracking-widest outline-none focus:border-navy transition-all"
                  />
                  <button type="submit" className="px-5 py-2 bg-navy text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-800 transition-all">
                    Add Panel
                  </button>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {dbCategories.map((cat) => (
                  <div key={cat.name} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-navy truncate block">
                        {cat.name}
                      </span>
                      <span className="text-[8px] text-navy/40 font-bold uppercase tracking-wider block mt-0.5">
                        Custom panel
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleCategoryActive(cat)}
                        className={`px-3 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg border transition-all active:scale-95 ${
                          cat.active === false
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {cat.active === false ? 'Show' : 'Hide'}
                      </button>
                      
                      <button
                        onClick={() => handleDeleteCategory(cat.name)}
                        className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50 flex items-center justify-center text-[10px] border border-transparent hover:border-red-100 transition-all"
                        title="Delete Panel"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-[10px] font-black uppercase tracking-widest text-navy/20 animate-pulse">Establishing Secure Command Session...</div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}
