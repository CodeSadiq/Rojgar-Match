'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ── Icons ──────────────────────────────────────────
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconUser = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconMenu = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconX = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default function Navbar() {
  const pathname = usePathname();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sync auth state
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('govrecruit_auth');
      setIsLoggedIn(!!auth);
      const savedProfile = localStorage.getItem('govrecruit_profile');
      if (savedProfile) {
        try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error('Profile sync error:', e); }
      } else {
        setUserProfile(null);
      }
    };

    checkAuth();
    // Re-check on storage and custom events
    window.addEventListener('storage', checkAuth);
    window.addEventListener('govrecruit_auth_change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('govrecruit_auth_change', checkAuth);
    };
  }, [pathname]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('govrecruit_auth');
    localStorage.removeItem('govrecruit_profile');
    setIsLoggedIn(false);
    setUserProfile(null);
    setIsMobileMenuOpen(false);
    window.location.href = '/login';
  }, []);

  // Standard Nav Link Wrapper
  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`px-5 py-2 rounded-lg text-[15px] font-serif font-bold transition-all no-underline ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
      >
        {children}
      </Link>
    );
  };

  return (
    <>
      <nav className="bg-[#0D244D] h-[60px] flex items-center px-2 md:px-12 sticky top-0 z-[100] shadow-sm transform-gpu transition-none">

        {/* 🏛 Institutional Brand */}
        <Link href="/" className="flex items-center gap-2 no-underline mr-auto group transition-none">
          <div className="w-8 h-8 md:w-9 md:h-9 bg-white rounded-lg flex items-center justify-center overflow-hidden transition-all">
            <img src="/logo.png" alt="Rojgar Match Logo" className="w-6 h-6 md:w-7 md:h-7 object-contain" />
          </div>
          <strong className="text-white text-base md:text-xl font-serif font-bold leading-relaxed tracking-tight truncate max-w-[130px] md:max-w-none">Rojgar Match</strong>
        </Link>

        {/* 🗺 Navigation Manifest (Desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <NavLink href="/">Home</NavLink>
          <NavLink href="/for-you">For You</NavLink>
          <NavLink href="/all-jobs">All Jobs</NavLink>
        </div>

        {/* 👤 Personnel Access (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-4 ml-10">
          {!isLoggedIn ? (
            <Link
              href="/login"
              className="bg-white/10 hover:bg-white text-white hover:text-[#0D244D] border border-white/20 p-2.5 md:px-6 md:py-2.5 rounded-xl transition-all text-[15px] font-serif font-bold no-underline active:scale-95 flex items-center justify-center gap-2"
            >
              <IconUser />
              <span className="hidden md:inline text-nowrap">Candidate Login</span>
            </Link>
          ) : (
            <>
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 md:gap-3 bg-white/10 hover:bg-white/20 border border-white/5 px-2 md:px-4 py-2 rounded-lg md:rounded-xl transition-all text-white min-w-[50px] md:min-w-[180px] justify-between group shadow-lg shadow-black/5 focus:outline-none ${showUserMenu ? 'bg-white/20 ring-2 ring-white/10' : ''}`}
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="opacity-50 group-hover:opacity-100 transition-opacity"><IconUser /></span>
                    <span className="hidden md:inline text-[15px] font-serif font-bold whitespace-nowrap">
                      {userProfile?.fullName || 'Candidate'}
                    </span>
                  </div>
                  <span className={`text-[8px] md:text-[10px] transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-[220px] bg-white border-2 border-gray-100 shadow-2xl rounded-2xl overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                    <Link
                      href="/profile"
                      className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-serif font-bold text-[#0D244D] hover:bg-gray-50 transition-colors no-underline block"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span className="opacity-30"><IconUser /></span>
                      Profile Settings
                    </Link>
                    <div className="h-[1px] bg-gray-100 mx-4 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-[14px] font-serif font-bold text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <span className="opacity-30">⎆</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

        </div>

        {/* ☰ MB MENU TOGGLE (Mobile Only) */}
        <div className="flex lg:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-white/20"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? <IconX /> : <IconMenu />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU DRAWER (Outside nav for stacking context) */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[1000] lg:hidden animate-in fade-in duration-300" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="fixed top-0 right-0 h-full w-[280px] z-[1001] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-400 lg:hidden border-l border-white/10 opacity-100 flex flex-col"
            style={{ backgroundColor: '#0D244D' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0D244D] flex-shrink-0">
              <strong className="text-white text-sm font-serif font-bold uppercase tracking-widest opacity-40">Menu</strong>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white"><IconX /></button>
            </div>
            <div className="flex flex-col p-6 space-y-10 overflow-y-auto flex-1 pb-12">
              
              {/* 👤 Personnel Access (Top of Drawer) */}
              <div className="flex flex-col gap-6">
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 no-underline group active:bg-white/10 transition-all shadow-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-400 group-hover:text-[#0D244D] transition-all">
                      <IconUser />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-lg font-serif font-bold group-hover:text-amber-400 transition-colors">Candidate Login</span>
                      <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Access your dashboard</span>
                    </div>
                  </Link>
                ) : (
                  <div className="space-y-6">
                    {/* 👤 Refined Profile Container */}
                    <Link
                      href="/profile"
                      className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-3 group hover:bg-white/10 transition-all no-underline shadow-sm"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <h4 className="text-white text-[20px] font-serif font-bold leading-tight group-hover:text-blue-400 transition-colors">
                        {userProfile?.fullName || 'Candidate'}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-white/40 font-bold uppercase tracking-widest group-hover:text-white/70 transition-colors">
                          Profile Details
                        </span>
                        <div className="text-white/20 group-hover:text-blue-400 transition-colors group-hover:translate-x-1 transition-transform">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}
              </div>

              {/* 🗺 Navigation Links */}
              <div className="flex flex-col gap-2 pt-2">
                <div className="text-[10px] text-white/20 font-black uppercase tracking-[0.2em] mb-2 px-4">Navigation</div>
                <Link
                  href="/for-you"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all no-underline group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-1 h-8 rounded-full bg-blue-500 group-hover:bg-blue-400 transition-all opacity-40 group-hover:opacity-100 flex-shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-white text-xl font-serif font-bold group-hover:text-blue-400 transition-colors">For You</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Matched recruitment</span>
                  </div>
                </Link>
                <Link
                  href="/all-jobs"
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-all no-underline group"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="w-1 h-8 rounded-full bg-white opacity-10 group-hover:opacity-40 transition-all flex-shrink-0"></div>
                  <div className="flex flex-col">
                    <span className="text-white text-xl font-serif font-bold group-hover:text-white transition-colors">All Jobs</span>
                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Global repository</span>
                  </div>
                </Link>
              </div>

              {/* 🚪 Logout (Bottom of Drawer) */}
              {isLoggedIn && (
                <div className="border-t border-white/5 pt-10 mt-auto pb-4">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-transparent border-none p-0 flex items-center gap-4 p-4 rounded-xl hover:bg-red-500/5 transition-all group cursor-pointer"
                  >
                    <div className="text-red-400/30 group-hover:text-red-400 transition-colors flex-shrink-0">
                       <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-red-400 text-lg font-serif font-bold group-hover:text-red-300 transition-colors">Logout</span>
                    </div>
                  </button>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
}
