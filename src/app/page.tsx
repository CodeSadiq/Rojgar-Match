'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { JOBS as STATIC_JOBS, NOTIFICATIONS, CATEGORY_DATA } from '@/lib/data';
import { getRegistryData } from '@/lib/data-service';
import JobDetailModal from '@/components/JobDetailModal';
import RecruitmentCard from '@/components/RecruitmentCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import { getTimeAgo, fmtDate } from '@/lib/helpers';
import { CardSkeleton } from '@/components/LoadingState';
import { getCachedJobs, setCachedJobs, getCachedRegistry, setCachedRegistry } from '@/lib/store';
import ScreeningModal from '@/components/ScreeningModal';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconBell = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

export default function Home() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>(['All Jobs']);
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
  const isNoQualifications = (isLoggedIn || userProfile) && (!userProfile?.qualifications || userProfile?.qualifications?.length === 0);

  // 🧠 AI Screening States
  const [isAIScreening, setIsAIScreening] = useState(false);
  const [isScreeningLoading, setIsScreeningLoading] = useState(false);
  const [screeningQuestions, setScreeningQuestions] = useState<any[]>([]);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, boolean | null>>({});
  const [screenedJobIds, setScreenedJobIds] = useState<string>('');

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    // Load dynamic categories from cache first to prevent flickering/flash on load
    const cachedCats = localStorage.getItem('rojgarmatch_categories');
    if (cachedCats) {
      try {
        setCategories(JSON.parse(cachedCats));
      } catch (e) { }
    }

    // Fetch dynamic categories
    fetch('/api/bulletin-categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const activeNames = data.map((c: any) => c.name);
          const newCats = ['All Jobs', ...activeNames];
          setCategories(newCats);
          localStorage.setItem('rojgarmatch_categories', JSON.stringify(newCats));
        }
      })
      .catch(e => console.error('Failed to load categories:', e));

    const savedJobs = localStorage.getItem('rojgarmatch_jobs');
    if (savedJobs) { try { setDbJobs(JSON.parse(savedJobs)); } catch (e) { } }
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    if (savedProfile) {
      try {
        const p = JSON.parse(savedProfile);
        setUserProfile(p);
        setScreeningQuestions(p.screeningQuestions || []);
        setScreenedJobIds(p.screenedJobIds || '');
      } catch (e) { }
    }
    const savedAnswers = localStorage.getItem('rojgarmatch_screening_answers');
    if (savedAnswers) { try { setScreeningAnswers(JSON.parse(savedAnswers)); } catch (e) { } }

    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    const handleAuthChange = () => {
      const savedProfile = localStorage.getItem('rojgarmatch_profile');
      if (savedProfile) {
        try {
          const p = JSON.parse(savedProfile);
          setUserProfile(p);
          setScreeningQuestions(p.screeningQuestions || []);
          setScreenedJobIds(p.screenedJobIds || '');
        } catch (e) { }
      } else {
        setUserProfile(null);
        setScreeningQuestions([]);
        setScreenedJobIds('');
      }
      const savedAnswers = localStorage.getItem('rojgarmatch_screening_answers');
      if (savedAnswers) {
        try { setScreeningAnswers(JSON.parse(savedAnswers)); } catch (e) { }
      } else {
        setScreeningAnswers({});
      }
    };
    window.addEventListener('rojgarmatch_auth_change', handleAuthChange);

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
      window.removeEventListener('rojgarmatch_auth_change', handleAuthChange);
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
      setCurrentCatIndex((prev) => (prev + 1) % categories.length);
    }, 12000);
    return () => clearTimeout(timer);
  }, [currentCatIndex, isAutoPlaying, isInViewport, windowWidth, isMounted, categories]);

  const [registry, setRegistry] = useState<any>(null);

  const fetchJobs = React.useCallback(async (isManual = false) => {
    setIsRefreshing(true); // Always spin when fetching from DB
    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Non-JSON response from /api/jobs");
        return;
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        setDbJobs(data);
        setCachedJobs(data); // Save to cache
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      // Keep spinning for at least 600ms for visual feedback
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    async function loadMetadata() {
      const cached = getCachedRegistry();
      if (cached) {
        setRegistry(cached);
        return;
      }
      const registryData = await getRegistryData();
      setRegistry(registryData);
      setCachedRegistry(registryData);
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

    // Check cache before fetching jobs
    const cachedJobs = getCachedJobs();
    if (cachedJobs) {
      setDbJobs(cachedJobs);
      setIsLoading(false);
      setIsRefreshing(false);
    } else {
      fetchJobs(false);
    }

    // Load screening answers from localStorage
    const savedAnswers = localStorage.getItem('rojgarmatch_screening_answers');
    if (savedAnswers) {
      try {
        setScreeningAnswers(JSON.parse(savedAnswers));
      } catch (e) { console.error(e); }
    }

    // Sync remote profile if logged in
    const syncProfile = async () => {
      const isAuth = localStorage.getItem('rojgarmatch_auth');
      if (!isAuth) return;
      const authData = JSON.parse(isAuth);
      if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
        try {
          const res = await fetch(`/api/profile?email=${authData.email}`);
          if (res.ok) {
            const contentType = res.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const remoteUser = await res.json();
              if (remoteUser.profile) {
                const p = remoteUser.profile;
                setUserProfile(p);
                if (p.screeningQuestions) setScreeningQuestions(p.screeningQuestions);
                if (p.screeningAnswers) setScreeningAnswers(p.screeningAnswers);
                if (p.screenedJobIds) setScreenedJobIds(p.screenedJobIds);
                localStorage.setItem('rojgarmatch_profile', JSON.stringify(p));
              }
            }
          }
        } catch (e) { console.error('Profile sync error:', e); }
      }
    };
    syncProfile();
  }, [fetchJobs]);

  const openAIScreening = () => {
    setIsAIScreening(true);
  };

  const runAIScreening = async () => {
    if (!userProfile || recommendedJobs.length === 0) return;

    setIsScreeningLoading(true);
    setIsAIScreening(true);

    try {
      const matchedPostsContext = recommendedJobs.flatMap(job =>
        job.matchedPosts
          .filter((post: any) => {
            const hasPrereq = post.prerequisite && post.prerequisite.length > 0;
            const hasExtraText = post.qualification?.extraQualificationText && post.qualification.extraQualificationText.trim().length > 0;
            return hasPrereq || hasExtraText;
          })
          .map((post: any) => ({
            name: post.name,
            jobTitle: job.title,
            prerequisite: post.prerequisite || [],
            "qualification.extraQualificationText": post.qualification?.extraQualificationText || "",
            extraQualificationText: post.qualification?.extraQualificationText || "",
            qualification: {
              course: Array.isArray(post.qualification?.course)
                ? post.qualification.course
                : (post.qualification?.course ? [post.qualification.course] : []),
              branch: post.qualification?.branch || [],
              extraQualificationText: post.qualification?.extraQualificationText || ""
            }
          }))
      );

      const res = await fetch('/api/ai/screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userProfile: {
            qualifications: userProfile.qualifications,
            gender: userProfile.gender,
            screeningAnswers: screeningAnswers,
            existingQuestions: screeningQuestions.map(q => q.text)
          },
          matchedPosts: matchedPostsContext
        })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await res.text();
        throw new Error(`Server returned non-JSON response: ${text.slice(0, 100)}`);
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Screening failed with status ${res.status}`);
      }
      const data = await res.json();
      const newQuestionsRaw = data.questions || [];

      // Ensure IDs are globally unique to avoid React key collisions
      const newQuestions = newQuestionsRaw.map((q: any, idx: number) => ({
        ...q,
        id: q.id ? `q_${Date.now()}_${idx}_${q.id}` : `q_${Date.now()}_${idx}`
      }));

      setScreeningQuestions(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const filteredNew = newQuestions.filter((q: any) => !existingIds.has(q.id));
        return [...prev, ...filteredNew];
      });

      // Update Profile Record
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = {
        ...existingProfile,
        screeningQuestions: [...(existingProfile.screeningQuestions || []), ...newQuestions.filter((q: any) => !(existingProfile.screeningQuestions || []).some((ex: any) => ex.id === q.id))],
        // PRESERVE ANSWERS for phased screening
        screeningAnswers: screeningAnswers
      };

      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(screeningAnswers));

      if (userProfile.email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userProfile.email, profile: updatedProfile }),
        });
      }
    } catch (e: any) {
      console.error('AIScreening Error:', e.message);
    } finally {
      setIsScreeningLoading(false);
    }
  };

  const handleAnswer = async (questionId: string, answer: boolean | null) => {
    const newAnswers = { ...screeningAnswers, [questionId]: answer };
    setScreeningAnswers(newAnswers);

    // 🛡️ PER-USER DB PERSISTENCE (Like qualifications)
    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (isAuth) {
      const authData = JSON.parse(isAuth);
      const email = authData.email;

      // Update Local Storage for ALL (Guest & Logged In)
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = { ...existingProfile, screeningAnswers: newAnswers };
      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(newAnswers));

      // Sync to DB only if NOT guest
      if (email && email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, profile: updatedProfile }),
        });
      }
    } else {
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(newAnswers));
    }
  };

  const handleFilterByText = async (text: string) => {
    if (!userProfile) return;
    setIsScreeningLoading(true);
    try {
      const allMatchedPosts = recommendedJobs.flatMap(job =>
        job.matchedPosts.map((post: any) => ({
          name: post.name,
          jobTitle: job.title,
          prerequisite: post.prerequisite,
          qualification: post.qualification,
          course: post.course
        }))
      );

      const res = await fetch('/api/ai/filter-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userText: text, matchedPosts: allMatchedPosts })
      });

      if (!res.ok) throw new Error('Filter failed');
      const data = await res.json();

      if (data.blockedPostNames) {
        const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
        const updatedProfile = {
          ...existingProfile,
          blockedPostNames: data.blockedPostNames
        };

        setUserProfile(updatedProfile);
        localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));

        if (userProfile.email && userProfile.email !== 'guest@rojgarmatch.local') {
          await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userProfile.email, profile: updatedProfile }),
          });
        }
      }
    } catch (e) {
      console.error('Filter Error:', e);
    } finally {
      setIsScreeningLoading(false);
    }
  };

  const handleClearScreening = async () => {
    setScreeningAnswers({});
    setScreeningQuestions([]);
    localStorage.removeItem('rojgarmatch_screening_answers');

    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (isAuth) {
      const authData = JSON.parse(isAuth);
      const email = authData.email;
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = {
        ...existingProfile,
        screeningQuestions: [],
        screeningAnswers: {},
        blockedPostNames: []
      };

      setUserProfile(updatedProfile);
      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));

      if (email && email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, profile: updatedProfile }),
        });
      }
    }
  };



  // ── RECRUITMENT MATCHING LOGIC ──
  const recommendedJobs = React.useMemo(() => {
    if (!userProfile || !userProfile.qualifications || userProfile.qualifications.length === 0) {
      return [];
    }
    const matched = getEligibleJobs(userProfile, dbJobs);
    let filtered = matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchScore: m.matchScore, matchedOn: m.matchedOn }));

    // 🛡️ STAGE 2: AI Soft Filter (Screening)
    filtered = filtered.map(job => {
      const activePosts = job.matchedPosts.filter((post: any) => {
        const isBlockedByQuestion = screeningQuestions.some((q: any) =>
          q.impactedPostNames?.includes(post.name) && screeningAnswers[q.id] === false
        );
        const isBlockedByText = userProfile.blockedPostNames?.includes(post.name);
        return !isBlockedByQuestion && !isBlockedByText;
      });
      return { ...job, matchedPosts: activePosts };
    }).filter(job => job.matchedPosts.length > 0);

    return filtered;
  }, [userProfile, dbJobs, screeningAnswers, screeningQuestions]);

  const hasMoreToScreen = React.useMemo(() => {
    return recommendedJobs.some(job =>
      job.matchedPosts.some((post: any) => {
        const hasPrereq = post.prerequisite && post.prerequisite.length > 0;
        const hasExtraText = post.qualification?.extraQualificationText && post.qualification.extraQualificationText.trim().length > 0;
        return hasPrereq || hasExtraText;
      })
    );
  }, [recommendedJobs]);

  // ── STABILIZED CATEGORY ITEMS ──
  // Pre-mapping all categories helps ensure that the DOM nodes are stable 
  // and prevents "jumps" during re-renders like hovering.
  const categorizedItems = useMemo(() => {
    return categories.map((cat) => {
      let items = [];
      if (cat === 'All Jobs') {
        // Always show all recent jobs in the 'All Jobs' slider category
        const sourceJobs = dbJobs;
        items = sourceJobs.slice(0, 30).map((job) => ({
          id: job.id || job._id,
          text: job.title,
          time: getTimeAgo(job.createdAt || job.updatedAt),
          isJob: true,
          lastDate: job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate || job.notificationType || (job as any).displayStatus?.notificationType || "DETAILS AWAITED"
        }));
      } else {
        items = (cat === 'Important'
          ? (registry ? (registry.notifications || []) : NOTIFICATIONS)
          : (registry ? (registry.categories[cat] || []) : ((CATEGORY_DATA as any)[cat] || []))
        ).map((b: any) => ({
          ...b,
          id: b.id || b._id || Math.random().toString(),
          time: b.createdAt ? getTimeAgo(b.createdAt) : b.time,
          isJob: false
        }));
      }
      return { cat, items };
    });
  }, [dbJobs, registry, recommendedJobs, categories]);

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

  const activeCategory = categories[(currentCatIndex - 1 + categories.length) % categories.length] || categories[0];
  const activeItems = categorizedItems.find(c => c.cat === activeCategory)?.items || [];

  // Seamless jump effect
  useEffect(() => {
    if (!isMounted) return;

    // Boundary checks for infinite looping
    if (currentCatIndex === 0) {
      const snapTimer = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentCatIndex(categories.length);
        // We wait a tiny bit after the index update to allow the snap to paint
        // and THEN we can unlock isMoving.
        setTimeout(() => setIsMoving(false), 30);
      }, 250);
      return () => clearTimeout(snapTimer);
    }

    if (currentCatIndex >= categories.length + 1) {
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
  }, [currentCatIndex, isMounted, categories]);

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

  const isFilterApplied = Object.keys(screeningAnswers).length > 0 || (userProfile?.blockedPostNames && userProfile.blockedPostNames.length > 0);


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">
      {/* ⚡ PRELOAD HERO ASSETS */}
      <link rel="preload" as="image" href="/mobilehero.png" media="(max-width: 1023px)" />
      <link rel="preload" as="image" href="/herobg1.png" media="(min-width: 1024px)" />

      <main className="flex-1 pb-32 md:pb-48 animate-in fade-in duration-700">


        {/* VIEW: FOR YOU */}
        {activeTab === 'for-you' && (
          <>
            {/* MOBILE HERO (ROJGAR MATCH) */}
            <div className="flex md:hidden w-full bg-gradient-to-b from-white via-[#F8FAFC] to-[#E2E8F0] relative py-10 px-6 items-center justify-center flex-col text-center border-b border-gray-200 overflow-hidden">
              <div className="absolute inset-0 bg-cover bg-bottom bg-[url('/mobilehero.png')] opacity-[0.28] z-0" />
              <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-white to-transparent z-1" />
              <div className="relative z-10 flex flex-col items-center mt-1">
                <h1 className="text-[36px] sm:text-[40px] font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0D244D] via-[#1a3a8f] to-[#3b5fe2] tracking-tight leading-normal py-2 px-1 drop-shadow-sm">
                  Rojgar Match
                </h1>

                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-navy/60 pl-[0.25em] -mt-1">
                  Government Jobs Portal
                </span>
              </div>
            </div>

            {/* HERO: UPPER TEXT ALIGNMENT (SKY-TEXT / BASE-BUILDING) */}
            <div className="hidden md:flex w-full bg-[#FAFAFA] relative h-[160px] md:h-[220px] items-center overflow-hidden border-b-2 border-gray-100">
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
                      placeholder="Search Jobs"
                    />
                  </label>
                </form>
              </div>

              {/* 🏛 Institutional Header Block (Laptop & Mobile) */}
              <div className="relative z-10 w-full max-w-[1440px] mx-auto px-6 md:px-12 pt-3 pb-3 md:py-10 -mt-8 md:mt-0">
                <div className="max-w-[800px] text-left space-y-0.5 md:space-y-2">
                  <h1 className="text-xl md:text-6xl font-serif font-bold text-navy/90 leading-tight drop-shadow-sm">
                    Government Jobs For You
                  </h1>
                  <div className="max-w-[450px] md:max-w-[650px]">
                    <p className="text-[10px] md:text-[16px] text-navy/40 font-bold uppercase tracking-[0.2em] leading-relaxed">
                      See government openings matched to your qualifications.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENT GRID */}
            <div className="max-w-[1440px] mx-auto pt-14 md:pt-12 pb-20 px-4 md:px-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-3.5 md:gap-12">

              <section className="space-y-12 h-full">

                {/* RECRUITMENT SECTION CONTAINER */}
                <div className="bg-white border-2 border-gray-200 md:border-gray-200 p-0 md:p-6 shadow-sm md:shadow-sm relative overflow-hidden h-full flex flex-col rounded-lg md:rounded-xl">
                  <header className={`flex-col md:flex-row md:items-center justify-between bg-[#166534] md:bg-transparent px-4 md:px-0 py-2.5 md:py-0 md:pb-8 mb-0 md:mb-10 shadow-lg md:shadow-none border-b-0 md:border-b-2 border-gray-100 ${(isMounted && (isLoggedIn || userProfile)) ? 'flex' : 'hidden'}`}>
                    <div className="flex flex-col w-full md:w-auto">
                      <div className="flex items-center justify-between w-full mb-2 md:mb-0">
                        <h2 className="text-[11.5px] md:text-3xl font-serif font-bold text-white md:text-[#0D244D] uppercase md:normal-case tracking-[0.12em] md:tracking-tight truncate pr-2">
                          <span>Recruitments for You</span>
                        </h2>
                        <Link href="/for-you" className="md:hidden text-[9px] font-black text-white/70 uppercase tracking-widest hover:text-white no-underline whitespace-nowrap pl-1">
                          View All ›
                        </Link>
                      </div>

                      {isMounted && (
                        <div className="flex md:hidden items-center justify-between w-full">
                          {/* Mobile Full AI Button */}
                          {(userProfile?.qualifications && userProfile.qualifications.length > 0) ? (
                            <button
                              onClick={openAIScreening}
                              disabled={isScreeningLoading}
                              className={`flex items-center justify-center gap-1.5 h-7 px-3.5 rounded-full transition-all active:scale-95 shadow-md ${isFilterApplied ? 'bg-blue-500 text-white' : 'bg-white text-[#166534] hover:bg-gray-50'}`}
                            >
                              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                                <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                              </svg>
                              <span className="text-[9.5px] font-black tracking-wider uppercase">
                                {isScreeningLoading ? '...' : (isFilterApplied ? 'AI Filter Active' : 'Filter more with AI')}
                              </span>
                              {isFilterApplied && !isScreeningLoading && (
                                <span className="w-1 h-1 rounded-full bg-white ml-0.5" />
                              )}
                            </button>
                          ) : <div />}

                          {/* Mobile Refresh Button */}
                          {!isNoQualifications && (
                            <button
                              onClick={() => fetchJobs(true)}
                              disabled={isRefreshing}
                              className={`flex items-center justify-center w-7 h-7 rounded-full bg-white/10 text-white/90 hover:bg-white/20 hover:text-white transition-all active:scale-90 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
                              title="Refresh Jobs"
                            >
                              <IconRefresh className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Desktop AI Filter & Refresh */}
                    {isMounted && (
                      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
                        {(userProfile?.qualifications && userProfile.qualifications.length > 0) && (
                          <button
                            onClick={openAIScreening}
                            disabled={isScreeningLoading}
                            className={`flex justify-center items-center gap-1.5 h-9 px-4 rounded-full transition-all active:scale-95 border ${isFilterApplied ? 'bg-blue-50/50 text-blue-600 border-blue-200' : 'bg-navy/[0.04] text-navy/50 border-navy/10 hover:bg-navy/[0.06] hover:text-navy/70'}`}
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke={isFilterApplied ? "#2563EB" : "currentColor"} strokeWidth={isFilterApplied ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
                              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                              <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
                            </svg>
                            <span className="text-[12px] font-bold uppercase tracking-wider">
                              {isScreeningLoading ? '...' : (isFilterApplied ? 'AI Filters Active' : 'Filter more with AI')}
                            </span>
                            {isFilterApplied && !isScreeningLoading && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
                            )}
                          </button>
                        )}

                        {!isNoQualifications && (
                          <button
                            onClick={() => fetchJobs(true)}
                            disabled={isRefreshing}
                            className={`hidden md:flex p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-all active:scale-90 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
                          >
                            <IconRefresh className={isRefreshing ? 'animate-spin' : ''} />
                          </button>
                        )}
                      </div>
                    )}
                  </header>

                  <div className="space-y-4 md:space-y-6 flex-1 flex flex-col p-4 md:p-0">
                    {/* 🧠 AI SCREENING MODAL */}
                    <ScreeningModal
                      isOpen={isAIScreening}
                      isLoading={isScreeningLoading}
                      questions={screeningQuestions}
                      answers={screeningAnswers}
                      onAnswer={handleAnswer}
                      onClose={() => setIsAIScreening(false)}
                      onClearAll={handleClearScreening}
                      onGenerateQuestions={runAIScreening}
                      onFilterByText={handleFilterByText}
                      hasTextFilter={userProfile?.blockedPostNames && userProfile.blockedPostNames.length > 0}
                      hasMoreToScreen={hasMoreToScreen}
                    />
                    {isLoading ? (
                      <div className="space-y-6">
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                      </div>
                    ) : (!isLoggedIn && !userProfile) ? (
                      /* 🔗 CASE 1: LOGGED OUT / NEW VISITOR - SHOW RICH HERO (COMPACT) */
                      <div className="flex-1 py-10 md:py-20 px-5 md:px-8 bg-transparent border-0 shadow-none rounded-none flex flex-col items-center justify-center text-center mx-0 overflow-hidden relative">
                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-navy/[0.02] rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-navy/[0.02] rounded-full -ml-32 -mb-32 blur-3xl"></div>

                        <div className="relative z-10 max-w-[800px] w-full">
                          <p className="text-[20px] md:text-[18px] font-serif font-bold text-[#0D244D]/90 mb-2 md:mb-3">
                            Welcome to Rojgar Match
                          </p>

                          <p className="text-[15px] md:text-[19px] text-navy/70 font-medium mb-12 md:mb-12 leading-relaxed max-w-[680px] mx-auto">
                            Find government jobs and updates that match your qualifications.
                          </p>

                          <div className="flex flex-col md:grid md:grid-cols-3 gap-6 md:gap-5 mb-8 md:mb-12 text-left w-full max-w-[480px] md:max-w-none mx-auto">
                            {/* ITEM 1 */}
                            <div className="flex flex-row md:flex-col items-start gap-4 md:gap-3 bg-transparent md:bg-gray-50/80 p-0 md:p-5 rounded-none md:rounded-xl border-0 md:border border-gray-100">
                              <div className="w-10 h-10 md:w-10 md:h-10 bg-navy/5 text-navy rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm md:shadow-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline></svg>
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-[12px] md:text-[13px] font-bold text-navy uppercase tracking-wider">
                                  Eligible Jobs
                                </h4>
                                <p className="text-[11px] text-navy/50 leading-relaxed font-medium">
                                  See jobs that you are exactly eligible for based on your specific Course and Branch, plus AI Filter for specialized requirements.
                                </p>
                              </div>
                            </div>

                            {/* ITEM 2 */}
                            <div className="flex flex-row md:flex-col items-start gap-4 md:gap-3 bg-transparent md:bg-gray-50/80 p-0 md:p-5 rounded-none md:rounded-xl border-0 md:border border-gray-100">
                              <div className="w-10 h-10 md:w-10 md:h-10 bg-navy/5 text-navy rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm md:shadow-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-[12px] md:text-[13px] font-bold text-navy uppercase tracking-wider">
                                  All Jobs
                                </h4>
                                <p className="text-[11px] text-navy/50 leading-relaxed font-medium">
                                  Browse through all government jobs or see recommended ones that match your qualification.
                                </p>
                              </div>
                            </div>

                            {/* ITEM 3 */}
                            <div className="flex flex-row md:flex-col items-start gap-4 md:gap-3 bg-transparent md:bg-gray-50/80 p-0 md:p-5 rounded-none md:rounded-xl border-0 md:border border-gray-100">
                              <div className="w-10 h-10 md:w-10 md:h-10 bg-navy/5 text-navy rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm md:shadow-none">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                              </div>
                              <div className="space-y-0.5">
                                <h4 className="text-[12px] md:text-[13px] font-bold text-navy uppercase tracking-wider">
                                  Email Alerts
                                </h4>
                                <p className="text-[11px] text-navy/50 leading-relaxed font-medium">
                                  Get a direct email alert the moment a government job matching your education is posted.
                                </p>
                              </div>
                            </div>
                          </div>

                          <Link
                            href="/login"
                            className="inline-flex items-center gap-3 px-8 md:px-12 py-3 md:py-4 bg-navy text-white text-[11px] md:text-[13px] font-bold uppercase tracking-widest hover:bg-[#06142E] transition-all shadow-2xl shadow-navy/20 rounded-xl no-underline group active:scale-[0.98]"
                          >
                            <span>Setup profile to see eligible jobs</span>
                            <span className="group-hover:translate-x-1 transition-transform opacity-60">➜</span>
                          </Link>
                        </div>
                      </div>
                    ) : (isLoggedIn || userProfile) && (!userProfile?.qualifications || userProfile?.qualifications?.length === 0) ? (
                      /* 👤 LOGGED IN NO EDUCATION: SHOW SIMPLE PROMPT */
                      <div className="flex-1 py-14 md:py-24 px-6 bg-transparent border-0 flex flex-col items-center justify-center md:justify-start md:pt-20 text-center shadow-none rounded-none mx-0">
                        <p className="text-[15px] md:text-[18px] font-medium text-navy/40 leading-relaxed max-w-[400px] text-center mb-10">
                          Set your qualification details to see eligible gov jobs.
                        </p>
                        <Link href="/profile" className="inline-flex items-center gap-3 px-6 py-3 bg-[#166534] md:bg-navy text-white text-[11px] font-bold uppercase tracking-widest hover:bg-[#0f4a24] md:hover:bg-[#06142E] transition-all shadow-2xl shadow-green-900/10 md:shadow-navy/20 rounded-lg md:rounded-xl no-underline group active:scale-[0.98] whitespace-nowrap">
                          <span>setup qualification</span>
                          <span className="group-hover:translate-x-1 transition-transform opacity-60">➜</span>
                        </Link>
                      </div>
                    ) : recommendedJobs.length === 0 ? (
                      /* ❌ NO MATCHES STATE */
                      <div className="flex-1 py-14 md:py-24 px-6 bg-transparent border-0 flex flex-col items-center justify-center text-center shadow-none rounded-none mx-0">
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
                          <div className="hidden md:block px-0 mt-6 mb-8">
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

              <aside className="space-y-8 min-w-0 md:min-w-[320px] h-full mt-8 md:mt-0 px-0 pb-10">
                {/* DESKTOP ONLY SLIDER PANEL */}
                <div ref={sidebarRef} className="hidden md:flex bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden flex-col h-full">
                  <div
                    onClick={() => setIsAutoPlaying(prev => !prev)}
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                    className="relative overflow-hidden flex-1 flex flex-col cursor-pointer"
                  >
                    <div className="p-0 flex-1 flex flex-col">
                      <div className="flex items-center justify-between px-5 py-4 bg-[#0D244D] text-white shadow-lg relative z-10">
                        <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                          <div className="p-2 md:p-2.5 bg-white/10 text-white rounded-xl flex-shrink-0 backdrop-blur-md border border-white/10 shadow-inner">
                            <IconBell />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <h3 className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-white truncate mb-1">
                              {activeCategory}
                            </h3>
                            <Link
                              href={`/${activeCategory.toLowerCase().replace(' ', '-')}`}
                              className="hidden md:flex text-[11px] font-black text-white/60 hover:text-white uppercase tracking-[0.2em] items-center gap-1.5 transition-all no-underline"
                            >
                              <span>View All</span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
                            </Link>
                          </div>
                        </div>

                        {/* Mobile Dot Indicators in Heading Bar (Top Middle) */}
                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 flex gap-1.5 items-center md:hidden">
                          {categories.map((_, idx) => {
                            const realIndex = (currentCatIndex - 1 + categories.length) % categories.length;
                            const isActive = idx === realIndex;
                            return (
                              <div
                                key={idx}
                                className={`w-1 h-1 rounded-full transition-all duration-300 ${isActive ? 'bg-white w-2.5' : 'bg-white/30'
                                  }`}
                              />
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          {/* Mobile View All (Old Style) */}
                          <Link
                            href={`/${(activeCategory || 'all-jobs').toLowerCase().replace(' ', '-')}`}
                            className="md:hidden text-[10px] font-black text-white/80 uppercase tracking-widest hover:text-white no-underline"
                          >
                            View All ›
                          </Link>

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
                        </div>
                      </div>



                      <div
                        className="p-0 relative overflow-hidden marquee-viewer touch-pan-y bg-[#F8FAFC] md:bg-transparent pt-4 md:pt-2.5"
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
                          className={`flex h-full w-full ${isTransitioning ? 'transition-transform duration-[250ms] ease-out' : ''}`}
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
                              <div key={itemKey} className="w-full shrink-0 flex flex-col h-full overflow-hidden px-5 py-2.5">
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
                                      className="group block p-4 mb-3 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-[#0D244D]/25 hover:bg-[#0D244D]/[0.01] hover:shadow-md transition-all no-underline mx-0.5"
                                    >
                                      <div className="text-[13.5px] font-sans font-bold text-navy/80 leading-snug group-hover:text-[#0D244D] transition-colors line-clamp-2 mb-2">
                                        {n.text}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <div className="text-[9px] font-bold uppercase tracking-wider text-navy/40 group-hover:text-navy/55">{n.time}</div>
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
                      <div className="px-4 mt-auto hidden md:flex flex-col items-center pb-4 md:pb-10">
                        <div className="flex gap-1.5 h-1 w-full px-2 mb-2">
                          {categories.map((_, idx) => {
                            const realIndex = (currentCatIndex - 1 + categories.length) % categories.length;
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
                      </div>


                    </div>
                  </div>
                </div>

                {/* MOBILE ONLY MULTIPLE PANELS */}
                <div className="flex md:hidden flex-col gap-3.5">
                  {categorizedItems.map(category => (
                    <div key={category.cat} className="bg-white border-2 border-gray-200 rounded-lg md:rounded-xl overflow-hidden shadow-sm flex flex-col">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-[#0D244D] text-white">
                        <div className="flex items-center min-w-0">
                          <h3 className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-white truncate">
                            {category.cat}
                          </h3>
                        </div>
                        <Link
                          href={`/${category.cat.toLowerCase().replace(' ', '-')}`}
                          className="text-[9px] font-black text-white/80 uppercase tracking-widest hover:text-white no-underline flex-shrink-0 ml-3"
                        >
                          View All ›
                        </Link>
                      </div>
                      <div className="p-4">
                        {category.items.length > 0 ? category.items.slice(0, 10).map((n: any, i: number) => {
                          const isJob = n.isJob;
                          const rawLastDate = n.lastDate;
                          const lastDateVal = rawLastDate ? fmtDate(rawLastDate) : '';
                          const isFallback = rawLastDate && !rawLastDate.toString().includes('202');
                          const displayLastDate = isFallback && lastDateVal === "DETAILS AWAITED" ? "Pending" : lastDateVal;

                          return (
                            <Link
                              href={isJob ? `/all-jobs/${n.id}` : `/bulletin/${n.id}`}
                              key={`${n.id}-${i}`}
                              className="group block py-2.5 px-3.5 mb-2 last:mb-0 bg-white border-2 border-gray-100 rounded-lg md:rounded-xl shadow-sm hover:border-navy transition-all no-underline"
                            >
                              <div className="text-[12px] font-serif font-bold text-[#0D244D] leading-tight group-hover:text-navy transition-colors line-clamp-2">
                                {n.text}
                              </div>
                              <div className="flex items-center justify-between mt-1.5 border-t border-gray-50 pt-1.5">
                                <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-navy/40">
                                  {n.time}
                                </div>
                                {isJob && displayLastDate && (
                                  <div className="flex items-center whitespace-nowrap text-[9px]">
                                    <span className="font-medium text-gray-500 mr-1">Last Date:</span>
                                    <span className="font-bold text-[#FF3B30]">{displayLastDate}</span>
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        }) : (
                          <div className="py-10 text-center text-[10px] font-black uppercase tracking-widest text-gray-300"> No Records </div>
                        )}
                      </div>
                    </div>
                  ))}
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
