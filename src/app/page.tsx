'use client';

import React, { useState, useEffect } from 'react';
import { JOBS as STATIC_JOBS, NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import JobDetailModal from '@/components/JobDetailModal';
import RecruitmentCard from '@/components/RecruitmentCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'for-you' | 'all' | 'notifications'>('for-you');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const categories = ['Admission', 'Important', 'Result', 'Syllabus', 'Admit Card'];
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate logic
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentCatIndex((prev) => (prev + 1) % categories.length);
    }, 5000); // 5 second rotation
    return () => clearInterval(interval);
  }, [isAutoPlaying, categories.length]);

  const activeCategory = categories[currentCatIndex];
  const activeItems = (CATEGORY_DATA as any)[activeCategory] || [];

  useEffect(() => {
    // Lead user profile
    const savedProfile = localStorage.getItem('govrecruit_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) setDbJobs(data);
      } catch (e) { console.error(e); } finally { setIsLoading(false); }
    }
    fetchJobs();
  }, []);

  const filteredJobs = dbJobs.filter(job => {
    const matchesSearch = (job.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.org || job.organization || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  // ── RECRUITMENT MATCHING LOGIC ──
  const recommendedJobs = React.useMemo(() => {
    if (!userProfile || !userProfile.level) {
      return [];
    }
    const matched = getEligibleJobs(userProfile, dbJobs);
    return matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchScore: m.matchScore }));
  }, [userProfile, dbJobs]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">

      <main className="flex-1 pb-32 md:pb-48 animate-in fade-in duration-700">


        {/* VIEW: FOR YOU */}
        {activeTab === 'for-you' && (
          <>
            {/* HERO: UPPER TEXT ALIGNMENT (SKY-TEXT / BASE-BUILDING) */}
            <div className="w-full bg-[#FAFAFA] relative h-[210px] md:h-[300px] flex items-center overflow-hidden border-b-2 border-gray-100">
              {/* Background Layer (Anchored at Bottom for upper-text space) */}
              <div
                className="absolute inset-0 bg-cover bg-bottom lg:bg-[right_-150px_center] bg-[url('/mobilehero.png')] lg:bg-[url('/herobg1.png')] z-0 transition-opacity duration-1000"
              />

              {/* Soft Top-Down sky gradient */}
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/95 via-white/40 to-transparent z-1 block md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent z-1 hidden md:block"></div>

              {/* Pin top-right search (Tight corner) */}
              <div className="absolute top-2 right-2 md:top-6 md:right-8 z-30">
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-xl px-2 h-9 md:h-12 gap-1.5 w-[140px] md:w-[280px] transition-all focus-within:border-navy group shadow-sm">
                  <span className="text-gray-300 group-focus-within:text-navy transition-colors scale-[0.6] md:scale-90"><IconSearch /></span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-none outline-none text-[10px] md:text-sm text-navy flex-1 bg-transparent placeholder:text-gray-200 font-bold uppercase tracking-tight"
                    placeholder="Search All Jobs"
                  />
                </div>
              </div>

              {/* 🏛 Institutional Header Block (Laptop & Mobile) */}
              <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-5 pb-16 md:py-16">
                <div className="max-w-[800px] text-left space-y-3 md:space-y-6">
                  <h1 className="text-2xl md:text-6xl font-serif font-bold text-navy leading-tight drop-shadow-sm">
                    Recruitment for You
                  </h1>
                  <div className="max-w-[450px] md:max-w-[650px]">
                    <p className="text-[10px] md:text-[16px] text-navy/60 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Verified openings matched to your profile.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto p-4 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-12">

              <section className="space-y-12 h-full">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-transparent md:bg-white md:border-2 md:border-gray-100 p-0 md:p-6 md:shadow-sm relative overflow-hidden h-full flex flex-col md:rounded-3xl">
                  <header className="flex items-center justify-between border-b md:border-b-2 border-gray-100 pb-4 md:pb-8 mb-4 md:mb-10 px-2 md:px-0">
                    <div className="flex items-center gap-4">
                      <h2 className="text-lg md:text-2xl font-serif font-bold text-navy">
                        Recruitment For You
                      </h2>
                    </div>
                    <Link href="/all-jobs" className="text-[14px] font-serif font-bold text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline">View All ›</Link>
                  </header>

                  <div className="space-y-6 flex-1 flex flex-col">
                    {recommendedJobs.length === 0 ? (
                      <div className="flex-1 py-16 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm rounded-2xl">
                        <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
                          No recruitments currently match your specific qualification level and branch.
                        </p>
                        {!userProfile?.level && (
                          <Link
                            href="/profile"
                            className="mt-8 px-10 py-3 bg-navy text-white text-[14px] font-serif font-bold hover:bg-[#06142E] transition-all shadow-xl rounded-xl no-underline"
                          >
                            Setup Profile →
                          </Link>
                        )}
                      </div>
                    ) : (
                      recommendedJobs.map((job: any, idx) => (
                        <RecruitmentCard key={idx} job={job} isMatched={true} />
                      ))
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-8 min-w-0 md:min-w-[320px] h-full mt-32 md:mt-0 px-0 md:px-0">
                <div className="bg-white border border-gray-100 p-2.5 md:p-4 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div
                    onClick={() => setIsAutoPlaying(false)}
                    className="relative overflow-hidden flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-6 h-8 min-h-[32px]">
                        <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
                          <div className="p-1.5 md:p-2 bg-navy/5 text-navy rounded-lg flex-shrink-0">
                            <IconBell />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-[10px] md:text-[12px] font-black uppercase tracking-widest text-[#0D244D] animate-in fade-in slide-in-from-left duration-300 truncate">
                              {activeCategory}
                            </h3>
                            <div className="text-[8px] font-bold text-navy/30 uppercase tracking-[0.2em] mt-0.5 truncate">Live Bulletin</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex gap-1 flex-shrink-0">
                            <button
                              onClick={() => setCurrentCatIndex((prev) => (prev - 1 + categories.length) % categories.length)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-navy hover:text-white transition-all border-none cursor-pointer active:scale-90 shadow-sm"
                              title="Previous"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button
                              onClick={() => setCurrentCatIndex((prev) => (prev + 1) % categories.length)}
                              className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-navy/5 text-navy hover:bg-navy hover:text-white transition-all border-none cursor-pointer active:scale-90 shadow-sm"
                              title="Next"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div key={activeCategory} className="space-y-5 animate-in fade-in slide-in-from-right-8 duration-700 flex-1">
                        {activeItems.map((n, i) => (
                          <Link
                            href="#"
                            key={i}
                            className="group block border-l-2 border-transparent hover:border-navy hover:pl-4 transition-all"
                          >
                            <div className="text-[14px] md:text-[15px] font-serif font-bold text-[#344163] leading-snug group-hover:text-navy transition-colors mb-1">
                              {n.text}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-1 h-1 bg-green-500 rounded-full group-hover:animate-ping"></span>
                              <div className="text-[8px] font-black uppercase tracking-widest text-navy/20">{n.time}</div>
                            </div>
                          </Link>
                        ))}
                      </div>

                      {/* DOT TRACKER & VIEW ALL */}
                      <div className="mt-8 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {categories.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentCatIndex(idx);
                                setIsAutoPlaying(false);
                              }}
                              className={`h-1 rounded-full transition-all duration-500 border-none p-0 cursor-pointer ${idx === currentCatIndex ? 'bg-navy w-6' : 'bg-gray-200 w-2 hover:bg-gray-300'}`}
                            />
                          ))}
                        </div>
                        <Link 
                           href={`/${activeCategory.toLowerCase().replace(' ', '-')}`}
                           className="text-[12px] font-serif font-bold text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline"
                        >
                          View All ›
                        </Link>
                      </div>
                    </div>

                    <style jsx>{`
                      @keyframes progress {
                        from { transform: translateX(-100%); }
                        to { transform: translateX(0); }
                      }
                    `}</style>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}

        {/* VIEW: ALL JOBS */}
        {activeTab === 'all' && (
          <div className="max-w-[1440px] mx-auto px-0 md:px-12 py-4 md:py-12">
            <header className="mb-14 border-b-4 border-navy pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 px-4 md:px-0">
              <div>
                <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight text-navy leading-tight">National Registry</h1>
                <p className="text-[10px] md:text-gray-500 font-bold uppercase tracking-widest mt-4">Broadcasting official verified government openings across the national registry.</p>
              </div>
            </header>

            <div className="flex flex-col gap-6">
              {filteredJobs.length === 0 ? (
                <div className="py-40 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No recruitment records match this filter</div>
              ) : (
                filteredJobs.map((job, idx) => (
                  <RecruitmentCard key={idx} job={job} />
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="max-w-[800px] mx-auto p-4 md:p-20">
            <div className="bg-white border-2 border-gray-100 p-8 md:p-12 rounded-3xl shadow-sm">
              <h2 className="text-2xl font-serif font-bold text-navy mb-8">Live Notifications</h2>
              <div className="space-y-6">
                {NOTIFICATIONS.map((n, i) => (
                  <div key={i} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                    <div>
                      <p className="text-[15px] font-serif font-bold text-navy leading-snug">{n.text}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-2">{n.time} • OFFICIAL BULLETIN</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main >

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-6 md:py-10 px-6 md:px-12 mt-auto">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white border border-gray-100 rounded flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="" className="w-4 h-4 object-contain" /></div>
            <strong className="text-navy text-[11px] font-black uppercase tracking-wider">Rojgar Match</strong>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link href="#" className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-navy">Privacy</Link>
            <Link href="#" className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-navy">Terms</Link>
            <Link href="#" className="text-[9px] text-gray-400 font-bold uppercase tracking-widest hover:text-navy">Support</Link>
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-widest md:ml-10">© 2026</p>
          </div>
        </div>
      </footer>

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div >
  );
}
