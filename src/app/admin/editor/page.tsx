'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import RecruitmentPreview from '@/components/RecruitmentPreview';
import Link from 'next/link';

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get('id');

  const [jsonInput, setJsonInput] = useState('');
  const [jobData, setJobData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isJsonCollapsed, setIsJsonCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(!!jobId);

  const isInternalUpdate = React.useRef(false);

  // Fetch job data if editing
  useEffect(() => {
    if (jobId) {
      const fetchJob = async () => {
        try {
          const res = await fetch(`/api/jobs?id=${jobId}`);
          if (res.ok) {
            const data = await res.json();
            setJobData(data);
            setJsonInput(JSON.stringify(data, null, 2));
          } else {
            setError("Failed to load job data.");
          }
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchJob();
    }
  }, [jobId]);

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
            if (val === undefined) {
              newArr.splice(parseInt(head), 1);
            } else {
              newArr[parseInt(head)] = val;
            }
            return newArr;
          }
          if (val === undefined) {
            const { [head]: _, ...rest } = obj;
            return rest;
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
      const newData = updateDeep(prev, parts, value);
      isInternalUpdate.current = true;
      setJsonInput(JSON.stringify(newData, null, 2));
      return newData;
    });
  };

  useEffect(() => {
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
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
    
    if (!normalizedData.id) {
      normalizedData.id = normalizedData.title ? normalizedData.title.toLowerCase().replace(/[^a-z0-9]/g, '-') : Math.random().toString(36).substr(2, 9);
    }

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
          router.push('/admin');
        }, 1500);
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
    if (confirm("Reset all changes?")) {
      setJsonInput('');
      setJobData(null);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-navy/40">Loading Recruitment Data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-[60px] inset-0 bg-[#F8FAFC] flex flex-col font-sans z-[900]">
      {/* FIXED EDITOR HEADER (Now locally static because parent is fixed) */}
      <header className="h-[50px] md:h-[60px] bg-white border-b-2 border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 shadow-sm relative z-[1000]">
        <div className="flex items-center gap-2 md:gap-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-navy/40 hover:text-navy transition-colors group no-underline bg-transparent border-none cursor-pointer p-0"
          >
            <div className="p-1.5 md:p-2 bg-gray-50 group-hover:bg-navy group-hover:text-white rounded-lg transition-all border border-gray-100 group-hover:border-navy">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </div>
            <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Back</span>
          </button>
          <h2 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-navy">Recruitment Editor</h2>
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
            className={`px-3 md:px-6 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {isEditing ? 'Live Edit ON' : 'Edit Mode'}
          </button>
          <button
            onClick={handlePublish}
            disabled={!jobData || isPublishing || success}
            className={`px-4 md:px-8 py-2 md:py-2.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-xl transition-all ${success ? 'bg-green text-white' : 'bg-navy text-white hover:bg-[#06142E] active:scale-95 disabled:opacity-30 disabled:grayscale'}`}
          >
            {isPublishing ? '...' : success ? '✓ Published' : 'Publish ➜'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
        {/* JSON Source Panel */}
        <div 
          className={`relative bg-gray-50 border-gray-100 flex flex-col transition-all duration-500 ease-in-out border-b lg:border-b-0 lg:border-r-[6px] overflow-hidden ${isJsonCollapsed ? 'w-0 opacity-0' : 'w-full lg:w-[40%] opacity-100'}`}
        >
          <div className="absolute top-2 left-4 text-[8px] font-black text-navy/20 uppercase tracking-widest z-10 pointer-events-none whitespace-nowrap">JSON Source</div>
          <div className="flex-1 w-full min-w-[400px]">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full h-full p-6 md:p-12 pt-10 md:pt-16 font-mono text-[11px] md:text-[13px] text-navy leading-relaxed bg-transparent focus:outline-none resize-none custom-scrollbar"
              placeholder='Paste Job JSON Meta-Data Here...'
            />
          </div>
          {error && (
            <div className="absolute bottom-4 left-4 right-4 p-2.5 bg-red-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest shadow-2xl animate-in slide-in-from-bottom-2">
              Schema Error: {error}
            </div>
          )}
        </div>

        {/* Preview Panel + Toggle Handle */}
        <div className="flex-1 relative bg-white min-w-0 flex flex-col">
          <button
            onClick={() => setIsJsonCollapsed(!isJsonCollapsed)}
            className={`absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-20 bg-navy text-white rounded-r-xl shadow-2xl z-[5000] flex flex-col items-center justify-center hover:scale-x-110 active:scale-95 transition-all outline-none border-y-2 border-r-2 border-white/20 ${isJsonCollapsed ? 'left-0' : ''}`}
          >
            <div className={`text-[12px] font-black transition-transform duration-500 ${isJsonCollapsed ? 'rotate-0' : 'rotate-180'}`}>
              ➜
            </div>
            <div className="text-[7px] font-bold uppercase tracking-tighter mt-1 [writing-mode:vertical-lr] opacity-30">
              {isJsonCollapsed ? 'JSON' : 'HIDE'}
            </div>
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-0 md:p-8">
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
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditorContent />
    </Suspense>
  );
}
