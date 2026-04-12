'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import { saveBulletinToRegistry, getRegistryData } from '@/lib/data-service';

const IconArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconEye = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>;

export default function BulletinEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [bulletinJson, setBulletinJson] = useState('');
  const [bulletinCategory, setBulletinCategory] = useState('Important');
  const [isPublishing, setIsPublishing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [publishedJobs, setPublishedJobs] = useState<any[]>([]);

  // 🏛 Fetch Master Job Registry for Fuzzy Matching
  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(data => setPublishedJobs(Array.isArray(data) ? data : []))
      .catch(e => console.error('Job sync failed:', e));
  }, []);

  // Initialize with a default template if not editing
  useEffect(() => {
    if (!editId && !bulletinJson) {
      const defaultJson = { 
        id: "new-protocol-" + Math.random().toString(36).substr(2, 9), 
        text: "New Institutional Announcement", 
        desc: "Insert the primary briefing content here. This manifest is synchronized with the national registry.", 
        time: "JUST NOW", 
        category: bulletinCategory, 
        tags: ["institutional", "update"], 
        priority: 2, 
        links: [], 
        routedTo: null, 
        createdAt: new Date().toISOString(), 
        updatedAt: new Date().toISOString() 
      };
      setBulletinJson(JSON.stringify(defaultJson, null, 2));
    }
  }, [editId, bulletinCategory]);

  // Load existing data if editing
  useEffect(() => {
    if (editId) {
      const registry = getRegistryData();
      const allBulletins = [
        ...registry.notifications.map((n: any) => ({ ...n, cat: 'Important' })),
        ...Object.entries(registry.categories).flatMap(([cat, list]: [string, any]) => 
          list.map((item: any) => ({ ...item, cat }))
        )
      ];
      const existing = allBulletins.find(b => b.id === editId);
      if (existing) {
        const { cat, ...rest } = existing;
        setBulletinJson(JSON.stringify(rest, null, 2));
        setBulletinCategory(cat);
      }
    }
  }, [editId]);

  const handlePublish = () => {
    if (!previewData) return;
    setIsPublishing(true);
    
    // Simulate high-fidelity institutional sync
    setTimeout(() => {
      saveBulletinToRegistry(previewData, bulletinCategory);
      setIsPublishing(false);
      alert('Institutional Manifest Synchronized Successfully.');
      router.push('/admin');
    }, 1200);
  };

  let previewData: any = null;
  try {
    previewData = bulletinJson ? JSON.parse(bulletinJson) : null;
  } catch (e) {}

  // ── FUZZY MATCHING LOGIC (Link Suggestion) ──────────────────────
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

  const isFuzzyMatch = (target: string, query: string) => {
    const t = target.toLowerCase();
    const q = query.toLowerCase();
    if (t.includes(q)) return true;
    const threshold = q.length > 5 ? 2 : 1;
    return levDist(t, q) <= threshold;
  };

  const suggestedJob = useMemo(() => {
    if (!previewData || !previewData.tags || previewData.tags.length === 0 || publishedJobs.length === 0) return null;
    
    let bestJob = null;
    let maxMatches = 0;

    publishedJobs.forEach(job => {
      let matchCount = 0;
      const jobTags = job.tags || [];
      
      previewData.tags.forEach((bTag: string) => {
        if (jobTags.some((jTag: string) => isFuzzyMatch(jTag, bTag))) {
          matchCount++;
        }
      });

      if (matchCount > maxMatches) {
        maxMatches = matchCount;
        bestJob = job;
      }
    });

    return maxMatches > 0 ? bestJob : null;
  }, [previewData?.tags, publishedJobs]);

  const applySuggestedLink = () => {
    if (!suggestedJob || !previewData) return;
    const newData = { ...previewData, routedTo: `/all-jobs/${suggestedJob.id}` };
    setBulletinJson(JSON.stringify(newData, null, 2));
  };

  const disconnectLink = () => {
    if (!previewData) return;
    const newData = { ...previewData, routedTo: null };
    setBulletinJson(JSON.stringify(newData, null, 2));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pt-1 pb-10 px-6 lg:pt-2 lg:px-12 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1100px] mx-auto space-y-4 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="space-y-2 text-left">
            <button 
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-navy/30 hover:text-navy no-underline bg-transparent border-none cursor-pointer p-0"
            >
              ← Registry
            </button>
            <h1 className="text-xl lg:text-2xl font-black text-navy uppercase leading-none tracking-tighter">
              Bulletin Publisher
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-8">
          {/* CONTROL PANEL */}
          <div className="space-y-6 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm h-fit">

             <div className="space-y-6">
                <label className="block">
                   <span className="text-[8px] font-black text-navy/30 uppercase tracking-[0.2em] mb-1.5 block">Category Destination</span>
                   <select 
                     value={bulletinCategory}
                     onChange={(e) => setBulletinCategory(e.target.value)}
                     className="w-full bg-gray-50 border border-gray-100 p-3 rounded-xl text-[10px] font-bold text-navy uppercase tracking-widest focus:border-navy transition-all"
                   >
                      <option value="Important">IMPORTANT</option>
                      <option value="Admission">ADMISSION</option>
                      <option value="Admit Card">ADMIT CARD</option>
                      <option value="Syllabus">SYLLABUS</option>
                      <option value="Result">RESULT</option>
                   </select>
                </label>

                {/* 🛡 RAW MANIFEST DATA */}
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                      <span className="text-[8px] font-black text-navy/30 uppercase tracking-[0.2em] block">Manifest Payload (JSON)</span>
                      <button 
                        onClick={() => {
                           const defaultJson = { id: "new-protocol", text: "Title", desc: "Brief description", time: "RECENT", category: bulletinCategory, tags: [], priority: 2, links: [], routedTo: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
                           setBulletinJson(JSON.stringify(defaultJson, null, 2));
                        }}
                        className="text-[8px] font-black uppercase text-navy/40 hover:text-navy transition-all underline underline-offset-4 decoration-navy/10"
                      >
                         Reset
                      </button>
                   </div>
                   <textarea 
                     value={bulletinJson}
                     onChange={(e) => setBulletinJson(e.target.value)}
                     placeholder='{ "id": "bulletin-id", "text": "Post Title", "desc": "Information summary...", "time": "2 HOURS AGO" }'
                     className="w-full h-[220px] bg-gray-50 border border-gray-100 p-4 rounded-xl text-[10px] font-mono font-medium text-navy/70 placeholder:text-navy/10 outline-none focus:border-navy transition-all resize-none shadow-inner"
                   ></textarea>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handlePublish}
                    disabled={!previewData || isPublishing}
                    className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-navy/5 ${!previewData || isPublishing ? 'bg-gray-100 text-navy/20 cursor-not-allowed' : 'bg-navy text-white hover:bg-slate-800'}`}
                  >
                    {isPublishing ? 'Synchronizing...' : 'PUBLISH'}
                  </button>
                  <p className="mt-3 text-[8px] font-black text-center text-navy/10 uppercase tracking-widest italic leading-normal">National Registry Secure Sync Port</p>
                </div>
             </div>
          </div>

          {/* PREVIEW */}
          <div className="space-y-6">
             <div className="flex items-center justify-between gap-4">
                <div className="space-y-1">
                   <h3 className="text-[10px] font-black text-navy uppercase tracking-wider">Registry Preview Audit</h3>
                </div>
                <button 
                  onClick={() => setIsEditMode(!isEditMode)}
                  className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all border ${isEditMode ? 'bg-navy text-white border-navy' : 'bg-white text-navy/40 border-gray-100 hover:border-navy hover:text-navy'}`}
                >
                   {isEditMode ? 'Editing Active ●' : 'Editing Locked ○'}
                </button>
             </div>

             <div className="bg-[#FDFDFD] border border-gray-100 rounded-2xl overflow-hidden min-h-[500px] p-6 md:p-10 flex flex-col items-center">
                {previewData ? (
                    <article className="animate-in fade-in duration-300 w-full max-w-[640px] space-y-5">
                       {/* 🏛 Institutional Header Preview */}
                       <header className="space-y-4 pb-4 border-b border-gray-100/60 transition-all">
                          <h1 
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                               const newData = { ...previewData, text: e.currentTarget.innerText };
                               setBulletinJson(JSON.stringify(newData, null, 2));
                            }}
                            className={`text-xl md:text-2xl font-serif font-bold text-navy leading-tight outline-none p-1 -m-1 rounded transition-colors ${isEditMode ? 'focus:bg-navy/5 border border-dashed border-navy/20' : 'cursor-default border-none'}`}
                          >
                             {previewData.text || 'Missing Title Manifest'}
                          </h1>
                       </header>

                       {/* 📄 Formatted Briefing Body Preview */}
                       <div className="border-l-4 border-navy pl-6 space-y-6">
                          <div 
                            contentEditable={isEditMode}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                               const newData = { ...previewData, desc: e.currentTarget.innerText };
                               setBulletinJson(JSON.stringify(newData, null, 2));
                            }}
                            className={`text-[13px] md:text-[14px] font-serif leading-relaxed text-navy/80 italic outline-none p-1 -m-1 rounded transition-colors ${isEditMode ? 'focus:bg-navy/5 border border-dashed border-navy/20' : 'cursor-default border-none'}`}
                          >
                             {previewData.desc || 'Waiting for descriptions segment payload...'}
                          </div>

                          {/* 🔗 Institutional Verification Channels Preview (Direct Manipulation) */}
                          <div className="space-y-3">
                             <div className="flex flex-col gap-2">
                                {(previewData.links || []).map((link: any, i: number) => (
                                   <div key={i} className="relative group">
                                      <div className={`flex items-start justify-between py-2 transition-all ${isEditMode ? 'bg-navy/5 p-4 rounded-xl border-dashed border-navy/20 mb-2' : ''}`}>
                                         <div className="flex-1">
                                            <div 
                                              contentEditable={isEditMode}
                                              suppressContentEditableWarning
                                              onBlur={(e) => {
                                                 const newLinks = [...previewData.links];
                                                 newLinks[i] = { ...newLinks[i], title: e.currentTarget.innerText };
                                                 setBulletinJson(JSON.stringify({ ...previewData, links: newLinks }, null, 2));
                                              }}
                                              className={`text-[12px] font-bold text-navy uppercase tracking-tight outline-none ${isEditMode ? 'focus:bg-navy/20' : ''}`}
                                            >
                                               {link.title}
                                            </div>
                                            {isEditMode ? (
                                               <input 
                                                 defaultValue={link.url}
                                                 onBlur={(e) => {
                                                    const newLinks = [...previewData.links];
                                                    newLinks[i] = { ...newLinks[i], url: e.target.value };
                                                    setBulletinJson(JSON.stringify({ ...previewData, links: newLinks }, null, 2));
                                                 }}
                                                 className="text-[9px] font-medium text-navy/60 w-full mt-2 bg-transparent border-none outline-none focus:text-navy border-b border-navy/10 pb-1"
                                                 placeholder="Destination URL (https://...)"
                                               />
                                            ) : (
                                               <div className="text-[9px] font-medium text-navy/20 uppercase tracking-widest mt-1">{link.url}</div>
                                            )}
                                         </div>
                                         {!isEditMode && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-navy/20 mt-1"><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>}
                                         {isEditMode && (
                                            <button 
                                               onClick={() => {
                                                  const newLinks = previewData.links.filter((_: any, idx: number) => idx !== i);
                                                  setBulletinJson(JSON.stringify({ ...previewData, links: newLinks }, null, 2));
                                               }}
                                               className="ml-4 w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm scale-90"
                                            >
                                               ✕
                                            </button>
                                         )}
                                      </div>
                                   </div>
                                ))}

                                {isEditMode && (
                                   <button 
                                     onClick={() => {
                                        const newLinks = [...(previewData.links || []), { title: 'New Channel', url: 'https://' }];
                                        setBulletinJson(JSON.stringify({ ...previewData, links: newLinks }, null, 2));
                                     }}
                                     className="w-fit py-1.5 px-4 border border-dashed border-gray-200 rounded-lg text-[8px] font-black text-navy/30 uppercase tracking-[0.2em] hover:border-navy/20 hover:text-navy hover:bg-navy/5 transition-all mt-2"
                                   >
                                      ＋ Add Link
                                   </button>
                                )}
                             </div>
                          </div>
                       </div>

                       {/* 📊 Persistent Archival Footer Preview */}
                       <footer className="pt-4 space-y-4">
                          <div className="flex flex-col md:flex-row items-center gap-4">
                             <div className="flex flex-col items-center md:items-start gap-1 w-fit">
                                <Link 
                                   href={previewData.routedTo || "/all-jobs"}
                                   target="_blank"
                                   className={`inline-flex items-center gap-2 px-8 py-3 bg-navy text-white text-[9px] font-black uppercase tracking-[0.15em] rounded-full shadow-lg shadow-navy/5 transition-all no-underline ${isEditMode ? 'hover:bg-slate-800' : 'opacity-40 cursor-default'}`}
                                >
                                   view Details ➜
                                </Link>
                                {previewData.routedTo && isEditMode && (
                                   <div className="flex items-center gap-2 mt-1 -ml-2 md:ml-4 animate-in fade-in duration-300">
                                      <div className="text-[7px] font-black text-green-500 uppercase tracking-widest italic px-2 py-0.5 bg-green-50 rounded border border-green-100 items-center gap-1.5 flex">
                                         <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></span>
                                         Ad Matched
                                      </div>
                                      <Link 
                                         href={previewData.routedTo}
                                         target="_blank"
                                         className="w-5 h-5 rounded-full bg-navy/5 text-navy/40 flex items-center justify-center hover:bg-navy hover:text-white transition-all"
                                         title="Audit Active Registry Destination"
                                      >
                                         <IconEye />
                                      </Link>
                                      <button 
                                        onClick={disconnectLink}
                                        className="w-5 h-5 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                        title="Disconnect Link Manifest"
                                      >
                                         ✕
                                      </button>
                                   </div>
                                )}
                             </div>

                             {/* 🔍 FUZZY MATCH PREVIEW SUGGESTION */}
                             {isEditMode && suggestedJob && previewData && previewData.routedTo !== `/all-jobs/${suggestedJob.id}` && (
                                <div className="flex-1 flex flex-col md:flex-row items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-2xl animate-in slide-in-from-left-4 duration-500">
                                   <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                         <span className="text-[7px] font-black text-blue-600 uppercase tracking-widest">Recommended Registry Post</span>
                                         <Link 
                                           href={`/all-jobs/${suggestedJob.id}`} 
                                           target="_blank"
                                           className="text-blue-400 hover:text-blue-600 transition-colors"
                                           title="Audit Registration Proposal"
                                         >
                                            <IconEye />
                                         </Link>
                                      </div>
                                      <div className="text-[10px] font-serif font-bold text-navy truncate">
                                         {suggestedJob.title}
                                      </div>
                                   </div>
                                   <button 
                                     onClick={applySuggestedLink}
                                     className="px-4 py-2 bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-700 transition-all shadow-md shrink-0 whitespace-nowrap"
                                   >
                                      Connect ➜
                                   </button>
                                </div>
                             )}
                          </div>

                          <div className="space-y-3 pt-6 border-t border-gray-100">
                             <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                <div className="flex items-center gap-1.5">
                                   <span className="w-1 h-1 bg-green-500 rounded-full"></span>
                                   <span className="text-[8px] font-black text-navy/40 uppercase tracking-[0.1em] font-mono whitespace-nowrap">Published {previewData.time || 'RECENT'}</span>
                                </div>
                                <span className="hidden md:block w-[1px] h-2.5 bg-gray-200"></span>
                                <span className="text-[8px] font-black text-navy/60 uppercase tracking-[0.1em] whitespace-nowrap">
                                   {bulletinCategory || 'Institutional'}
                                </span>

                                {/* Classification Tags Preview Integrated */}
                                {previewData.tags && previewData.tags.length > 0 && (
                                   <div className="flex flex-wrap items-center gap-x-2">
                                      <span className="hidden md:block w-2 h-[1px] bg-gray-200"></span>
                                      {previewData.tags.map((tag: string, i: number) => (
                                         <span key={i} className="text-[8px] font-black text-navy/20 uppercase tracking-[0.1em] italic whitespace-nowrap">#{tag}</span>
                                      ))}
                                   </div>
                                )}
                             </div>
                          </div>
                       </footer>
                    </article>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span className="text-[9px] font-black uppercase tracking-widest">Awaiting Synchronization</span>
                   </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
