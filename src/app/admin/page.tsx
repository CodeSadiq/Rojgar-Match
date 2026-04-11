'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import RecruitmentPreview from '@/components/RecruitmentPreview';

export default function AdminPage() {
  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isFullToolOpen, setIsFullToolOpen] = useState(false);

  const handleUpdate = (path: string, value: any) => {
    setJobData((prev: any) => {
      if (!prev) return prev;
      const parts = path.split('.');
      const updateDeep = (obj: any, keys: string[], val: any): any => {
        const [head, ...tail] = keys;
        if (!obj) obj = {};
        if (tail.length === 0) {
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
        return { ...obj, [head]: updateDeep(obj[head], tail, val) };
      };
      return updateDeep(prev, parts, value);
    });
  };

  useEffect(() => {
    if (isEditing && jobData) {
      setJsonInput(JSON.stringify(jobData, null, 2));
    }
  }, [jobData, isEditing]);

  useEffect(() => {
    if (!jsonInput.trim()) {
      setJobData(null);
      setError(null);
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      setJobData(parsed);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [jsonInput]);

  const handlePublish = async () => {
    if (!jobData) return;
    setIsPublishing(true);
    const normalizedData = { ...jobData };
    if (!normalizedData.organization && normalizedData.org) normalizedData.organization = normalizedData.org;
    if (!normalizedData.id) {
      normalizedData.id = normalizedData.title ? normalizedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : Math.random().toString(36).substr(2, 9);
    }

    // Parse selection/application process if in common alternative formats
    if (!normalizedData.selectionProcess && normalizedData.selection_process) normalizedData.selectionProcess = normalizedData.selection_process;
    if (!normalizedData.applicationProcess && normalizedData.application_process) normalizedData.applicationProcess = normalizedData.application_process;
    if (!normalizedData.selectionProcess && normalizedData.selection) normalizedData.selectionProcess = normalizedData.selection;
    if (!normalizedData.applicationProcess && normalizedData.application) normalizedData.applicationProcess = normalizedData.application;

    // Convert string to array if needed (splits by newlines, commas, or semicolons)
    const arrayify = (val: any) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') return val.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
      return [];
    };

    if (normalizedData.selectionProcess) normalizedData.selectionProcess = arrayify(normalizedData.selectionProcess);
    if (normalizedData.applicationProcess) normalizedData.applicationProcess = arrayify(normalizedData.applicationProcess);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalizedData),
      });
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setIsFullToolOpen(false);
          setJsonInput('');
          setJobData(null);
        }, 2000);
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Publishing failed.');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Clear all recruitment data and start fresh?')) {
      setJsonInput('');
      setJobData(null);
      setError(null);
      setSuccess(false);
    }
  };

  if (!isFullToolOpen) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-20 font-sans">
        <nav className="mb-20">
          <Link href="/" className="text-gray-400 hover:text-navy transition-colors text-sm font-bold flex items-center gap-2 no-underline">
            ← Return to Dashboard
          </Link>
        </nav>

        <div
          onClick={() => setIsFullToolOpen(true)}
          className="max-w-2xl mx-auto bg-white border-2 border-gray-100 rounded-[32px] p-6 lg:p-10 shadow-xl hover:border-navy/20 cursor-pointer transition-all hover:-translate-y-1 group group-hover:shadow-[#0D244D]/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-navy animate-pulse"></div>
                <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-navy/40">Console</h2>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-navy uppercase leading-none tracking-tighter mb-3">
                Recruitment <br /> Manager.
              </h1>
              <p className="text-gray-400 font-bold uppercase tracking-widest text-[9px] leading-relaxed">Paste and preview job data before publishing.</p>
            </div>
            <div className="w-16 h-16 bg-navy text-white rounded-full flex items-center justify-center text-2xl shadow-xl shadow-navy/20 group-hover:rotate-90 transition-transform">
              +
            </div>
          </div>
        </div>

        <footer className="mt-40 text-center opacity-10">
          <div className="text-[10px] font-black uppercase tracking-[0.5em] text-navy">ADMIN ACCESS ONLY</div>
        </footer>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#F8FAFC] z-[2000] flex flex-col font-sans animate-in fade-in duration-300">
      <header className="h-[60px] md:h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={() => setIsFullToolOpen(false)} className="text-navy/40 hover:text-navy text-lg md:text-xl p-2">✕</button>
          <div className="h-6 w-[1px] bg-gray-100 hidden md:block"></div>
          <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-navy truncate max-w-[80px] md:max-w-none">Recruitment Editor</h2>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={handleReset}
            className="px-3 md:px-5 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-500 hover:bg-red-100 transition-all border border-red-100"
          >
            Reset
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {isEditing ? 'Live Edit ON' : 'Edit Mode'}
          </button>
          <button
            onClick={handlePublish}
            disabled={!jobData || isPublishing || success}
            className={`px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${success ? 'bg-green text-white' : 'bg-navy text-white hover:bg-navy-dark active:scale-95 disabled:opacity-30 disabled:grayscale'}`}
          >
            {isPublishing ? '...' : success ? '✓ Published' : 'Publish ➜'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-[35%_1fr]">
        <div className="relative border-b lg:border-r border-gray-100 bg-gray-50 flex flex-col h-[40vh] lg:h-auto">
          <div className="absolute top-2 left-4 text-[8px] font-black text-navy/20 uppercase tracking-widest z-10 pointer-events-none">JSON Source</div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="flex-1 w-full p-6 md:p-12 pt-10 md:pt-16 font-mono text-[11px] md:text-[13px] text-navy leading-relaxed bg-transparent focus:outline-none resize-none custom-scrollbar"
            placeholder='Paste Job JSON Meta-Data Here...'
          />
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-2.5 bg-red/90 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-2">
              Error: {error}
            </div>
          )}
        </div>
        <div className="bg-white overflow-y-auto custom-scrollbar p-0 md:p-8">
          <div className="max-w-[1000px] mx-auto scale-[0.85] md:scale-100 origin-top">
            {!jobData ? (
              <div className="h-[calc(100vh-100px)] flex flex-col items-center justify-center opacity-10">
                <div className="text-4xl md:text-6xl mb-4">📑</div>
                <div className="text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">Awaiting Valid Schema</div>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-700">
                <RecruitmentPreview
                  job={jobData}
                  editable={isEditing}
                  onUpdate={handleUpdate}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



