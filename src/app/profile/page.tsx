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
        alert('Please select your Gender to proceed. ⚠️');
        setIsSaving(false);
        return;
      }

      if (userProfile.email === 'guest@rojgarmatch.local') {
        localStorage.setItem('rojgarmatch_profile', JSON.stringify(profileData));
        window.dispatchEvent(new Event('rojgarmatch_auth_change'));
        setCompleted(qualifications.length > 0);
        alert('Guest profile updated! ✅');
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
      alert('Profile Updated Successfully! ✅');
    } catch (err) {
      console.error(err);
      alert('Profile Sync Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all your qualifications and screening data? This cannot be undone. ⚠️')) return;

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

      alert('Profile Reset Successfully! 🧹');
    } catch (err) {
      console.error(err);
      alert('Reset Failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSaving(false);
    }
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">
      <main className="flex-1 overflow-y-auto px-4 md:px-12 pt-4 md:pt-3 pb-10">
        <div className="max-w-[1100px] mx-auto animate-in fade-in duration-700">
          <div className="mb-4 md:mb-8 mt-2 md:mt-0 flex items-center justify-start">
            <BackButton />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[32px] p-5 md:p-10 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8 shadow-sm text-center md:text-left transition-all">
            <div className="flex flex-col items-center md:items-start gap-3 md:gap-5">
              <div className="space-y-0.5 md:space-y-1">
                {userProfile.email === 'guest@rojgarmatch.local' ? (
                  <>
                    <h1 className="text-xl md:text-4xl font-bold text-navy/60 tracking-tight">Anonymous Guest</h1>
                    <p className="text-[10px] md:text-base font-medium text-gray-400 capitalize">Guest Session</p>
                  </>
                ) : (
                  <>
                    <h1 className="text-2xl md:text-4xl font-bold text-navy tracking-tight">{userProfile.fullName || 'Citizen Profile'}</h1>
                    <p className="text-gray-500 text-xs md:text-base font-medium">{userProfile.email}</p>
                  </>
                )}
              </div>
              <div className={`inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] px-3 md:px-4 py-1.5 rounded-full border ${completed ? "text-green-600 bg-green-50 border-green-100" : "text-red-500 bg-red-50 border-red-100"}`}>
                {completed ? "Qualification Recorded" : "Qualification Not Recorded"}
              </div>
            </div>
            <button onClick={handleLogout} className="px-6 py-2 md:px-8 md:py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest border border-red-100/50">
              Sign Out
            </button>
          </div>

          <div className="max-w-[1100px] mt-6">
            <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-10 shadow-sm space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-navy">Select Gender <span className="text-red-500">*</span></h2>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button key={g} onClick={() => setUserProfile((prev: any) => ({ ...prev, gender: g }))} className={`flex-1 h-10 md:h-12 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${userProfile.gender === g ? "bg-navy text-white border-navy" : "bg-white text-navy/30 border-gray-200 hover:border-navy/10"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5 pt-4 border-t border-gray-50">
                <h2 className="text-lg md:text-xl font-bold text-navy">Set Qualification</h2>
                <p className="text-[12px] md:text-[13.5px] text-navy/70 font-medium leading-relaxed">
                  Update your qualifications level-wise to discover eligible jobs. If you do not have a qualification for a specific section, leave it as "-- No Record --".
                </p>
              </div>

              <div className="space-y-8">
                {LEVEL_GROUPS.map((group) => {
                  const levelState = selectedLevels[group.id] || { qual: '', branch: '' };
                  const qualsForLevel = QUAL_TREE.filter(q => group.levels.includes(q.level));
                  const currentQual = QUAL_TREE.find(q => q.name === levelState.qual);

                  return (
                    <div key={group.id} className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="space-y-2">
                        <label className="text-[11px] font-bold text-navy/70 uppercase tracking-widest">{group.label}</label>
                        <select value={levelState.qual} onChange={(e) => handleLevelQualChange(group.id, e.target.value)} className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${levelState.qual ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-navy focus:border-navy"}`}>
                          <option value="">-- No Record --</option>
                          {qualsForLevel.map(q => <option key={q.name} value={q.name}>{q.label}</option>)}
                        </select>
                      </div>

                      {currentQual && currentQual.branches.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-navy/70 uppercase tracking-widest">{group.id <= 2 ? "Academic Stream" : group.id === 3 ? "Trade Branch" : "Professional Branch"}</label>
                          <select value={levelState.branch} onChange={(e) => handleLevelBranchChange(group.id, e.target.value)} className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${levelState.branch ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-200 text-navy focus:border-navy"}`}>
                            <option value="">-- No Record --</option>
                            {currentQual.branches.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                {screeningResults.length > 0 && (
                  <div className="pt-10 border-t border-gray-100">
                    <div className="bg-navy/[0.02] border border-navy/5 rounded-2xl md:rounded-[32px] p-4 md:p-8">
                      <h2 className="text-lg md:text-xl font-bold text-navy mb-6">Specialized Requirements</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {screeningResults.map((res) => (
                          <div key={res.id} className="p-3 md:p-4 bg-white border border-gray-100 rounded-xl flex flex-col justify-between gap-3 shadow-sm hover:border-navy/10 transition-all">
                            <p className="text-[12px] md:text-[13px] font-bold text-navy leading-snug">{res.text}</p>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => handleUpdateScreening(res.id, true)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === true ? "bg-green-600 text-white border-green-600 shadow-md shadow-green-200" : "bg-white text-green-600 border-green-100 hover:bg-green-50"}`}
                              >
                                Yes
                              </button>
                              <button
                                onClick={() => handleUpdateScreening(res.id, false)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === false ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-200" : "bg-white text-red-600 border-red-100 hover:bg-red-50"}`}
                              >
                                No
                              </button>
                              <button
                                onClick={() => handleUpdateScreening(res.id, null)}
                                className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all border ${res.answer === null ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-200" : "bg-white text-orange-500 border-orange-100 hover:bg-orange-50"}`}
                              >
                                Not Sure
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                  <div className="flex flex-row gap-2 md:gap-3 pt-6 border-t border-gray-100">
                    <button 
                      onClick={handleSave} 
                      disabled={isSaving} 
                      className="flex-1 h-10 md:h-12 bg-navy text-white font-bold text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-1.5 md:gap-2"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                      <span className="hidden xs:inline">{isSaving ? 'Saving...' : 'Save Qualification'}</span>
                      <span className="xs:hidden">{isSaving ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button 
                      onClick={handleReset} 
                      disabled={isSaving} 
                      className="flex-1 h-10 md:h-12 bg-red-50 text-red-600 font-bold text-[9px] md:text-[11px] uppercase tracking-widest rounded-lg border border-red-100 hover:bg-red-600 hover:text-white transition-all active:scale-[0.98] disabled:opacity-30 flex items-center justify-center gap-1.5 md:gap-2"
                    >
                      <svg className="w-3.5 h-3.5 md:w-4 md:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path><path d="M3 3v5h5"></path></svg>
                      <span className="hidden xs:inline">Reset Qualification</span>
                      <span className="xs:hidden">Reset</span>
                    </button>
                  </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
