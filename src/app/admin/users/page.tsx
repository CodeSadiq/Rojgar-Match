'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function UsersAnalysisContent() {
  const router = useRouter();
  const [analyzedUsers, setAnalyzedUsers] = useState<any[]>([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(true);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUserAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setAnalyzedUsers(data.users || []);
      } else {
        alert("Failed to load user analysis");
      }
    } catch (e) {
      console.error(e);
      alert("Error loading user analysis");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    fetchUserAnalysis();
  }, []);

  const filteredUsers = analyzedUsers.filter(user => 
    (user.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-10 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 text-navy/40 hover:text-navy transition-colors group no-underline bg-transparent border-none cursor-pointer p-0"
            >
              <div className="p-2 bg-white border border-gray-200 group-hover:bg-navy group-hover:text-white rounded-xl transition-all shadow-sm">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </div>
            </button>
            <div>
              <h1 className="text-2xl font-black text-navy uppercase tracking-tighter">User Analysis</h1>
              <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-0.5">Explore registered candidates and matched recruitments</p>
            </div>
          </div>

          <button
            onClick={fetchUserAnalysis}
            className="px-6 py-2.5 bg-white border border-gray-200 text-navy text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-gray-50 transition-all shadow-sm cursor-pointer"
          >
            🔄 Refresh Registry
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="SEARCH CANDIDATES BY NAME OR EMAIL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 p-4 rounded-xl text-[11px] font-bold text-navy placeholder:text-navy/20 uppercase tracking-widest pl-12 shadow-sm outline-none focus:border-navy transition-all"
          />
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-navy/20" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        {/* Main Users List */}
        <div className="space-y-4">
          {loadingAnalysis ? (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-white border border-gray-100 rounded-3xl gap-4 shadow-sm">
              <div className="w-8 h-8 border-4 border-navy border-t-transparent rounded-full animate-spin"></div>
              <div className="text-[10px] font-black uppercase tracking-[0.2em] text-navy/40 animate-pulse">Gathering Matches and Profiling Users...</div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center bg-white border border-gray-100 rounded-3xl shadow-sm">
              <div className="text-[10px] font-black text-navy/20 uppercase tracking-widest">No registered candidates matching search query</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUsers.map((user) => {
                const isExpanded = expandedUser === user.id;
                return (
                  <div key={user.id} className="border border-gray-100 rounded-2xl overflow-hidden bg-white hover:border-gray-200 transition-all shadow-sm">
                    {/* Summary Header */}
                    <div 
                      onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50 transition-colors select-none"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-navy truncate">{user.fullName}</h4>
                        <p className="text-[10px] text-navy/40 font-medium truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${user.matchesCount > 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                          {user.matchesCount} {user.matchesCount === 1 ? 'Match' : 'Matches'}
                        </span>
                        <span className="text-navy/20 font-bold text-xs transform transition-transform duration-200">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="p-5 bg-gray-50/30 border-t border-gray-100 space-y-4 animate-in slide-in-from-top-1 duration-200">
                        {/* Qualifications Section */}
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-navy/40 mb-2">Qualifications</div>
                          {user.profile?.qualifications && user.profile.qualifications.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {user.profile.qualifications.map((q: any, qIdx: number) => (
                                <span key={qIdx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-bold text-navy uppercase tracking-wider">
                                  {q.name} {q.branch ? `(${q.branch})` : ''}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] text-navy/30 italic">No qualifications added</span>
                          )}
                        </div>

                        {/* Matched Jobs Section */}
                        <div>
                          <div className="text-[9px] font-black uppercase tracking-widest text-navy/40 mb-2">Eligible Matches</div>
                          {user.matches && user.matches.length > 0 ? (
                            <div className="space-y-2">
                              {user.matches.map((match: any, mIdx: number) => (
                                <div key={mIdx} className="p-3 bg-white border border-gray-100 rounded-xl flex items-center justify-between gap-3 shadow-xs">
                                  <Link href={`/all-jobs/${match.jobId}`} className="text-[11px] font-bold text-navy truncate hover:underline no-underline">
                                    {match.jobTitle}
                                  </Link>
                                  <span className="px-2 py-0.5 bg-navy/5 text-navy/50 text-[8px] font-black uppercase tracking-wider rounded-md">
                                    On {match.matchedOn}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">⚠ Candidate has 0 eligible job listings</p>
                          )}
                        </div>

                        {/* Delete User Action */}
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                          <button
                            onClick={async () => {
                              if (!confirm(`Are you sure you want to permanently delete candidate "${user.fullName}"? This action is irreversible.`)) return;
                              try {
                                const res = await fetch(`/api/admin/users?id=${user.id}`, { method: 'DELETE' });
                                if (res.ok) {
                                  alert("Candidate deleted successfully.");
                                  fetchUserAnalysis();
                                } else {
                                  alert("Failed to delete user.");
                                }
                              } catch (e) {
                                alert("Error deleting user.");
                              }
                            }}
                            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border border-red-100 cursor-pointer"
                          >
                            ✕ Delete Candidate Account
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function UsersAnalysisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-[10px] font-black uppercase tracking-widest text-navy/20 animate-pulse">Establishing Secure Command Session...</div>
      </div>
    }>
      <UsersAnalysisContent />
    </Suspense>
  );
}
