'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';

export default function BulletinEditorPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [bulletinJson, setBulletinJson] = useState('');
  const [bulletinCategory, setBulletinCategory] = useState('Important');
  const [isPublishing, setIsPublishing] = useState(false);

  // Load existing data if editing
  useEffect(() => {
    if (editId) {
      const allBulletins = [
        ...NOTIFICATIONS.map(n => ({ ...n, cat: 'Important' })),
        ...Object.entries(CATEGORY_DATA).flatMap(([cat, list]) => list.map(item => ({ ...item, cat })))
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
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert('Bulletin manifest synchronized with national registry.');
      router.push('/admin');
    }, 1500);
  };

  let previewData = null;
  try {
    previewData = bulletinJson ? JSON.parse(bulletinJson) : null;
  } catch (e) {}

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-14 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1240px] mx-auto space-y-12 animate-in fade-in duration-700">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 pb-12 border-b-2 border-gray-100">
          <div className="space-y-4 text-left">
            <Link 
              href="/admin"
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-navy/30 hover:text-navy no-underline mb-4"
            >
              ← Back to Registry
            </Link>
            <h1 className="text-4xl lg:text-5xl font-black text-navy uppercase leading-none tracking-tighter">
              Bulletin Editor
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* EDITOR */}
          <div className="space-y-8 bg-white border-2 border-gray-100 p-8 rounded-3xl shadow-sm">

             <div className="space-y-6">
                <label className="block">
                   <span className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 block">Category Destination</span>
                   <select 
                     value={bulletinCategory}
                     onChange={(e) => setBulletinCategory(e.target.value)}
                     className="w-full bg-gray-50 border-2 border-gray-100 p-4 rounded-xl text-[11px] font-bold text-navy uppercase tracking-widest focus:border-navy transition-all"
                   >
                      <option value="Important">IMPORTANT</option>
                      <option value="Admission">ADMISSION</option>
                      <option value="Admit Card">ADMIT CARD</option>
                      <option value="Syllabus">SYLLABUS</option>
                      <option value="Result">RESULT</option>
                   </select>
                </label>

                <label className="block">
                   <span className="text-[9px] font-black text-navy/30 uppercase tracking-[0.2em] mb-2 block">Manifest Data (JSON)</span>
                   <textarea 
                     value={bulletinJson}
                     onChange={(e) => setBulletinJson(e.target.value)}
                     placeholder='{ "id": "bulletin-id", "text": "Post Title", "desc": "Information summary...", "time": "2 HOURS AGO" }'
                     className="w-full h-[400px] bg-gray-50 border-2 border-gray-100 p-6 rounded-2xl text-[12px] font-mono font-medium text-navy placeholder:text-navy/10 outline-none focus:border-navy transition-all resize-none shadow-inner"
                   ></textarea>
                </label>

                <button 
                  onClick={handlePublish}
                  disabled={!previewData || isPublishing}
                  className={`w-full py-4 rounded-xl text-[11px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-navy/10 ${!previewData || isPublishing ? 'bg-gray-100 text-navy/20 cursor-not-allowed' : 'bg-navy text-white hover:bg-slate-800'}`}
                >
                  {isPublishing ? 'Synchronizing Manifest...' : (editId ? 'UPDATE INSTITUTIONAL BROADCAST ➜' : 'PUBLISH TO NATIONAL REGISTRY ➜')}
                </button>
             </div>
          </div>

          {/* PREVIEW */}
          <div className="space-y-8">
             <div className="space-y-2">
                <h3 className="text-[12px] font-black text-navy uppercase tracking-widest">Live Registry Preview</h3>
                <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest">How the bulletin will manifest in the candidate terminal</p>
             </div>

             <div className="bg-[#fafaf9] border-2 border-gray-100 rounded-3xl overflow-hidden min-h-[600px] p-12 flex flex-col">
                
                {previewData ? (
                   <div className="animate-in fade-in duration-300">
                      <span className="text-[10px] font-black text-navy/40 uppercase tracking-[0.1em] block mb-4 font-mono">Broadcasted {previewData.time || 'JUST NOW'}</span>
                      <h1 className="text-2xl md:text-4xl font-serif font-bold text-navy leading-tight mb-8">
                         {previewData.text || 'Missing Title Manifest'}
                      </h1>
                      <div className="border-l-[3px] border-navy pl-8">
                         <p className="text-[16px] md:text-[18px] font-serif leading-relaxed text-navy/80 italic">
                            {previewData.desc || 'Waiting for descriptions segment payload...'}
                         </p>
                      </div>
                   </div>
                ) : (
                   <div className="flex-1 flex flex-col items-center justify-center text-center opacity-10">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                      <span className="text-[11px] font-black uppercase tracking-widest">Waiting for Data Synchronization</span>
                   </div>
                )}
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
