'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { JOBS as STATIC_JOBS, NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import { getRegistryData } from '@/lib/data-service';
import JobDetailModal from '@/components/JobDetailModal';
import RecruitmentCard from '@/components/RecruitmentCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import { getTimeAgo } from '@/lib/helpers';
import { CardSkeleton } from '@/components/LoadingState';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;

const CATEGORIES = ['All Jobs', 'Important', 'Syllabus', 'Admission', 'Result', 'Admit Card'];

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'for-you' | 'all' | 'notifications'>('for-you');
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCatIndex, setCurrentCatIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auto-rotate logic: Resets whenever currentCatIndex changes to ensure a full 12s per category
  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setTimeout(() => {
      setCurrentCatIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 12000);
    return () => clearTimeout(timer);
  }, [currentCatIndex, isAutoPlaying]);

  const [registry, setRegistry] = useState<any>(null);

  useEffect(() => {
    async function loadMetadata() {
      const registryData = await getRegistryData();
      setRegistry(registryData);
    }
    loadMetadata();

    // Lead user profile
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
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



  const activeCategory = CATEGORIES[currentCatIndex];
  const activeItems = useMemo(() => {
    if (activeCategory === 'All Jobs') {
      return dbJobs.slice(0, 30).map((job) => ({
        id: job.id || job._id,
        text: job.title,
        time: getTimeAgo(job.createdAt || job.updatedAt),
        isJob: true
      }));
    }

    let list = [];
    if (activeCategory === 'Important') {
      list = registry ? (registry.notifications || []) : NOTIFICATIONS;
    } else {
      list = registry ? (registry.categories[activeCategory] || []) : ((CATEGORY_DATA as any)[activeCategory] || []);
    }

    return list.map((b: any) => ({
      ...b,
      time: b.createdAt ? getTimeAgo(b.createdAt) : b.time
    }));
  }, [activeCategory, registry, dbJobs]);

  const isFuzzyMatch = (target: any, query: string) => {
    const t = String(target || "").toLowerCase();
    const q = query.toLowerCase();
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

  const filteredJobs = dbJobs.filter(job => {
    const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matchesSearch = queryTerms.length === 0 || queryTerms.every(term =>
      isFuzzyMatch(job.title, term) ||
      isFuzzyMatch(job.organization, term) ||
      isFuzzyMatch(job.org, term) ||
      (job.tags || []).some((t: string) => isFuzzyMatch(t, term)) ||
      isFuzzyMatch(job.location, term)
    );
    const matchesType = filterType === 'all' || job.type === filterType;
    return matchesSearch && matchesType;
  });

  // ── RECRUITMENT MATCHING LOGIC ──
  const recommendedJobs = React.useMemo(() => {
    if (!userProfile || !userProfile.qualifications || userProfile.qualifications.length === 0) {
      return [];
    }
    const matched = getEligibleJobs(userProfile, dbJobs);
    return matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchScore: m.matchScore, matchedOn: m.matchedOn }));
  }, [userProfile, dbJobs]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">
      {/* ⚡ PRELOAD HERO ASSETS */}
      <link rel="preload" as="image" href="/mobilehero.png" />
      <link rel="preload" as="image" href="/herobg1.png" />

      <main className="flex-1 pb-32 md:pb-48 animate-in fade-in duration-700">


        {/* VIEW: FOR YOU */}
        {activeTab === 'for-you' && (
          <>
            {/* HERO: UPPER TEXT ALIGNMENT (SKY-TEXT / BASE-BUILDING) */}
            <div className="w-full bg-[#FAFAFA] relative h-[160px] md:h-[220px] flex items-center overflow-hidden border-b-2 border-gray-100">
              {/* Background Layer (Anchored at Bottom for upper-text space) */}
              <div
                className="absolute inset-0 bg-cover bg-bottom lg:bg-[right_-150px_center] bg-[url('/mobilehero.png')] lg:bg-[url('/herobg1.png')] z-0 transition-opacity duration-1000"
              />

              {/* Soft Top-Down sky gradient */}
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white/95 via-white/40 to-transparent z-1 block md:hidden"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/5 to-transparent z-1 hidden md:block"></div>

              {/* Pin top-right search (Tight corner) */}
              <div className="absolute top-2 right-2 md:top-6 md:right-8 z-30 hidden md:block">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/all-jobs?q=${encodeURIComponent(searchQuery.trim())}`);
                    }
                  }}
                  className="bg-white border-2 border-gray-100 rounded-xl px-3 md:px-4 h-9 md:h-14 w-[160px] focus-within:w-[220px] md:w-[320px] md:focus-within:w-[380px] transition-all focus-within:border-navy group shadow-lg shadow-navy/5"
                >
                  <label className="flex items-center w-full h-full cursor-text gap-2">
                    <span className="text-gray-300 group-focus-within:text-navy transition-colors scale-75 md:scale-100"><IconSearch /></span>
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border-none outline-none text-[11px] md:text-sm text-navy flex-1 bg-transparent placeholder:text-gray-200 font-bold uppercase tracking-tight"
                      placeholder="Search Index..."
                    />
                  </label>
                </form>
              </div>

              {/* 🏛 Institutional Header Block (Laptop & Mobile) */}
              <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-3 pb-8 md:py-10">
                <div className="max-w-[800px] text-left space-y-2 md:space-y-6">
                  <h1 className="text-xl md:text-6xl font-serif font-bold text-navy leading-tight drop-shadow-sm">
                    Government Jobs For You
                  </h1>
                  <div className="max-w-[450px] md:max-w-[650px]">
                    <p className="text-[10px] md:text-[16px] text-navy/60 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Verified openings matched to your qualifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto p-4 md:p-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-12">

              <section className="space-y-12 h-full">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-transparent md:bg-white md:border-2 md:border-gray-200 p-1 md:p-6 md:shadow-sm relative overflow-hidden h-full flex flex-col rounded-xl">
                  <header className="flex items-center justify-between border-b md:border-b-2 border-gray-100 pb-4 md:pb-8 mb-4 md:mb-10 px-1 md:px-0">
                    <div className="flex items-center gap-4">
                      <h2 className="text-[12px] md:text-2xl font-sans md:font-serif font-semibold text-navy/40 uppercase tracking-widest md:normal-case md:text-navy md:tracking-tight">
                        Recruitment For You
                      </h2>
                    </div>
                    <Link href="/for-you" className="text-[11px] md:text-[14px] font-sans md:font-serif font-bold text-navy/30 md:text-[#2563EB] hover:text-[#1d4ed8] transition-colors no-underline">View All ›</Link>
                  </header>

                  <div className="space-y-6 flex-1 flex flex-col">
                    {isLoading ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                      </div>
                    ) : recommendedJobs.length === 0 ? (
                      <div className="flex-1 py-16 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm rounded-2xl">
                        <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
                          {(!userProfile?.qualifications || userProfile.qualifications.length === 0)
                            ? "Set your qualification details to see eligible gov jobs."
                            : "No recruitments currently match your specific qualification level and branch."
                          }
                        </p>
                        {(!userProfile?.qualifications || userProfile.qualifications.length === 0) && (
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
                <div className="bg-white border-2 border-gray-200 p-2.5 md:p-4 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div
                    onClick={() => setIsAutoPlaying(false)}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    className="relative overflow-hidden flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4 h-8 min-h-[32px]">
                        <div className="flex-1 flex items-center gap-3 min-w-0 pr-4">
                          <div className="p-1.5 md:p-2 bg-navy/5 text-navy rounded-lg flex-shrink-0">
                            <IconBell />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-[10px] md:text-[12px] font-bold uppercase tracking-widest text-[#0D244D] opacity-80 animate-in fade-in slide-in-from-left duration-300 truncate">
                              {activeCategory}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="flex gap-3 flex-shrink-0">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentCatIndex((prev) => (prev - 1 + CATEGORIES.length) % CATEGORIES.length);
                              }}
                              className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center cursor-pointer group/nav -m-2 md:-m-3 z-50"
                              title="Previous"
                            >
                              <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-navy/5 text-navy group-hover/nav:bg-navy group-hover/nav:text-white transition-all shadow-sm active:scale-95">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                              </div>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentCatIndex((prev) => (prev + 1) % CATEGORIES.length);
                              }}
                              className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center cursor-pointer group/nav -m-2 md:-m-3 z-50"
                              title="Next"
                            >
                              <div className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full bg-navy/5 text-navy group-hover/nav:bg-navy group-hover/nav:text-white transition-all shadow-sm active:scale-95">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-2 overflow-hidden marquee-viewer overflow-y-auto hide-scrollbar">
                        {/* THE MARQUEE TRACK */}
                        <div className="marquee-track flex flex-col group/marquee">
                          {/* Primary List */}
                          <div className="flex flex-col">
                            {activeItems.map((n: any, i: number) => (
                              <Link
                                href={n.isJob ? `/all-jobs/${n.id}` : `/bulletin/${n.id}`}
                                key={`p-${i}`}
                                className="group block py-4 border-b border-gray-100 last:border-0 transition-all hover:bg-navy/[0.02] px-1 no-underline"
                              >
                                <div className="text-[13px] md:text-[14px] font-medium text-[#344163] leading-snug group-hover:text-navy transition-colors mb-2 line-clamp-2">
                                  {n.text}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1 h-1 rounded-full group-hover:animate-pulse ${n.isJob ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                  <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-navy/30 group-hover:text-navy/50">{n.time}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                          {/* Duplicate List for Seamless Loop */}
                          <div className="flex flex-col" aria-hidden="true">
                            {activeItems.map((n: any, i: number) => (
                              <Link
                                href={n.isJob ? `/all-jobs/${n.id}` : `/bulletin/${n.id}`}
                                key={`d-${i}`}
                                className="group block py-4 border-b border-gray-100 last:border-0 transition-all hover:bg-navy/[0.02] px-1 no-underline"
                              >
                                <div className="text-[13px] md:text-[14px] font-medium text-[#344163] leading-snug group-hover:text-navy transition-colors mb-2 line-clamp-2">
                                  {n.text}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`w-1 h-1 rounded-full group-hover:animate-pulse ${n.isJob ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                  <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-navy/30 group-hover:text-navy/50">{n.time}</div>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* SEGMENTED SLIDING INDICATOR */}
                      <div className="mt-4 flex gap-1.5 h-1 w-full px-2">
                        {CATEGORIES.map((_, idx) => (
                          <div key={idx} className="flex-1 bg-navy/[0.05] rounded-full overflow-hidden relative">
                            {idx === currentCatIndex && (
                              <div
                                key={currentCatIndex}
                                className="absolute inset-0 bg-navy/30 rounded-full origin-left"
                                style={{
                                  animation: (isAutoPlaying && isMounted) ? 'slideProgress 12s linear forwards' : 'none',
                                  transformOrigin: 'left'
                                }}
                              />
                            )}
                            {idx < currentCatIndex && <div className="absolute inset-0 bg-navy/10 rounded-full" />}
                          </div>
                        ))}
                      </div>

                      {/* ENHANCED VIEW ALL BUTTON */}
                      <div className="mt-3">
                        <Link
                          href={`/${activeCategory.toLowerCase().replace(' ', '-')}`}
                          className="flex items-center justify-center gap-2 w-full py-4 bg-navy/5 text-navy text-[12px] font-bold uppercase tracking-widest rounded-xl hover:bg-navy hover:text-white transition-all group/btn"
                        >
                          View All {activeCategory}
                          <svg className="group-hover/btn:translate-x-1 transition-transform" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              <style jsx>{`
                @keyframes slideProgress {
                  from { transform: scaleX(0); }
                  to { transform: scaleX(1); }
                }
                .marquee-viewer {
                  height: 420px;
                  position: relative;
                  scrollbar-width: none;
                  -ms-overflow-style: none;
                }
                .marquee-viewer::-webkit-scrollbar {
                  display: none;
                }
                .marquee-track {
                  animation: marquee-vertical ${activeItems.length * 5}s linear infinite;
                }
                .marquee-track:hover {
                  animation-play-state: paused;
                }
                @keyframes marquee-vertical {
                  from { transform: translateY(0); }
                  to { transform: translateY(-50%); }
                }
              `}</style>
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
                  <RecruitmentCard key={idx} job={job} highlighted={!!searchQuery} />
                ))
              )}
            </div>
          </div>
        )}

        {/* VIEW: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="max-w-[800px] mx-auto p-4 md:p-12 md:pt-20">
            <div className="bg-white border-2 border-gray-100 p-6 md:p-12 rounded-3xl shadow-sm">
              <div className="flex items-center gap-4 mb-10 border-b-2 border-gray-100 pb-8">
                <div className="p-3 bg-navy text-white rounded-2xl">
                  <IconBell />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">Live Bulletin</h2>
                  <p className="text-[10px] md:text-xs text-navy/40 font-bold uppercase tracking-widest mt-1">Official Institutional Announcements</p>
                </div>
              </div>

              <div className="flex flex-col">
                {(registry?.notifications || NOTIFICATIONS).map((n: any, i: number) => (
                  <div key={i} className="group py-10 first:pt-0 last:pb-0 border-b-2 border-gray-100 last:border-0 hover:bg-navy/5 -mx-6 px-6 transition-all">
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 mt-1.5">
                        <span className={`block w-2.5 h-2.5 rounded-full ${n.dot === 'dot-green' ? 'bg-green-500' : n.dot === 'dot-amber' ? 'bg-amber-500' : 'bg-navy'}`}></span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/30">{n.createdAt ? getTimeAgo(n.createdAt) : n.time}</span>
                        </div>
                        <h3 className="text-lg md:text-xl font-serif font-bold text-[#344163] leading-snug group-hover:text-navy transition-colors line-clamp-2">
                          {n.text}
                        </h3>
                        <p className="text-[13px] md:text-[15px] text-navy/60 font-medium mt-3 leading-relaxed line-clamp-2">
                          {n.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main >

      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div >
  );
}
