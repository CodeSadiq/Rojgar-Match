'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import RecruitmentPreview from '@/components/RecruitmentPreview';

export default function AdminPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isInjectorOpen, setIsInjectorOpen] = useState(false);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(true);

  const handleUpdate = (path: string, value: any) => {
    setJobData((prev: any) => {
      if (!prev) return prev;

      const parts = path.split('.');
      const updateDeep = (obj: any, keys: string[], val: any): any => {
        const [head, ...tail] = keys;
        if (!obj) obj = {};

        if (tail.length === 0) {
          // Handle numeric keys for arrays
          if (Array.isArray(obj)) {
            const newArr = [...obj];
            newArr[parseInt(head)] = val;
            return newArr;
          }
          return { ...obj, [head]: val };
        }

        if (Array.isArray(obj)) {
          const newArr = [...obj];
          const idx = parseInt(head);
          newArr[idx] = updateDeep(newArr[idx], tail, val);
          return newArr;
        }

        return {
          ...obj,
          [head]: updateDeep(obj[head], tail, val)
        };
      };

      return updateDeep(prev, parts, value);
    });
  };

  const handleRenameKey = (parentPath: string, oldKey: string, newKey: string) => {
    if (!newKey || oldKey === newKey) return;
    setJobData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = parentPath.split('.');
      let current = newData;
      for (const p of parts) {
        if (!current[p]) return prev;
        current = current[p];
      }
      if (current[oldKey] !== undefined) {
        current[newKey] = current[oldKey];
        delete current[oldKey];
      }
      return newData;
    });
  };

  const handleDeleteKey = (parentPath: string, key: string) => {
    setJobData((prev: any) => {
      if (!prev) return prev;
      const newData = JSON.parse(JSON.stringify(prev));
      const parts = parentPath.split('.');
      let current = newData;
      for (const p of parts) {
        if (!current[p]) return prev;
        current = current[p];
      }
      delete current[key];
      return newData;
    });
  };

  // Sync JSON input when jobData changes in Edit Mode
  React.useEffect(() => {
    if (isEditing && jobData) {
      setJsonInput(JSON.stringify(jobData, null, 2));
    }
  }, [jobData, isEditing]);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJobData(parsed);
      setError(null);
      setSuccess(false);
    } catch (e: any) {
      setError(e.message);
      setJobData(null);
    }
  };

  const handlePublish = async () => {
    if (!jobData) return;
    setIsPublishing(true);

    // NORMALIZE DATA BEFORE INJECTION
    const normalizedData = { ...jobData };
    if (!normalizedData.organization && normalizedData.org) {
      normalizedData.organization = normalizedData.org;
    }
    if (!normalizedData.id) {
      normalizedData.id = normalizedData.title ? normalizedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : Math.random().toString(36).substr(2, 9);
    }

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });
      if (res.ok) {
        setSuccess(true);
        setJsonInput('');
        setJobData(null);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Protocol Error: Data rejected by repository nodes.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-navy-dark font-sans selection:bg-navy/10 selection:text-navy">
      {/* ADMIN HEADER */}
      <nav className="border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1500px] mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-gray-400 hover:text-navy transition-colors text-sm font-bold flex items-center gap-2">
              ← Back to Site
            </Link>
            <div className="h-4 w-[1px] bg-gray-200"></div>
            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-navy">Admin / Recruitment Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-green/5 border border-green/10 px-3 py-1 rounded-full">
              <div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-[10px] font-black text-green uppercase tracking-widest">Active Server</span>
            </div>
          </div>
        </div>
      </nav>      <main className="max-w-[1500px] mx-auto px-6 py-10">
        <div className="flex flex-col gap-8">

          {/* UNIFIED COMMAND CENTER */}
          <div className="bg-white rounded-[24px] lg:rounded-[40px] border-2 border-gray-100 shadow-2xl overflow-hidden flex flex-col min-h-[120px] text-navy-dark transition-all duration-500">

            {/* UNIFIED HEADER */}
            <header className={`${isHeaderCollapsed ? 'p-2 lg:px-6 h-[52px]' : 'p-4 lg:p-6'} border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative transition-all duration-300`}>
              <div
                onClick={() => {
                  const newState = !isHeaderCollapsed;
                  setIsHeaderCollapsed(newState);
                  setIsInjectorOpen(!newState);
                }}
                className="flex-1 flex flex-col gap-1 cursor-pointer group select-none"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isInjectorOpen ? 'bg-navy animate-pulse' : 'bg-gray-300'}`}></div>
                  <h2 className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${isHeaderCollapsed ? 'text-navy' : 'text-navy/50'}`}>
                    {isHeaderCollapsed ? 'Job Creation Portal' : 'New Recruitment Setup'}
                  </h2>
                  {isHeaderCollapsed && (
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded border border-gray-200 ml-2">Click to Start New Post</span>
                  )}
                </div>

                <div className={`transition-all duration-500 overflow-hidden ${isHeaderCollapsed ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100 mt-1'}`}>
                  <h2 className="text-xl font-black uppercase tracking-tighter">
                    Recruitment Data Manager
                  </h2>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Easily paste and preview your job data before publishing</div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Secondary buttons - hide when collapsed to keep it simple */}
                {!isHeaderCollapsed && (
                  <button
                    onClick={() => setIsInjectorOpen(!isInjectorOpen)}
                    className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 ${isInjectorOpen ? 'bg-navy text-white border-navy' : 'bg-white text-navy border-gray-100 hover:border-navy/20'}`}
                  >
                    {isInjectorOpen ? 'CLOSE CONSOLE' : 'OPEN INJECTOR'}
                  </button>
                )}
                <button
                  onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-all text-navy"
                  title={isHeaderCollapsed ? "Expand Header" : "Collapse Header"}
                >
                  <svg className={`w-3 h-3 transition-transform duration-300 ${isHeaderCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>
                <button
                  onClick={() => jobData && setIsEditing(!isEditing)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isEditing ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
                  {isEditing ? 'Editing Mode' : 'View Mode'}
                </button>
                <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${jobData ? 'bg-green text-white shadow-lg shadow-green/20' : 'bg-gray-100 text-gray-400'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${jobData ? 'bg-white animate-pulse' : 'bg-gray-300'}`}></span>
                  {jobData ? 'Ready' : 'Idle'}
                </div>
              </div>
            </header>

            <div className="flex-1 flex flex-col overflow-hidden bg-white">

              {/* COLLAPSIBLE INJECTOR BUFFER */}
              {isInjectorOpen && (
                <div className="p-4 lg:p-8 bg-gray-50/30 border-b border-gray-100 animate-in slide-in-from-top-4 duration-500">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-9 flex flex-col gap-4">
                      <textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        className="w-full h-[200px] bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-[13px] text-navy focus:border-navy outline-none transition-all resize-none shadow-inner custom-scrollbar"
                        placeholder='{ "title": "SSC CGL 2026", "org": "Staff Selection Commission", "salary": "₹44,900", "location": "All India", "lastDate": "25 May 2025", "qual": "...", "process": "...", "tags": ["SSC", "Graduate"] }'
                      />
                    </div>
                    <div className="lg:col-span-3 flex flex-col gap-4">
                      <button
                        onClick={handleParse}
                        className="w-full py-6 bg-navy text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-navy-dark active:scale-95 transition-all shadow-xl shadow-navy/20"
                      >
                        Parse JSON ➜
                      </button>
                      <div className="bg-white/50 border border-navy/5 rounded-2xl p-4 flex-1">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-navy/30 leading-relaxed italic">
                          Authorized personnel only. Schema validation active.
                        </p>
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className="mt-4 p-4 bg-red/5 border border-red/10 rounded-xl text-red text-[11px] font-bold">
                      PROTOCOL ERROR: {error}
                    </div>
                  )}
                </div>
              )}

              {/* LIVE PREVIEW REGION */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {!jobData ? (
                  <div className={`flex flex-col items-center justify-center text-center opacity-10 grayscale transition-all duration-500 overflow-hidden ${(!isInjectorOpen && isHeaderCollapsed) ? 'h-0 py-0' : 'py-12 lg:py-20'}`}>
                    <div className="text-4xl mb-4">📑</div>
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] mb-1">IDLE STATE</h3>
                    <p className="text-[9px] font-bold max-w-[200px] uppercase tracking-widest leading-relaxed">Awaiting valid JSON injection</p>
                  </div>
                ) : (
                  <div className="relative animate-in fade-in duration-700">
                    <RecruitmentPreview
                      job={jobData}
                      editable={isEditing}
                      onUpdate={handleUpdate}
                      onRenameKey={handleRenameKey}
                      onDeleteKey={handleDeleteKey}
                    />

                    {/* Floating Apply Action */}
                    <div className="sticky bottom-0 left-0 w-full p-4 lg:p-8 bg-gradient-to-t from-white via-white/100 to-transparent pt-12 lg:pt-24 mt-[-80px] z-10">
                      <button
                        onClick={handlePublish}
                        disabled={isPublishing || success}
                        className={`w-full py-5 lg:py-8 rounded-[16px] lg:rounded-[24px] font-black text-[12px] lg:text-[16px] uppercase tracking-[0.2em] lg:tracking-[0.4em] transition-all shadow-2xl ${success ? 'bg-green text-white translate-y-0' : 'bg-navy text-white hover:bg-navy-dark hover:-translate-y-2'}`}
                      >
                        {isPublishing ? 'SYNCHRONIZING...' : success ? '✓ INJECTION COMPLETED' : 'AUTHORIZE & BROADCAST ➜'}
                      </button>
                      {success && (
                        <p className="text-center text-[11px] font-black text-green uppercase tracking-[0.3em] mt-8 animate-pulse">PROTOCOL BROADCAST SUCCESSFUL: Data has been successfully mirrored to the national Candidate Registry.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="py-24 text-center opacity-20">
        <div className="text-[11px] font-black uppercase tracking-[0.5em] text-navy">ADMIN VERIFICATION LAYER — 2026 OFFICIAL PORTAL</div>
      </footer>
    </div>
  );
}



