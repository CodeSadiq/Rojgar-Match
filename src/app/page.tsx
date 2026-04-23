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
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [currentCatIndex, setCurrentCatIndex] = useState(1); // 1 is the first real category (after the clone of last)
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isMoving, setIsMoving] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isInViewport, setIsInViewport] = useState(false);
  const sidebarRef = React.useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Intersection Observer to detect when the sidebar is in view
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sidebarRef.current) {
      observer.observe(sidebarRef.current);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Auto-rotate logic: Resets whenever currentCatIndex changes to ensure a full 12s per category
  // Only rotates if isAutoPlaying is true AND it's in the viewport
  // DISABLED ON MOBILE: As per user request, mobile view should not auto-change
  useEffect(() => {
    if (!isMounted) return;
    const isMobile = windowWidth < 768;
    if (!isAutoPlaying || !isInViewport || isMobile) return;

    const timer = setTimeout(() => {
      setCurrentCatIndex((prev) => (prev + 1) % CATEGORIES.length);
    }, 12000);
    return () => clearTimeout(timer);
  }, [currentCatIndex, isAutoPlaying, isInViewport, windowWidth, isMounted]);

  const [registry, setRegistry] = useState<any>(null);

  const fetchJobs = React.useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setDbJobs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      if (isManual) {
        // Add a slight delay for better UX so the icon doesn't stop instantly
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    async function loadMetadata() {
      const registryData = await getRegistryData();
      setRegistry(registryData);
    }
    loadMetadata();

    const savedToken = localStorage.getItem('rojgarmatch_token');
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    const savedAuth = localStorage.getItem('rojgarmatch_auth');

    let profileData = null;
    if (savedProfile) {
      try {
        profileData = JSON.parse(savedProfile);
        setUserProfile(profileData);
      } catch (e) { console.error(e); }
    }

    if (savedToken || savedAuth || (profileData && profileData.isGuest)) {
      setIsLoggedIn(true);
    } else {
      // Logic Fix: If no login is found, stop loading immediately to show the Hero
      setIsLoading(false);
    }

    fetchJobs(true);
  }, [fetchJobs]);



  // ── STABILIZED CATEGORY ITEMS ──
  // Pre-mapping all categories helps ensure that the DOM nodes are stable 
  // and prevents "jumps" during re-renders like hovering.
  const categorizedItems = useMemo(() => {
    return CATEGORIES.map((cat) => {
      const items = cat === 'All Jobs'
        ? dbJobs.slice(0, 30).map((job) => ({
          id: job.id || job._id,
          text: job.title,
          time: getTimeAgo(job.createdAt || job.updatedAt),
          isJob: true
        }))
        : (cat === 'Important'
          ? (registry ? (registry.notifications || []) : NOTIFICATIONS)
          : (registry ? (registry.categories[cat] || []) : ((CATEGORY_DATA as any)[cat] || []))
        ).map((b: any) => ({
          ...b,
          id: b.id || b._id || Math.random().toString(),
          time: b.createdAt ? getTimeAgo(b.createdAt) : b.time,
          isJob: false
        }));
      return { cat, items };
    });
  }, [dbJobs, registry]);

  // ── INFINITE SLIDER LOGIC ──
  // Slider layout: [Clone of Last, All, Important, Syllabus, Admission, Result, Admit Card, Clone of All]
  const sliderItems = useMemo(() => {
    if (categorizedItems.length === 0) return [];
    return [
      categorizedItems[categorizedItems.length - 1],
      ...categorizedItems,
      categorizedItems[0]
    ];
  }, [categorizedItems]);

  const activeCategory = CATEGORIES[(currentCatIndex - 1 + CATEGORIES.length) % CATEGORIES.length] || CATEGORIES[0];
  const activeItems = categorizedItems.find(c => c.cat === activeCategory)?.items || [];

  // Seamless jump effect
  useEffect(() => {
    if (!isMounted) return;

    // Boundary checks for infinite looping
    if (currentCatIndex === 0) {
      const snapTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentCatIndex(CATEGORIES.length);
        // We wait a tiny bit after the index update to allow the snap to paint
        // and THEN we can unlock isMoving.
        setTimeout(() => setIsMoving(false), 30);
      }, 250);
      return () => clearTimeout(snapTimer);
    }
    
    if (currentCatIndex >= CATEGORIES.length + 1) {
      const snapTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentCatIndex(1);
        setTimeout(() => setIsMoving(false), 30);
      }, 250);
      return () => clearTimeout(snapTimer);
    }

    // Standard move: enable transitions and unlock after finish
    setIsTransitioning(true);
    const unlockTimer = setTimeout(() => setIsMoving(false), 250);
    return () => clearTimeout(unlockTimer);
  }, [currentCatIndex, isMounted]);

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
                      placeholder="Search Government Jobs..."
                    />
                  </label>
                </form>
              </div>

              {/* 🏛 Institutional Header Block (Laptop & Mobile) */}
              <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-3 pb-8 md:py-10">
                <div className="max-w-[800px] text-left space-y-2 md:space-y-6">
                  <h1 className="text-xl md:text-6xl font-serif font-bold text-navy/90 leading-tight drop-shadow-sm">
                    Government Jobs For You
                  </h1>
                  <div className="max-w-[450px] md:max-w-[650px]">
                    <p className="text-[10px] md:text-[16px] text-navy/40 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      Verified openings matched to your qualifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto pt-8 md:pt-12 pb-20 px-0 md:px-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 md:gap-12">

              <section className="space-y-12 h-full">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-transparent md:bg-white md:border-2 md:border-gray-200 p-0 md:p-6 md:shadow-sm relative overflow-hidden h-full flex flex-col rounded-xl">
                  <header className={`items-center justify-between border-b md:border-b-2 border-gray-100 pb-4 md:pb-8 mb-2 md:mb-10 pl-7 pr-4 md:px-0 ${(isMounted && (isLoggedIn || userProfile)) ? 'flex' : 'hidden'}`}>
                    <div className="flex items-center gap-4">
                      <h2 className="text-[15px] md:text-2xl font-serif font-bold text-navy/70 uppercase tracking-widest md:normal-case md:text-navy md:tracking-tight">
                        Recruitment For You
                      </h2>
                    </div>
                    <button 
                      onClick={() => fetchJobs(true)}
                      disabled={isRefreshing}
                      className={`p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-all active:scale-90 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
                      title="Refresh Jobs"
                    >
                      <IconRefresh className={isRefreshing ? 'animate-spin' : ''} />
                    </button>
                  </header>

                  <div className="space-y-4 md:space-y-6 flex-1 flex flex-col">
                    {isLoading ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                      </div>
                    ) : (!isLoggedIn && !userProfile) ? (
                      /* 🔗 CASE 1: LOGGED OUT / NEW VISITOR - SHOW RICH HERO (COMPACT) */
                      <div className="flex-1 py-8 md:py-20 px-4 md:px-6 flex flex-col items-center justify-center text-center mx-0 md:mx-0 overflow-hidden relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.02] rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy/[0.02] rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10 max-w-[800px] w-full">
                          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.25em] text-navy/40 mb-2 md:mb-3">
                            Welcome to RojgarMatch
                          </p>

                          <h2 className="text-2xl md:text-5xl font-serif font-bold text-navy leading-tight mb-2 md:mb-5">
                            Find Government Jobs and Updates
                          </h2>

                          <p className="text-[13px] md:text-[16px] text-navy/60 font-medium mb-6 md:mb-12 leading-relaxed max-w-[400px] md:max-w-[540px] mx-auto">
                            Add your education to see government jobs that match your qualification.
                          </p>

                          <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-5 mb-6 md:mb-12 text-left">
                            {/* ITEM 1 */}
                            <div className="bg-gray-50/80 p-3 md:p-6 rounded-xl border border-gray-100">
                              <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2 md:mb-3 text-navy">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                              </div>
                              <h4 className="text-[10px] md:text-[13px] font-bold text-navy mb-1 md:mb-2">Eligible Jobs</h4>
                              <p className="text-[9px] md:text-[11px] text-navy/50 leading-relaxed font-medium hidden md:block">See jobs that you are exactly eligible for based on your specific <b>Course</b> and <b>Branch</b>.</p>
                              <p className="text-[9px] text-navy/50 leading-relaxed font-medium md:hidden">Matched to your Course &amp; Branch.</p>
                            </div>

                            {/* ITEM 2 */}
                            <div className="bg-gray-50/80 p-3 md:p-6 rounded-xl border border-gray-100">
                              <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2 md:mb-3 text-navy">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                              </div>
                              <h4 className="text-[10px] md:text-[13px] font-bold text-navy mb-1 md:mb-2">All Jobs</h4>
                              <p className="text-[9px] md:text-[11px] text-navy/50 leading-relaxed font-medium hidden md:block">Browse through <b>all government jobs</b> or see <b>recommended ones</b> that match your profile.</p>
                              <p className="text-[9px] text-navy/50 leading-relaxed font-medium md:hidden">All &amp; recommended jobs.</p>
                            </div>

                            {/* ITEM 3 */}
                            <div className="bg-gray-50/80 p-3 md:p-6 rounded-xl border border-gray-100">
                              <div className="w-7 h-7 md:w-10 md:h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2 md:mb-3 text-navy">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                              </div>
                              <h4 className="text-[10px] md:text-[13px] font-bold text-navy mb-1 md:mb-2">Email Alerts</h4>
                              <p className="text-[9px] md:text-[11px] text-navy/50 leading-relaxed font-medium hidden md:block">Get a direct email alert the moment a government job matching your education is posted.</p>
                              <p className="text-[9px] text-navy/50 leading-relaxed font-medium md:hidden">Instant job match alerts.</p>
                            </div>
                          </div>

                          <Link
                            href="/login"
                            className="inline-flex items-center gap-3 px-8 md:px-12 py-3 md:py-4 bg-navy text-white text-[11px] md:text-[13px] font-bold uppercase tracking-widest hover:bg-[#06142E] transition-all shadow-2xl shadow-navy/20 rounded-xl no-underline group active:scale-[0.98]"
                          >
                            <span>Setup Profile</span>
                            <span className="group-hover:translate-x-1 transition-transform opacity-60">➜</span>
                          </Link>
                        </div>
                      </div>
                    ) : (isLoggedIn || userProfile) && (!userProfile?.qualifications || userProfile?.qualifications?.length === 0) ? (
                      /* 👤 LOGGED IN NO EDUCATION: SHOW SIMPLE PROMPT */
                      <div className="flex-1 py-14 md:py-24 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm rounded-3xl mx-4 md:mx-0">
                        <p className="text-[15px] md:text-[18px] font-medium text-navy/40 leading-relaxed max-w-[400px] text-center mb-10">
                          Set your qualification details to see eligible gov jobs.
                        </p>
                        <Link href="/profile" className="inline-flex items-center gap-3 px-8 py-3 bg-navy text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#06142E] transition-all shadow-2xl shadow-navy/20 rounded-xl no-underline group active:scale-[0.98]">
                          <span>Set Qualification</span>
                          <span className="group-hover:translate-x-1 transition-transform opacity-60">➜</span>
                        </Link>
                      </div>
                    ) : recommendedJobs.length === 0 ? (
                      /* ❌ NO MATCHES STATE */
                      <div className="flex-1 py-14 md:py-24 px-6 bg-white border-2 border-gray-100 flex flex-col items-center justify-center text-center shadow-sm rounded-3xl mx-4 md:mx-0">
                        <p className="text-[15px] md:text-[18px] font-medium text-navy/40 leading-relaxed max-w-[400px] text-center">
                          No recruitments currently match your specific qualification level and branch.
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col md:gap-4">
                        {recommendedJobs.slice(0, 5).map((job: any, idx) => (
                          <RecruitmentCard key={idx} job={job} isMatched={true} />
                        ))}

                        {/* View All Button */}
                        {recommendedJobs.length > 0 && (
                          <div className="px-4 md:px-0 mt-6 mb-8">
                            <Link
                              href="/for-you"
                              className="w-full flex items-center justify-center gap-2 py-4 bg-navy text-white text-[12px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#06142E] transition-all shadow-xl shadow-navy/10 active:scale-[0.98] group no-underline"
                            >
                              <span>View All {recommendedJobs.length} Matched Jobs</span>
                              <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <aside className="space-y-8 min-w-0 md:min-w-[320px] h-full mt-32 md:mt-0 px-4 md:px-0">
                <div ref={sidebarRef} className="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
                  <div
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                    className="relative overflow-hidden flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="p-0 flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-5 h-14 md:h-16 bg-[#0D244D] text-white shadow-lg relative z-10">
                        <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                          <div className="p-2 md:p-2.5 bg-white/10 text-white rounded-xl flex-shrink-0 backdrop-blur-md border border-white/10 shadow-inner">
                            <IconBell />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-white truncate">
                              {activeCategory}
                            </h3>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Desktop Arrows */}
                          <div className="hidden md:flex gap-3 flex-shrink-0">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isMoving) return;
                                setIsMoving(true);
                                setCurrentCatIndex((prev) => prev - 1);
                              }}
                              className="w-12 h-12 flex items-center justify-center cursor-pointer group/nav -m-2 z-50"
                              title="Previous"
                            >
                              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white group-hover/nav:bg-white group-hover/nav:text-[#0D244D] transition-all shadow-sm active:scale-90 border border-white/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                              </div>
                            </div>
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isMoving) return;
                                setIsMoving(true);
                                setCurrentCatIndex((prev) => prev + 1);
                              }}
                              className="w-12 h-12 flex items-center justify-center cursor-pointer group/nav -m-2 z-50"
                              title="Next"
                            >
                              <div className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white group-hover/nav:bg-white group-hover/nav:text-[#0D244D] transition-all shadow-sm active:scale-90 border border-white/5">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                              </div>
                            </div>
                          </div>

                          {/* Mobile View All (Placed where slider buttons were) */}
                          <Link
                            href={`/${(activeCategory || 'all-jobs').toLowerCase().replace(' ', '-')}`}
                            className="md:hidden text-[10px] font-black text-white/80 uppercase tracking-widest hover:text-white"
                          >
                            View All ›
                          </Link>
                        </div>
                      </div>

                      <div
                        className="p-4 relative overflow-hidden marquee-viewer touch-pan-y"
                        onTouchStart={(e) => { (window as any)._swipeX = e.touches[0].clientX; }}
                        onTouchEnd={(e) => {
                          const startX = (window as any)._swipeX;
                          const endX = e.changedTouches[0].clientX;
                          if (!startX) return;
                          const diff = startX - endX;
                          if (Math.abs(diff) > 50) {
                            if (!isMoving) {
                              setIsMoving(true);
                              setCurrentCatIndex((prev) => (diff > 0 ? prev + 1 : prev - 1));
                            }
                          }
                          (window as any)._swipeX = null;
                        }}
                      >
                        {/* THE SLIDING CONTENT TRACK */}
                        <div
                          className={`flex h-full ${isTransitioning ? 'transition-transform duration-[250ms] ease-out' : ''}`}
                          style={{ 
                            transform: `translateX(-${currentCatIndex * 100}%)`,
                            transitionProperty: isTransitioning ? 'transform' : 'none' 
                          }}
                        >
                          {sliderItems.map((catGroup, catIdx) => {
                            const { items, cat } = catGroup;
                            // Generate a perfectly unique key for clones to avoid re-mounting same-key items at different positions
                            const itemKey = `${cat}-${catIdx}`;
                            
                            return (
                              <div key={itemKey} className="w-full shrink-0 flex flex-col h-full overflow-hidden px-1">
                                <div
                                  className={`flex flex-col ${(isInViewport && items.length > 4) ? 'marquee-track' : ''}`}
                                  style={{
                                    animationDuration: `${Math.max(items.length * 4, 15)}s`,
                                    animationPlayState: (!isAutoPlaying || (isMounted && windowWidth < 768 && !isInViewport)) ? 'paused' : 'running'
                                  }}
                                >
                                  {/* Duplicate items for seamless marquee */}
                                  {[...items, ...((isInViewport && items.length > 4) ? items : [])].map((n: any, i: number) => (
                                    <Link
                                      href={n.isJob ? `/all-jobs/${n.id}` : `/bulletin/${n.id}`}
                                      key={`${n.id}-${i}`}
                                      className="group block py-4 border-b border-gray-100 last:border-0 transition-colors hover:bg-navy/[0.02] px-1 no-underline"
                                    >
                                      <div className="text-[13px] md:text-[14px] font-bold text-navy/80 leading-snug group-hover:text-navy transition-colors mb-2 line-clamp-2">
                                        {n.text}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className={`w-1 h-1 rounded-full group-hover:animate-pulse ${n.isJob ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                                        <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-navy/30 group-hover:text-navy/50">{n.time}</div>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                                {items.length === 0 && (
                                  <div className="py-20 text-center text-[10px] font-black uppercase tracking-widest text-gray-300"> No Records </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* SEGMENTED SLIDING INDICATOR */}
                      <div className="px-4 mt-auto flex flex-col items-center">
                        <div className="flex gap-1.5 h-1 w-full px-2 mb-2">
                          {CATEGORIES.map((_, idx) => {
                            const realIndex = (currentCatIndex - 1 + CATEGORIES.length) % CATEGORIES.length;
                            return (
                              <div key={idx} className="flex-1 bg-navy/[0.05] rounded-full overflow-hidden relative">
                                {idx === realIndex && (
                                  <div
                                    key={realIndex}
                                    className="absolute inset-0 bg-navy/30 rounded-full origin-left"
                                    style={{
                                      animation: (isMounted && isAutoPlaying && windowWidth >= 768) ? 'slideProgress 12s linear forwards' : 'none',
                                      transformOrigin: 'left'
                                    }}
                                  />
                                )}
                                {idx < realIndex && <div className="absolute inset-0 bg-navy/10 rounded-full" />}
                              </div>
                            );
                          })}
                        </div>

                        {/* Mobile Swipe Indicator */}
                        <div className="md:hidden flex items-center justify-center gap-2 py-2 opacity-30 mt-1">
                          <span className="text-[9px] font-bold text-navy uppercase tracking-[0.2em]">Swipe to explore</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="text-navy"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                        </div>
                      </div>

                      {/* ENHANCED VIEW ALL BUTTON (Desktop Only) */}
                      <div className="hidden md:block mt-3 px-4 pb-4">
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
                  overflow: hidden;
                }
                @media (max-width: 768px) {
                  .marquee-viewer {
                    height: 380px;
                  }
                }
                .marquee-track {
                  animation: marquee-vertical linear infinite;
                }
                @keyframes marquee-vertical {
                  from { transform: translateY(0); }
                  to { transform: translateY(-50%); }
                }
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                .hide-scrollbar {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
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
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-navy">Latest Notices</h2>
                  <p className="text-[10px] md:text-xs text-navy/40 font-bold uppercase tracking-widest mt-1">Official Government Updates</p>
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
