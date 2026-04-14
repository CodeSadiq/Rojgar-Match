'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import Navbar from '@/components/Navbar';
import RecruitmentCard from '@/components/RecruitmentCard';
import BackButton from '@/components/BackButton';
import { CardSkeleton } from '@/components/LoadingState';

// ─── SVG ICONS ───────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconStar = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>;

export default function ForYouPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<CandidateProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedProfile = localStorage.getItem('rojgarmatch_profile');
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
          if (!profile || !profile.qualifications || profile.qualifications.length === 0) {
            setJobs([]); // Clean slate if profile is incomplete
            return;
          }
          const matched = getEligibleJobs(profile, data);
          setJobs(matched.map(m => ({ ...m.job, matchedPosts: m.matchedPosts, matchedOn: m.matchedOn })));
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
      <main className="flex-1 max-w-[1440px] mx-auto px-2 md:px-12 pt-6 md:pt-6 pb-1 md:pb-3 w-full animate-in fade-in duration-500">
        <div className="hidden md:block mb-6 pt-6">
          <BackButton className="gap-2 text-sm font-semibold text-navy/40 hover:text-navy transition-colors">
            <IconArrowLeft /> Back to Dashboard
          </BackButton>
        </div>

        <header className="mb-8 border-b-2 border-navy pb-5 flex flex-col md:flex-row md:items-end justify-between gap-6 px-1 md:px-0">
          <div className="flex items-start gap-1 text-left">
            <BackButton className="md:hidden mt-0.5 text-navy/60 hover:text-navy transition-colors flex-shrink-0">
              <IconArrowLeft />
            </BackButton>
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold tracking-tight text-navy leading-tight">Recruitments for You</h1>
              <p className="text-[9px] md:text-[11px] md:text-gray-500 font-bold uppercase tracking-widest mt-1.5 opacity-60">All verified government openings matched to your profile</p>
            </div>
          </div>
        </header>

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
                className="mt-8 px-10 py-3 bg-[#1a3a8f] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#122870] transition-all shadow-xl rounded-xl no-underline"
              >
                Setup Profile →
              </Link>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
