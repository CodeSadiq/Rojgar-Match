'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import Navbar from '@/components/Navbar';
import RecruitmentCard from '@/components/RecruitmentCard';

// ─── SVG ICONS ───────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

export default function ForYouPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('govrecruit_profile');
    let profile: CandidateProfile | null = null;
    if (savedProfile) {
      try {
        profile = JSON.parse(savedProfile);
        setUserProfile(profile);
      } catch (e) { console.error(e); }
    }

    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs');
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data)) {
          if (!profile || !profile.level) {
            setJobs([]); // Clean slate if profile is incomplete
            return;
          }
          const matched = getEligibleJobs(profile, data);
          setJobs(matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-1 max-w-[1440px] mx-auto px-4 md:px-12 py-6 md:py-12 w-full animate-in fade-in duration-700">
        <header className="mb-14 border-b-4 border-[#1a3a8f] pb-10 px-4 md:px-0">
          <h1 className="text-2xl md:text-5xl font-serif font-bold tracking-tight text-[#1a3a8f] leading-tight">Recruitment for You</h1>
          <p className="text-[10px] md:text-gray-500 font-bold uppercase tracking-widest mt-4">Showing official verified government openings matched to your profile.</p>
        </header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-gray-100 rounded-2xl h-[240px]"></div>
            ))}
          </div>
        ) : jobs.length > 0 ? (
          <div className="flex flex-col gap-6">
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
              No recruitments currently match your specific qualification level and branch.
            </p>
            {!userProfile?.level && (
              <Link
                href="/profile"
                className="mt-8 px-10 py-3 bg-[#1a3a8f] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#122870] transition-all shadow-xl rounded-xl no-underline"
              >
                Setup Profile →
              </Link>
            )}
          </div>
        )}
      </main>

      <footer className="bg-white border-t-2 border-gray-100 py-10 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white border border-gray-100 rounded-lg flex items-center justify-center overflow-hidden"><img src="/logo.png" alt="" className="w-5 h-5 object-contain" /></div>
            <strong className="text-[#1a3a8f] text-sm font-black leading-none uppercase">Rojgar Match</strong>
          </div>
          <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest">© 2026 ROJGAR MATCH SYSTEM — OFFICIAL INDEX</p>
        </div>
      </footer>
    </div>
  );
}
