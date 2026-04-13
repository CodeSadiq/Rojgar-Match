'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import BackButton from '@/components/BackButton';

import { QUAL_TREE, LEVEL_GROUPS, QualNode } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const [selectedLevels, setSelectedLevels] = useState<Record<number, { qual: string, branch: string }>>({});
  const [completed, setCompleted] = useState(false);
  const [userProfile, setUserProfile] = useState<any>({ fullName: '', email: '' });
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
        if (profile.qualifications && Array.isArray(profile.qualifications)) {
          const initialState: Record<number, { qual: string, branch: string }> = {};
          profile.qualifications.forEach((q: any) => {
            initialState[q.level] = { qual: q.name, branch: q.branch || '' };
          });
          setSelectedLevels(initialState);
          setCompleted(true);
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
              setCompleted(true);
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
    setUserProfile({ fullName: authData.fullName, email: authData.email });
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
        qualifications
      };

      // ── GUEST HANDLING: Skip DB save ──
      if (userProfile.email === 'guest@rojgarmatch.local') {
        const fullProfile = { ...userProfile, ...profileData };
        localStorage.setItem('rojgarmatch_profile', JSON.stringify(fullProfile));
        window.dispatchEvent(new Event('rojgarmatch_auth_change'));
        setCompleted(true);
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

  if (!isLoaded) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-navy/20 border-t-navy rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-navy/10 overflow-hidden">

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pt-4 pb-10 md:py-10">
        <div className="max-w-[1100px] mx-auto space-y-6 md:space-y-12 animate-in fade-in duration-700">

          <div className="flex items-center justify-between mb-2">
            <BackButton className="text-navy/40 hover:text-navy text-[10px] font-black uppercase tracking-[0.3em] font-sans" />
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[32px] p-6 md:p-10 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 md:gap-8 shadow-sm text-center md:text-left">
            <div className="flex flex-col items-center md:items-start gap-4 md:gap-5">
              <div className="space-y-1">
                {userProfile.email === 'guest@rojgarmatch.local' ? (
                   <>
                    <h1 className="text-2xl md:text-4xl font-bold text-navy/60 tracking-tight">Anonymous Guest</h1>
                    <p className="text-xs md:text-base font-medium text-gray-500">Logged in as a Guest</p>
                   </>
                ) : (
                  <>
                    <h1 className="text-3xl md:text-4xl font-bold text-navy tracking-tight">{userProfile.fullName || 'Citizen Profile'}</h1>
                    <p className="text-gray-600 text-sm md:text-base font-medium">{userProfile.email}</p>
                  </>
                )}
              </div>

              {completed ? (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                  Qualification Recorded
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                  Qualification Not Recorded
                </div>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 md:px-8 md:py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] border border-red-100"
            >
              Logout
            </button>
          </div>

          <div className="max-w-[1100px]">
            <section className="bg-white border border-gray-200 rounded-xl p-6 md:p-10 shadow-sm space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-navy">Set Qualification</h2>
                <p className="text-[13.5px] text-navy/60 font-medium leading-relaxed">
                  Update your qualifications level-wise to discover eligible job opportunities. If you haven't qualified in a category yet, please leave it set to "No Record".
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

                <div className="pt-6 border-t border-gray-100">
                  <div className="flex flex-col md:flex-row md:justify-end gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="w-full md:px-12 h-14 md:h-12 bg-navy text-white font-bold text-[11px] uppercase tracking-widest rounded-lg shadow-md hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-30 order-1 md:order-none"
                    >
                      {isSaving ? 'Saving...' : 'Save Qualification'}
                    </button>

                    <button
                      onClick={async () => {
                        if (confirm('Are you sure you want to reset all qualifications? This cannot be undone.')) {
                          setIsSaving(true);
                          try {
                            if (userProfile.email === 'guest@rojgarmatch.local') {
                              setSelectedLevels({});
                              setCompleted(false);
                              localStorage.removeItem('rojgarmatch_profile');
                              window.dispatchEvent(new Event('rojgarmatch_auth_change'));
                              alert('Guest qualifications reset successfully! ✅');
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
                              alert('Qualifications reset successful! ✅');
                            } else {
                              throw new Error('Reset failed');
                            }
                          } catch (e) {
                            alert('Error: Could not clear remote records.');
                          } finally {
                            setIsSaving(false);
                          }
                        }
                      }}
                      className="w-full md:px-6 h-14 md:h-12 bg-transparent text-red-500 font-bold text-[10px] uppercase tracking-widest rounded-lg hover:bg-red-50 transition-all border border-red-100 order-2 md:order-none"
                      disabled={isSaving}
                    >
                      {isSaving ? 'Processing...' : 'Reset Qualification'}
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
