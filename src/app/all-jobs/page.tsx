'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/data';


import RecruitmentCard from '@/components/RecruitmentCard';
import BackButton from '@/components/BackButton';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import { CardSkeleton, GlobalLoading } from '@/components/LoadingState';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

function JobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    // Load profile for matching
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
    if (savedProfile) {
      try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error(e); }
    }

    fetchJobs(true);
  }, [fetchJobs]);

  // ── RECRUITMENT MATCHING LOGIC ──
  const jobsWithMatching = React.useMemo(() => {
    if (!userProfile || !userProfile.qualifications || userProfile.qualifications.length === 0 || dbJobs.length === 0) {
      return dbJobs.map(j => ({ ...j, isMatched: false }));
    }

    // Get matched list to identify which ones are eligible
    const matched = getEligibleJobs(userProfile, dbJobs);
    const matchedMap = new Map(matched.map(m => [m.job._id || m.job.id, m]));

    return dbJobs.map(job => {
      const matchData = matchedMap.get(job._id || job.id);
      if (matchData) {
        return {
          ...job,
          isMatched: true,
          matchedPosts: matchData.matchedPosts,
          matchScore: matchData.matchScore
        };
      }
      return { ...job, isMatched: false };
    });
  }, [userProfile, dbJobs]);

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

  const filteredJobs = jobsWithMatching.filter(job => {
    const queryTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const matchesSearch = queryTerms.length === 0 || queryTerms.every(term => 
      isFuzzyMatch(job.title, term) ||
      isFuzzyMatch(job.organization, term) ||
      isFuzzyMatch(job.org, term) ||
      (job.tags || []).some((t: string) => isFuzzyMatch(t, term)) ||
      isFuzzyMatch(job.location, term)
    );
    const matchesType = filterType === 'all' || job.type?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/5 selection:text-navy">

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-0 md:px-12 pt-6 md:pt-3 pb-24 md:pb-32 animate-in fade-in duration-500">
        <div className="hidden md:block mb-6 pt-6">
          <BackButton className="gap-2 text-sm font-semibold text-navy/40 hover:text-navy transition-colors">
            <IconArrowLeft /> Back to Dashboard
          </BackButton>
        </div>

        <header className="mb-8 border-b-2 border-navy pb-5 flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
          <div className="flex items-start gap-1 text-left">
            <BackButton className="md:hidden mt-0.5 text-navy/60 hover:text-navy transition-colors flex-shrink-0">
              <IconArrowLeft />
            </BackButton>
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold tracking-tight text-navy leading-tight">All Jobs</h1>
              <p className="text-[9px] md:text-[11px] md:text-gray-500 font-bold uppercase tracking-widest mt-1.5 opacity-60">All verified government openings</p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => fetchJobs(true)}
              disabled={isRefreshing || isLoading}
              className={`p-3 rounded-xl bg-white border-2 border-gray-50 text-navy/40 hover:text-navy hover:border-gray-200 transition-all active:scale-90 shadow-sm ${(isRefreshing || isLoading) ? 'opacity-50' : 'opacity-100'}`}
              title="Refresh Registry"
            >
              <IconRefresh className={isRefreshing ? 'animate-spin' : ''} />
            </button>
            <label className="flex flex-1 bg-white border-2 border-gray-100 rounded-xl px-4 h-9 md:h-12 items-center gap-3 md:w-[320px] shadow-sm group focus-within:border-navy transition-all cursor-text">
              <span className="text-gray-300 group-focus-within:text-navy transition-colors font-black scale-75"><IconSearch /></span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-[11px] md:text-xs font-black text-navy uppercase flex-1 placeholder:text-gray-200"
                placeholder="Search index..."
              />
            </label>
          </div>
        </header>

        {/* JOB LISTING */}
        <section className="space-y-12 h-full">
          {isLoading ? (
            <div className="flex flex-col gap-1 md:gap-6">
              {[1, 2, 3, 4, 5].map(i => <CardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="flex flex-col gap-1 md:gap-6">
              {filteredJobs.length === 0 ? (
                <div className="py-40 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">No recruitment records match this filter</div>
              ) : (
                filteredJobs.map((job, idx) => (
                  <RecruitmentCard key={idx} job={job} isMatched={job.isMatched} highlighted={!!searchQuery} />
                ))
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <JobsPageContent />
    </Suspense>
  );
}
