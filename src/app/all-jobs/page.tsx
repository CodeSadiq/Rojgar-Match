'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { NOTIFICATIONS } from '@/lib/data';


import RecruitmentCard from '@/components/RecruitmentCard';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';

const IconSearch = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [dbJobs, setDbJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    // Load profile for matching
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
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

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

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-12 py-6 md:py-12 animate-in fade-in duration-500">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-navy transition-colors mb-8 md:mb-12 no-underline"
        >
          <IconArrowLeft /> Back to Dashboard
        </Link>
        <header className="mb-14 border-b-4 border-navy pb-10 flex flex-col md:flex-row md:items-end justify-between gap-8 px-4 md:px-0">
          <div>
            <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight text-navy leading-tight">All Jobs</h1>
            <p className="text-[10px] md:text-gray-500 font-bold uppercase tracking-widest mt-4">Broadcasting official verified government openings across the national registry.</p>
          </div>
          <label className="flex bg-white border-2 border-gray-100 rounded-xl px-5 h-10 md:h-14 items-center gap-3 w-full md:w-[400px] shadow-sm group focus-within:border-navy transition-all cursor-text">
            <span className="text-gray-300 group-focus-within:text-navy transition-colors font-black scale-75"><IconSearch /></span>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs md:text-sm font-black text-navy uppercase flex-1 placeholder:text-gray-200"
              placeholder="Search index..."
            />
          </label>
        </header>


        {/* JOB LISTING */}
        <section className="space-y-12 h-full">
          {isLoading ? (
            <div className="py-20 text-center opacity-40 font-black uppercase tracking-widest text-[10px]">Registry Synchronizing...</div>
          ) : (
            <div className="flex flex-col gap-6">
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
