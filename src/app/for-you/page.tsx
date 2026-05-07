'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import Navbar from '@/components/Navbar';
import RecruitmentCard from '@/components/RecruitmentCard';
import BackButton from '@/components/BackButton';
import { CardSkeleton } from '@/components/LoadingState';
import { getCachedJobs, setCachedJobs } from '@/lib/store';
import ScreeningModal from '@/components/ScreeningModal';

// ─── SVG ICONS ───────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

export default function ForYouPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 🧠 AI Screening States
  const [isAIScreening, setIsAIScreening] = useState(false);
  const [isScreeningLoading, setIsScreeningLoading] = useState(false);
  const [screeningQuestions, setScreeningQuestions] = useState<any[]>([]);
  const [screeningAnswers, setScreeningAnswers] = useState<Record<string, boolean | null>>({});
  const [screenedJobIds, setScreenedJobIds] = useState("");

  const fetchJobs = React.useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    const savedProfileStr = localStorage.getItem('rojgarmatch_profile');
    let profile: CandidateProfile | null = null;
    if (savedProfileStr) {
      try {
        profile = JSON.parse(savedProfileStr);
        setUserProfile(profile);

        // Initialize screening state from profile
        if (profile) {
          setScreeningQuestions(profile.screeningQuestions || []);
          setScreeningAnswers(profile.screeningAnswers || {});
          setScreenedJobIds(profile.screenedJobIds || "");
        }
      } catch (e) {
        console.error(e);
      }
    }

    try {
      const res = await fetch('/api/jobs');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setCachedJobs(data);
        if (!profile || !profile.qualifications || profile.qualifications.length === 0) {
          setJobs([]);
          return;
        }

        const matched = getEligibleJobs(profile, data);
        let finalJobs = matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchedOn: m.matchedOn }));

        // 🛡️ AI Screening Filter
        if ((profile.screeningAnswers && Object.keys(profile.screeningAnswers).length > 0) || (profile.blockedPostNames && profile.blockedPostNames.length > 0)) {
          const answers = profile.screeningAnswers || {};
          const questions = profile.screeningQuestions || [];
          const blockedPosts = profile.blockedPostNames || [];

          finalJobs = finalJobs.filter(job => {
            const hasEligiblePost = (job as any).matchedPosts.some((post: any) => {
              const isBlockedByQuestion = questions.some(q =>
                q.impactedPostNames?.includes(post.name) && answers[q.id] === false
              );
              const isBlockedByText = blockedPosts.includes(post.name);
              return !isBlockedByQuestion && !isBlockedByText;
            });
            return hasEligiblePost;
          });
        }
        setJobs(finalJobs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, []);

  const openAIScreening = () => {
    setIsAIScreening(true);
  };

  const runAIScreening = async () => {
    if (!userProfile || jobs.length === 0) return;
    setIsAIScreening(true);
    setIsScreeningLoading(true);

    try {
      const matchedPostsContext = jobs.flatMap(job =>
        job.matchedPosts.map((post: any) => ({
          name: post.name,
          jobTitle: job.title,
          prerequisite: post.prerequisite || [],
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

      if (!res.ok) throw new Error('Screening failed');
      const data = await res.json();
      const newQuestionsRaw = data.questions || [];

      // Ensure IDs are globally unique
      const newQuestions = newQuestionsRaw.map((q: any, idx: number) => ({
        ...q,
        id: q.id ? `q_${Date.now()}_${idx}_${q.id}` : `q_${Date.now()}_${idx}`
      }));

      // Sync everything to Profile Record
      setScreeningQuestions(prev => {
        const existingIds = new Set(prev.map(q => q.id));
        const filteredNew = newQuestions.filter((q: any) => !existingIds.has(q.id));
        return [...filteredNew, ...prev];
      });

      // Sync everything to Profile Record
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = {
        ...existingProfile,
        screeningQuestions: [...newQuestions.filter((q: any) => !(existingProfile.screeningQuestions || []).some((ex: any) => ex.id === q.id)), ...(existingProfile.screeningQuestions || [])],
        screeningAnswers: screeningAnswers
      };

      setUserProfile(updatedProfile);
      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(screeningAnswers));
      window.dispatchEvent(new Event('rojgarmatch_auth_change'));

      if (userProfile.email && userProfile.email !== 'guest@rojgarmatch.local') {
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

    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (isAuth) {
      const authData = JSON.parse(isAuth);
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = { ...existingProfile, screeningAnswers: newAnswers };

      setUserProfile(updatedProfile);
      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(newAnswers));
      window.dispatchEvent(new Event('rojgarmatch_auth_change'));

      if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authData.email, profile: updatedProfile }),
        });
      }

      // Refresh filtered list locally
      fetchJobs(false);
    }
  };

  const handleFilterByText = async (text: string) => {
    if (!userProfile) return;
    setIsScreeningLoading(true);
    try {
      const allMatchedPosts = jobs.flatMap(job =>
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

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const errText = await res.text();
        throw new Error(`Server returned non-JSON response: ${errText.slice(0, 100)}`);
      }

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
        fetchJobs(false);
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
      const existingProfile = JSON.parse(localStorage.getItem('rojgarmatch_profile') || '{}');
      const updatedProfile = {
        ...existingProfile,
        screeningQuestions: [],
        screeningAnswers: {},
        blockedPostNames: []
      };

      setUserProfile(updatedProfile);
      localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
      localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify({}));
      window.dispatchEvent(new Event('rojgarmatch_auth_change'));

      if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authData.email, profile: updatedProfile }),
        });
      }

      if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authData.email, profile: updatedProfile }),
        });
      }
      fetchJobs(false);
    }
  };

  useEffect(() => {
    // 🚀 CACHE-FIRST LOADING
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    const cached = getCachedJobs();

    if (cached && savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);

        // Render instantly from cache
        const matched = getEligibleJobs(profile, cached);
        let finalJobs = matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchedOn: m.matchedOn }));

        // Apply AI Filter to cache
        if ((profile.screeningAnswers && Object.keys(profile.screeningAnswers).length > 0) || (profile.blockedPostNames && profile.blockedPostNames.length > 0)) {
          const answers = profile.screeningAnswers || {};
          const questions = profile.screeningQuestions || [];
          const blockedPosts = profile.blockedPostNames || [];

          finalJobs = finalJobs.filter(job => {
            const hasEligiblePost = (job as any).matchedPosts.some((post: any) => {
              const isBlockedByQuestion = questions.some((q: any) =>
                q.impactedPostNames?.includes(post.name) && answers[q.id] === false
              );
              const isBlockedByText = blockedPosts.includes(post.name);
              return !isBlockedByQuestion && !isBlockedByText;
            });
            return hasEligiblePost;
          });
        }

        setJobs(finalJobs);
        setIsLoading(false); // Skip initial loading if cache exists
      } catch (e) { console.error(e); }
    }

    // Refresh in background if needed (or if cache missing)
    fetchJobs(false);
  }, [fetchJobs]);

  const isFilterApplied = Object.keys(screeningAnswers).length > 0 || (userProfile?.blockedPostNames && userProfile.blockedPostNames.length > 0);


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-1 max-w-[1440px] mx-auto px-2 md:px-12 pt-2 md:pt-6 pb-24 md:pb-32 w-full animate-in fade-in duration-500">
        <div className="hidden md:block mb-6 pt-6">
          <BackButton className="gap-2 text-sm font-semibold text-navy/40 hover:text-navy transition-colors">
            <IconArrowLeft /> Back to Dashboard
          </BackButton>
        </div>

        <header className="mb-5 md:mb-8 border-b-2 border-navy pb-3 md:pb-6 flex items-center justify-between gap-3 px-4 md:px-0">
          <div className="flex items-center gap-2 text-left">
            <BackButton className="md:hidden text-navy/60 hover:text-navy transition-colors flex-shrink-0">
              <IconArrowLeft />
            </BackButton>
            <div>
              <h1 className="text-[15px] md:text-3xl font-serif font-bold tracking-tight text-navy leading-tight whitespace-nowrap">Recruitments for You</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={openAIScreening}
              disabled={isScreeningLoading}
              className={`flex items-center gap-1.5 h-7 md:h-9 px-3 md:px-4 rounded-full transition-all active:scale-95 border ${isFilterApplied ? 'bg-blue-50/50 text-blue-600 border-blue-200' : 'bg-navy/[0.04] text-navy/50 border-navy/10 hover:bg-navy/[0.06] hover:text-navy/70'}`}
            >
              <svg className="w-3 h-3 md:w-3.5 md:h-3.5" viewBox="0 0 24 24" fill="none" stroke={isFilterApplied ? "#2563EB" : "currentColor"} strokeWidth={isFilterApplied ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
              </svg>
              <span className="text-[9px] md:text-[11px] lg:text-sm font-bold uppercase tracking-wider">
                {isScreeningLoading ? '...' : (
                  <>
                    <span className="hidden lg:inline">{isFilterApplied ? 'AI Filters Active' : 'Filter more with AI'}</span>
                    <span className="lg:hidden">{isFilterApplied ? 'Active' : 'AI Filter'}</span>
                  </>
                )}
              </span>
              {isFilterApplied && !isScreeningLoading && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 ml-0.5" />
              )}
            </button>
            <button
              onClick={() => fetchJobs(true)}
              disabled={isRefreshing || isLoading}
              className={`p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-all active:scale-90 ${(isRefreshing || isLoading) ? 'opacity-50' : 'opacity-100'}`}
              title="Refresh Jobs"
            >
              <IconRefresh className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </header>

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
        />

        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : jobs.length > 0 ? (
          <div className="flex flex-col gap-1 md:gap-6">
            {jobs.map((job, idx) => (
              <RecruitmentCard key={idx} job={job} isMatched={true} />
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 p-20 text-center rounded-3xl flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-50 text-gray-200 rounded-full flex items-center justify-center mb-8">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </div>
            <p className="text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
              {(!userProfile?.qualifications || userProfile.qualifications.length === 0)
                ? "Set your qualification details to see eligible gov jobs."
                : "No recruitments currently match your specific qualification level and branch."
              }
            </p>
            {(!userProfile?.qualifications || userProfile.qualifications.length === 0) && (
              <Link
                href="/profile"
                className="mt-8 px-10 py-3 bg-navy text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#06142E] transition-all shadow-xl rounded-xl no-underline"
              >
                setup qualification →
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
