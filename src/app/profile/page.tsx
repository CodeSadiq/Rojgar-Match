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

  const fetchProfile = React.useCallback(async () => {
    const isAuth = localStorage.getItem('rojgarmatch_auth');
    if (!isAuth) return;
    const authData = JSON.parse(isAuth);

    // Initial load from localStorage (essential for guest persistence)
    const savedLocal = localStorage.getItem('rojgarmatch_profile');
    if (savedLocal) {
      try {
        const profile = JSON.parse(savedLocal);
        // CRITICAL FIX: Restore gender and other details for guest/local persistence
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Collect all selected levels into the qualifications array
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
        qualifications
      };

      // ── MANDATORY CHECKS ──
      if (!userProfile.gender) {
        alert('Please select your Gender to proceed. This is mandatory for recruitment matching. ⚠️');
        setIsSaving(false);
        return;
      }

      // ── GUEST HANDLING: Skip DB save ──
      if (userProfile.email === 'guest@rojgarmatch.local') {
        const fullProfile = { ...userProfile, ...profileData };
        localStorage.setItem('rojgarmatch_profile', JSON.stringify(fullProfile));
        window.dispatchEvent(new Event('rojgarmatch_auth_change'));
        setCompleted(qualifications.length > 0);
        alert('Guest profile updated for this session! ✅');
        setIsSaving(false);
        return;
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userProfile.email.toLowerCase().trim(), profile: profileData }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      // Success: Re-fetch entire profile to confirm sync
      await fetchProfile();
      alert('National Recruitment Profile Updated Successfully! ✅');
    } catch (err) {
      console.error(err);
      alert('Verification Error: Profile Sync Failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout API failure:', e);
    }

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rojgarmatch_')) {
        localStorage.removeItem(key);
      }
    });
    router.push('/login');
  };

  if (!isLoaded) return <GlobalLoading />;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">

      <main className="flex-1 overflow-y-auto px-4 md:px-12 pt-4 md:pt-3 pb-10">
        <div className="max-w-[1100px] mx-auto animate-in fade-in duration-700">
          
          {/* 🔙 BACK NAVIGATION (Circular Style) */}
          <div className="mb-4 md:mb-8 mt-2 md:mt-0 flex items-center justify-start">
            <BackButton />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[32px] p-5 md:p-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-8 shadow-sm text-center md:text-left transition-all">
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

              <div className={`inline-flex items-center gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] px-3 md:px-4 py-1.5 rounded-full border ${completed 
                  ? "text-green-600 bg-green-50 border-green-100" 
                  : "text-red-500 bg-red-50 border-red-100"}`}>
                {completed ? "Qualification Recorded" : "Qualification Not Recorded"}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-2 md:px-8 md:py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[9px] md:text-[11px] font-black uppercase tracking-widest border border-red-100/50"
            >
              Sign Out
            </button>
          </div>

          <div className="max-w-[1100px] mt-6">
            <section className="bg-white border border-gray-200 rounded-xl p-5 md:p-10 shadow-sm space-y-6 md:space-y-8">
              <div className="space-y-4 md:space-y-6">
                <h2 className="text-lg md:text-xl font-bold text-navy">
                  Select Gender <span className="text-red-500">*</span>
                </h2>
                <div className="flex gap-2">
                  {['Male', 'Female', 'Other'].map((g) => (
                    <button
                      key={g}
                      onClick={() => setUserProfile((prev: any) => ({ ...prev, gender: g }))}
                      className={`flex-1 h-10 md:h-12 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm ${userProfile.gender === g
                          ? "bg-navy text-white border-navy"
                          : "bg-white text-navy/30 border-gray-200 hover:border-navy/10"
                        }`}
                    >
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
                        <select
                          value={levelState.qual}
                          onChange={(e) => handleLevelQualChange(group.id, e.target.value)}
                          className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${levelState.qual
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                            }`}
                        >
                          <option value="">-- No Record --</option>
                          {qualsForLevel.map(q => (
                            <option key={q.name} value={q.name}>{q.label}</option>
                          ))}
                        </select>
                      </div>

                      {currentQual && currentQual.branches.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-[11px] font-bold text-navy/70 uppercase tracking-widest">
                            {group.id <= 2 ? "Academic Stream" :
                              group.id === 3 ? "Trade Branch" :
                                "Professional Branch"}
                          </label>
                          <select
                            value={levelState.branch}
                            onChange={(e) => handleLevelBranchChange(group.id, e.target.value)}
                            className={`w-full h-12 border px-4 text-sm font-bold outline-none transition-all rounded-lg ${levelState.branch
                                ? "bg-blue-50 border-blue-200 text-blue-700"
                                : "bg-gray-50 border-gray-200 text-navy focus:border-navy"
                              }`}
                          >
                            <option value="">-- No Record --</option>
                            {currentQual.branches.map(b => (
                              <option key={b.value} value={b.value}>{b.label}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex flex-col md:flex-row md:justify-end gap-2.5">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full md:px-12 h-12 bg-navy text-white font-bold text-[10px] md:text-[11px] uppercase tracking-widest rounded-lg shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 order-1 md:order-none"
                    >
                      {isSaving ? 'Saving...' : 'Save Qualification'}
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to reset all qualifications?')) {
                          setIsSaving(true);
                          try {
                            if (userProfile.email === 'guest@rojgarmatch.local') {
                              setSelectedLevels({});
                              setCompleted(false);
                              localStorage.removeItem('rojgarmatch_profile');
                              window.dispatchEvent(new Event('rojgarmatch_auth_change'));
                              alert('Guest records cleared! ✅');
                              setIsSaving(false);
                              return;
                            }

                            const res = await fetch('/api/profile', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ email: userProfile.email.toLowerCase().trim(), profile: { qualifications: [] } }),
                            });
                            if (res.ok) {
                              setSelectedLevels({});
                              setCompleted(false);
                              localStorage.removeItem('rojgarmatch_profile');
                              window.dispatchEvent(new Event('rojgarmatch_auth_change'));
                              alert('Profile reset successful! ✅');
                            } else {
                              throw new Error('Reset failed');
                            }
                          } catch (e) {
                            alert('Reset error.');
                          } finally {
                            setIsSaving(false);
                          }
                        }
                      }}
                      className="w-full md:px-6 h-10 md:h-12 bg-transparent text-red-500/60 font-bold text-[9px] uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all order-2 md:order-none"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Wait...' : 'Reset Qualification'}
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </main>
    </div>
  );
}
