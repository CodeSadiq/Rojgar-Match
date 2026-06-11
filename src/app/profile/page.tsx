'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';
import { GlobalLoading, Spinner } from '@/components/LoadingState';

import { QUAL_TREE, LEVEL_GROUPS, QualNode } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const [selectedLevels, setSelectedLevels] = useState<Record<number, { qual: string, branch: string }>>({});
  const [completed, setCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({ fullName: '', email: '', gender: '' });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [screeningResults, setScreeningResults] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type });
  };

  const showConfirm = (message: string, onConfirm: () => void) => {
    setConfirmDialog({ isOpen: true, message, onConfirm });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchProfile = React.useCallback(async () => {
    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (!isAuth) return;
    const authData = JSON.parse(isAuth);

    // Initial load from localStorage (essential for guest persistence)
    const savedLocal = localStorage.getItem('rojgarmatch_profile');
    if (savedLocal) {
      try {
        const profile = JSON.parse(savedLocal);
        setUserProfile((prev: any) => ({ ...prev, ...profile }));

        if (profile.qualifications && Array.isArray(profile.qualifications)) {
          const initialState: Record<number, { qual: string, branch: string }> = {};
          profile.qualifications.forEach((q: any) => {
            initialState[q.level] = { qual: q.name, branch: q.branch || '' };
          });
          setSelectedLevels(initialState);
          setCompleted(profile.qualifications.length > 0);
        }
      } catch (e) { console.error('Local profile parse error:', e); }
    }

    // Fetch remote profile for verified users only
    if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
      try {
        const res = await fetch(`/api/profile?email=${authData.email}`);
        if (res.ok) {
          const remoteUser = await res.json();
          if (remoteUser.profile) {
            const profile = remoteUser.profile;
            setUserProfile((prev: any) => ({ ...prev, ...profile }));

            if (profile.qualifications && Array.isArray(profile.qualifications)) {
              const initialState: Record<number, { qual: string, branch: string }> = {};
              profile.qualifications.forEach((q: any) => {
                initialState[q.level] = { qual: q.name, branch: q.branch || '' };
              });
              setSelectedLevels(initialState);
              setCompleted(profile.qualifications.length > 0);
            }

            localStorage.setItem('rojgarmatch_profile', JSON.stringify({
              ...profile,
              fullName: authData.fullName,
              email: authData.email
            }));
          }
        }
      } catch (e) {
        console.error('Remote profile fetch failed:', e);
      }
    }

    setIsLoaded(true);
  }, []);

  useEffect(() => {
    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (!isAuth) {
      router.push('/login');
      return;
    }

    const authData = JSON.parse(isAuth);
    setUserProfile((prev: any) => ({ ...prev, fullName: authData.fullName, email: authData.email }));
    fetchProfile();
  }, [router, fetchProfile]);

  useEffect(() => {
    if (userProfile && userProfile.screeningQuestions) {
      const results = userProfile.screeningQuestions.map((q: any) => ({
        ...q,
        answer: userProfile.screeningAnswers ? userProfile.screeningAnswers[q.id] : undefined
      }));
      setScreeningResults(results);
    }
  }, [userProfile]);

  const handleLevelQualChange = (levelId: number, qualName: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { qual: qualName, branch: '' }
    }));
  };

  const handleLevelBranchChange = (levelId: number, branchValue: string) => {
    setSelectedLevels(prev => ({
      ...prev,
      [levelId]: { ...prev[levelId], branch: branchValue }
    }));
  };

  const handleUpdateScreening = async (questionId: string, answer: boolean | null) => {
    // 1. Get current auth data to preserve identity
    const authStr = localStorage.getItem('rojgarmatch_auth');
    if (!authStr) return;
    const authData = JSON.parse(authStr);

    // 2. Update answers locally
    const currentAnswers = userProfile.screeningAnswers || {};
    const updatedAnswers = { ...currentAnswers, [questionId]: answer };

    // 3. Create full updated profile object
    const updatedProfile = {
      ...userProfile,
      screeningAnswers: updatedAnswers,
      fullName: authData.fullName,
      email: authData.email
    };

    // 4. Update State (triggers UI refresh)
    setUserProfile(updatedProfile);

    // 5. Update Local Storage (for persistence)
    localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedProfile));
    localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify(updatedAnswers));

    // 6. Notify Navbar and others
    window.dispatchEvent(new Event('rojgarmatch_auth_change'));

    // 7. Sync to DB if not guest
    if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
      try {
        await fetch('/api/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: authData.email, profile: updatedProfile }),
        });
      } catch (e) { console.error('DB Sync failed:', e); }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const qualifications = Object.entries(selectedLevels)
        .filter(([_, data]) => data.qual !== "")
        .map(([levelId, data]) => {
          const qualNode = QUAL_TREE.find(q => q.name === data.qual);
          return {
            name: data.qual,
            level: parseInt(levelId),
            label: qualNode?.label || data.qual,
            branch: data.branch
          };
        });

      const profileData = {
        gender: userProfile.gender,
        qualifications,
        screeningQuestions: userProfile.screeningQuestions,
        screeningAnswers: userProfile.screeningAnswers,
        screenedJobIds: userProfile.screenedJobIds
      };

      if (!userProfile.gender) {
        showToast('Please select your Gender to proceed.', 'warning');
        setIsSaving(false);
        return;
      }

      if (userProfile.email === 'guest@rojgarmatch.local') {
        localStorage.setItem('rojgarmatch_profile', JSON.stringify(profileData));
        window.dispatchEvent(new Event('rojgarmatch_auth_change'));
        setCompleted(qualifications.length > 0);
        showToast('Guest profile updated!', 'success');
        setIsSaving(false);
        return;
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email, profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      // Update local storage with merged identity
      const isAuth = localStorage.getItem('rojgarmatch_auth');
      if (isAuth) {
        const authData = JSON.parse(isAuth);
        localStorage.setItem('rojgarmatch_profile', JSON.stringify({
          ...profileData,
          fullName: authData.fullName,
          email: authData.email
        }));
        window.dispatchEvent(new Event('rojgarmatch_auth_change'));
      }

      await fetchProfile();
      showToast('Profile Updated Successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Profile Sync Failed', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    showConfirm(
      'Are you sure you want to reset all your qualifications and screening data? This cannot be undone.',
      async () => {
        setIsSaving(true);
        try {
          const authStr = localStorage.getItem('rojgarmatch_auth');
          if (!authStr) return;
          const authData = JSON.parse(authStr);

          const clearedProfile = {
            gender: '',
            qualifications: [],
            screeningQuestions: [],
            screeningAnswers: {},
            screenedJobIds: '',
            blockedPostNames: []
          };

          // Reset local state
          setSelectedLevels({});
          setUserProfile((prev: any) => ({
            ...prev,
            ...clearedProfile
          }));
          setCompleted(false);
          setScreeningResults([]);

          // Update Local Storage
          const updatedLocalStorageProfile = {
            ...clearedProfile,
            fullName: authData.fullName,
            email: authData.email
          };

          localStorage.setItem('rojgarmatch_profile', JSON.stringify(updatedLocalStorageProfile));
          localStorage.setItem('rojgarmatch_screening_answers', JSON.stringify({}));

          // Notify other components (Navbar, etc.)
          window.dispatchEvent(new Event('rojgarmatch_auth_change'));

          // Sync to DB if not guest
          if (authData.email && authData.email !== 'guest@rojgarmatch.local') {
            const res = await fetch('/api/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: authData.email, profile: clearedProfile }),
            });
            if (!res.ok) throw new Error('Failed to reset on server');
          }

          showToast('Profile Reset Successfully!', 'success');
        } catch (err) {
          console.error(err);
          showToast('Reset Failed: ' + (err instanceof Error ? err.message : String(err)), 'error');
        } finally {
          setIsSaving(false);
        }
      }
    );
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) { console.error(e); }
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rojgarmatch_')) localStorage.removeItem(key);
    });
    router.push('/login');
  };

  if (!isLoaded) return <GlobalLoading />;

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">
      <main className="flex-1 overflow-y-auto px-3 md:px-12 pt-3 md:pt-3 pb-6">
        <div className="max-w-[1100px] mx-auto animate-in fade-in duration-700">
          <div className="mb-3 md:mb-8 mt-1 md:mt-0 flex items-center justify-start">
            <BackButton />
          </div>

          {/* DESKTOP VIEW HEADER CARD */}
          <div className="hidden md:flex bg-white border border-gray-200 rounded-[32px] p-10 flex-row items-center justify-between gap-8 text-left transition-all">
            <div className="flex flex-col items-start gap-5">
              <div className="space-y-1">
                {userProfile.email === 'guest@rojgarmatch.local' ? (
                  <>
                    <h1 className="text-4xl font-bold text-navy/60 tracking-tight">Anonymous Guest</h1>
                    <p className="text-base font-medium text-gray-400 capitalize">Guest Session</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-4xl font-bold text-navy tracking-tight">{userProfile.fullName || 'Citizen Profile'}</h1>
                    <p className="text-gray-500 text-base font-medium">{userProfile.email}</p>
                  </>
                )}
              </div>
              <div className={`inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-full border ${completed ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                {completed ? "Qualification Recorded" : "Qualification Not Recorded"}
              </div>
            </div>
            <button onClick={handleLogout} className="px-8 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[11px] font-black uppercase tracking-widest border border-red-100/50 active:scale-95">
              Sign Out
            </button>
          </div>

          {/* MOBILE VIEW HEADER CARD */}
          <div className="md:hidden bg-white border border-gray-200 rounded-lg p-4 flex flex-col transition-all shadow-sm">
            {/* Top Row: Initial Avatar and Profile Metadata */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center text-navy font-bold text-sm shrink-0 border border-navy/10">
                {userProfile.email === 'guest@rojgarmatch.local'
                  ? 'G'
                  : (userProfile.fullName ? userProfile.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'C')}
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-bold text-navy tracking-tight truncate leading-snug">
                  {userProfile.email === 'guest@rojgarmatch.local' ? 'Anonymous Guest' : (userProfile.fullName || 'Citizen Profile')}
                </h1>
                <p className="text-xs text-gray-500 truncate leading-none mt-1">
                  {userProfile.email === 'guest@rojgarmatch.local' ? 'Guest Session' : userProfile.email.toLowerCase()}
                </p>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-t border-gray-100 my-3" />

            {/* Bottom Row: Status Badge & Logout Button */}
            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${completed ? "text-green-600 bg-green-50/50 border-green-100" : "text-red-500 bg-red-50/50 border-red-100"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${completed ? 'bg-green-500' : 'bg-red-500'} shrink-0`} />
                {completed ? "Qualification Recorded" : "Qualification Not Recorded"}
              </span>
              <button
                onClick={handleLogout}
                className="px-3.5 py-1.5 bg-red-50/70 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-lg text-[10px] font-bold uppercase tracking-wider border border-red-100/50 active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>

          <div className="max-w-[1100px] mt-4 space-y-4 md:space-y-8">
            {/* SECTION 1: CORE QUALIFICATIONS */}
            <section className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-10 space-y-4 md:space-y-8">
              <div className="space-y-3 md:space-y-6">
                <h2 className="text-base md:text-xl font-bold text-navy">Select Gender <span className="text-red-500">*</span></h2>
                <div className="grid grid-cols-3 gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button key={g} onClick={() => setUserProfile((prev: any) => ({ ...prev, gender: g }))} className={`h-10 md:h-14 rounded-lg text-[9px] md:text-[11px] font-black uppercase tracking-widest transition-all border ${userProfile.gender === g ? "bg-navy text-white border-navy" : "bg-white text-navy/50 border-gray-200 hover:border-navy hover:text-navy hover:bg-navy/[0.02]"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-3 border-t border-gray-50">
                <h2 className="text-base md:text-xl font-bold text-navy">Set Qualification</h2>
                <p className="text-[11px] md:text-[13.5px] text-navy/70 font-medium leading-relaxed">
                  Update your qualifications level-wise to discover eligible jobs.
                </p>
              </div>

              <div className="space-y-4 md:space-y-6">
                {LEVEL_GROUPS.map((group) => {
                  const levelState = selectedLevels[group.id] || { qual: '', branch: '' };
                  const qualsForLevel = QUAL_TREE.filter(q => group.levels.includes(q.level));
                  const currentQual = QUAL_TREE.find(q => q.name === levelState.qual);

                  return (
                    <div
                      key={group.id}
                      className={`p-3.5 md:p-6 rounded-lg border transition-all duration-300 space-y-3 md:space-y-4 ${levelState.qual ? "bg-green-50/60 border-green-300 shadow-sm" : "bg-white border-gray-200/70"}`}
                    >
                      <div className="flex items-center gap-2">
                        <h3 className={`text-[10px] md:text-sm font-black uppercase tracking-wider transition-colors ${levelState.qual ? "text-[#166534]" : "text-navy"}`}>
                          {group.label}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4 items-end">
                        <div className="space-y-1">
                          <div className="relative w-full">
                            <select
                              value={levelState.qual}
                              onChange={(e) => handleLevelQualChange(group.id, e.target.value)}
                              className={`w-full h-10 md:h-12 border pl-3 pr-10 text-xs md:text-sm font-bold outline-none transition-all rounded-lg appearance-none ${levelState.qual ? "bg-white border-green-300 text-[#166534]" : "bg-white border-gray-200 text-navy/80 focus:border-[#166534]"}`}
                            >
                              <option value="">-- No Record --</option>
                              {qualsForLevel.map(q => <option key={q.name} value={q.name}>{q.label}</option>)}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-navy/40">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            </div>
                          </div>
                        </div>
 
                        {currentQual && currentQual.branches.length > 0 ? (
                          <div className="space-y-1">
                            <label className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest block px-1 transition-colors ${levelState.qual ? "text-[#166534]/55" : "text-navy/40"}`}>
                              {group.id <= 2 ? "Academic Stream" : group.id === 3 ? "Trade Branch" : "Professional Branch"}
                            </label>
                            <div className="relative w-full">
                              <select
                                value={levelState.branch}
                                onChange={(e) => handleLevelBranchChange(group.id, e.target.value)}
                                className={`w-full h-10 md:h-12 border pl-3 pr-10 text-xs md:text-sm font-bold outline-none transition-all rounded-lg appearance-none ${levelState.branch ? "bg-white border-green-300 text-[#166534]" : "bg-white border-gray-200 text-navy/80 focus:border-[#166534]"}`}
                              >
                                <option value="">-- No Record --</option>
                                {currentQual.branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                              </select>
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-navy/40">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="hidden md:block"></div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: SCREENING QUESTIONS */}
            {screeningResults.length > 0 && (
              <section className="bg-white border border-gray-200 rounded-lg md:rounded-xl p-4 md:p-10 space-y-4 md:space-y-8">
                <div className="space-y-3 md:space-y-6">
                  <h2 className="text-base md:text-xl font-bold text-navy">Specialized Requirements</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {screeningResults.map((res) => (
                      <div key={res.id} className="p-4 md:p-6 bg-white border border-gray-200 rounded-lg md:rounded-xl flex flex-col justify-between gap-3 transition-all">
                        <p className="text-xs md:text-[15px] font-bold text-navy leading-relaxed">{res.text}</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleUpdateScreening(res.id, true)}
                            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === true ? "bg-green-600 text-white border-green-600" : "bg-white text-green-600 border-green-100 hover:bg-green-50"}`}
                          >
                            Yes
                          </button>
                          <button
                            onClick={() => handleUpdateScreening(res.id, false)}
                            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === false ? "bg-red-600 text-white border-red-600" : "bg-white text-red-600 border-red-100 hover:bg-red-50"}`}
                          >
                            No
                          </button>
                          <button
                            onClick={() => handleUpdateScreening(res.id, null)}
                            className={`flex-1 py-2 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === null ? "bg-orange-500 text-white border-orange-500" : "bg-white text-orange-500 border-orange-100 hover:bg-orange-50"}`}
                          >
                            Not Sure
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* ACTION AREA */}
            <div className="flex flex-row gap-2 md:gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 h-10 md:h-14 bg-navy text-white font-bold text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg md:rounded-xl hover:bg-slate-800 transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 md:gap-2"
              >
                <svg className="w-3.5 h-3.5 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <span className="hidden xs:inline">{isSaving ? 'Saving...' : 'Save Qualification'}</span>
                <span className="xs:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="flex-1 h-10 md:h-14 bg-red-50 text-red-600 font-bold text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg md:rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all disabled:opacity-30 flex items-center justify-center gap-1.5 md:gap-2"
              >
                <svg className="w-3.5 h-3.5 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                <span className="hidden xs:inline">Reset Qualification</span>
                <span className="xs:hidden">Reset</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-lg md:rounded-2xl max-w-xs w-full p-6 shadow-2xl space-y-4 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${toast.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
              toast.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
              }`}>
              {toast.type === 'success' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              )}
              {toast.type === 'warning' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-md font-bold text-navy">
                {toast.type === 'success' ? 'Success' : toast.type === 'error' ? 'Error' : 'Warning'}
              </h3>
              <p className="text-xs font-semibold text-navy/70 leading-relaxed">
                {toast.message}
              </p>
            </div>

            <button
              onClick={() => setToast(null)}
              className="w-full py-2 bg-navy hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-gray-100 rounded-lg md:rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-200 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-navy">Confirm Action</h3>
                <p className="text-sm font-medium text-navy/70 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col xs:flex-row justify-end gap-2.5 xs:gap-3">
              <button
                onClick={() => setConfirmDialog(null)}
                className="w-full xs:w-auto px-5 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-gray-200/50 transition-all active:scale-95 text-center"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDialog.onConfirm();
                  setConfirmDialog(null);
                }}
                className="w-full xs:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 text-center"
              >
                Yes, Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
