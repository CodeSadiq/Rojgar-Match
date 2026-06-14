'use client';

import React, { useState, useEffect, Suspense } from 'react';
import BackButton from '@/components/BackButton';
import { useRouter } from 'next/navigation';

function RegistryManager() {
  const [registry, setRegistry] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const fetchRegistry = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/qual-tree/registry');
      if (res.ok) {
        const data = await res.json();
        setRegistry(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistry();
  }, []);

  const handleUpdate = async (name: string, payload: any) => {
    try {
      const res = await fetch('/api/admin/qual-tree/registry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, ...payload }),
      });
      if (res.ok) {
        fetchRegistry();
        setStatus({ msg: 'Changes saved to Database staging.', type: 'success' });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (e) {
      setStatus({ msg: 'Update failed', type: 'error' });
    }
  };

  const handleSyncToSource = async () => {
    if (!confirm("This will overwrite 'src/lib/constants.ts' with current Database state. Only use this if you want to commit these changes to the codebase. Continue?")) return;

    setStatus({ msg: 'Syncing to Source Code...', type: 'info' });
    try {
      const res = await fetch('/api/admin/qual-tree/sync', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setStatus({ msg: data.message || 'Successfully synced to constants.ts', type: 'success' });
      } else {
        setStatus({ msg: data.error || 'Sync failed', type: 'error' });
      }
    } catch (e: any) {
      setStatus({ msg: 'Network error during sync', type: 'error' });
    }
  };

  const deleteCourse = async (name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY delete the entire course "${name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/qual-tree/registry?name=${encodeURIComponent(name)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchRegistry();
        setStatus({ msg: 'Course removed from Registry.', type: 'success' });
        setTimeout(() => setStatus(null), 3000);
      }
    } catch (e) {
      setStatus({ msg: 'Deletion failed', type: 'error' });
    }
  };

  const removeBranch = async (courseName: string, branchValue: string) => {
    const course = registry.find(c => c.name === courseName);
    if (!course) return;
    const updatedBranches = course.branches.filter((b: any) => b.value !== branchValue);
    handleUpdate(courseName, { label: course.label, level: course.level, branches: updatedBranches });
  };

  const addBranch = async (courseName: string) => {
    const branch = prompt("Enter new Branch name (e.g., Computer Science):");
    if (!branch) return;
    const course = registry.find(c => c.name === courseName);
    if (!course) return;
    const updatedBranches = [...course.branches, { value: branch, label: branch }];
    handleUpdate(courseName, { label: course.label, level: course.level, branches: updatedBranches });
  };

  const editCourseLabel = async (name: string, currentLabel: string, currentLevel: number) => {
    const newLabel = prompt("Edit Course Display Label:", currentLabel);
    if (!newLabel) return;
    const newLevelStr = prompt("Edit Level (1-5):", currentLevel.toString());
    const newLevel = parseInt(newLevelStr || currentLevel.toString());

    const course = registry.find(c => c.name === name);
    if (!course) return;
    handleUpdate(name, { label: newLabel, level: newLevel, branches: course.branches });
  };

  const addCourse = async () => {
    const name = prompt("Enter Course internal name (e.g., B.Tech):");
    if (!name) return;
    const label = prompt("Enter Display Label (e.g., B.Tech / BE):");
    if (!label) return;
    const levelStr = prompt("Enter Level (1:10th, 2:12th, 3:Diploma, 4:Degree, 5:Master):");
    const level = parseInt(levelStr || '4');

    handleUpdate(name, { label, level, branches: [] });
  };

  const filteredRegistry = registry.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.label.toLowerCase().includes(search.toLowerCase()) ||
    c.branches.some((b: any) => b.label.toLowerCase().includes(search.toLowerCase()))
  ).sort((a, b) => a.level - b.level);

  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1200px] mx-auto space-y-10">

        <header className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-6">
            <BackButton className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/30 hover:text-navy transition-all group no-underline bg-transparent border-none cursor-pointer">
              <div className="w-9 h-9 bg-white border border-gray-100 rounded-full flex items-center justify-center group-hover:bg-navy group-hover:text-white transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              </div>
              <span>Back</span>
            </BackButton>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-navy uppercase tracking-tighter">Academic Registry</h1>
              <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest leading-none">Global Structure Management</p>
            </div>
          </div>

          <div className="flex gap-4">
            {isLocalHost && (
              <button
                onClick={handleSyncToSource}
                className="px-8 py-3.5 bg-green-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-green-900/10 hover:bg-green-700 transition-all border-none cursor-pointer"
              >
                Sync to TS File
              </button>
            )}
            <button
              onClick={addCourse}
              className="px-8 py-3.5 bg-navy text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-xl shadow-navy/10 hover:bg-slate-800 transition-all border-none cursor-pointer"
            >
              Add New Course +
            </button>
          </div>
        </header>

        {status && (
          <div className={`p-4 rounded-xl text-[10px] font-black uppercase tracking-widest border animate-in slide-in-from-top-4 ${status.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : status.type === 'info' ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
            {status.msg}
          </div>
        )}

        {/* SEARCH & FILTER */}
        <div className="relative group/search">
          <input
            type="text"
            placeholder="Search courses or branches..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 p-5 pl-14 rounded-2xl text-[13px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest shadow-sm outline-none focus:border-navy transition-all group-focus-within/search:shadow-xl"
          />
          <svg className="absolute left-6 top-1/2 -translate-y-1/2 text-navy/20" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {isLoading ? (
          <div className="py-40 text-center text-[11px] font-black text-navy/10 uppercase tracking-widest animate-pulse">Syncing Academic Database...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredRegistry.map((course) => (
              <div key={course.name} className="bg-white border border-gray-200 rounded-[32px] p-8 space-y-6 hover:shadow-2xl hover:shadow-navy/5 transition-all group flex flex-col relative text-left">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-navy/5 text-navy/40 text-[9px] font-black uppercase tracking-widest rounded-lg border border-navy/5">Level {course.level}</span>
                      {(course.jobCount || 0) > 0 ? (
                        <span className={`px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg ${
                          course.jobCount <= 20
                            ? 'bg-orange-500 text-white'
                            : 'bg-emerald-600 text-white'
                        }`}>
                          {course.jobCount} {course.jobCount === 1 ? 'Post' : 'Posts'}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg">
                          Unused
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => editCourseLabel(course.name, course.label, course.level)}
                        className="w-8 h-8 flex items-center justify-center text-navy/20 hover:text-navy transition-colors opacity-0 group-hover:opacity-100"
                        title="Edit Course Name/Level"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        onClick={() => deleteCourse(course.name)}
                        className="w-8 h-8 flex items-center justify-center text-red-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Course"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-serif font-black text-navy leading-tight">{course.label}</h3>
                  <p className="text-[10px] font-black text-navy/20 uppercase tracking-[0.2em]">{course.name}</p>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                    <span className="text-[9px] font-black text-navy/40 uppercase tracking-widest">Branches ({course.branches.length})</span>
                    <button onClick={() => addBranch(course.name)} className="text-[18px] text-navy/20 hover:text-navy leading-none font-black bg-transparent border-none cursor-pointer">+</button>
                  </div>
                  <div className="flex flex-wrap gap-2 text-left">
                    {course.branches.length === 0 ? (
                      <span className="text-[10px] text-navy/10 font-bold uppercase italic">Open Criteria</span>
                    ) : (
                      course.branches.map((b: any) => (
                        <div key={b.value} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg group/branch">
                          <span className="text-[10px] font-bold text-navy/60 flex items-center gap-1.5">
                            {b.label}
                            <span className={`px-1.5 py-0.5 rounded text-[8.5px] font-black ${
                              !b.jobCount || b.jobCount === 0
                                ? 'bg-red-600 text-white'
                                : b.jobCount <= 20
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-emerald-600 text-white'
                            }`}>
                              {b.jobCount || 0}
                            </span>
                          </span>
                          <button onClick={() => removeBranch(course.name, b.value)} className="w-4 h-4 flex items-center justify-center text-navy/20 hover:text-red-500 leading-none text-xs transition-colors bg-transparent border-none cursor-pointer">✕</button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default function RegistryPage() {
  return (
    <Suspense fallback={<div>Loading Registry...</div>}>
      <RegistryManager />
    </Suspense>
  );
}
