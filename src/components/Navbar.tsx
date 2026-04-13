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
      const auth = localStorage.getItem('rojgarmatch_auth');
      setIsLoggedIn(!!auth);

      const savedProfile = localStorage.getItem('rojgarmatch_profile');
      if (savedProfile) {
        try { setUserProfile(JSON.parse(savedProfile)); } catch (e) { console.error('Profile sync error:', e); }
      } else if (auth) {
        // Fallback to basic auth data if profile isn't set yet
        try { setUserProfile(JSON.parse(auth)); } catch (e) { setUserProfile(null); }
      } else {
        setUserProfile(null);
      }
    };

    checkAuth();
    // Re-check on storage and custom events
    window.addEventListener('storage', checkAuth);
    window.addEventListener('rojgarmatch_auth_change', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('rojgarmatch_auth_change', checkAuth);
    };
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout API failure:', e);
    }
    
    // Comprehensive Guest data cleanup: match all keys starting with rojgarmatch_
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('rojgarmatch_')) {
        localStorage.removeItem(key);
      }
    });

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
      <nav className="bg-[#0D244D] h-[56px] flex items-center px-6 md:px-12 sticky top-0 z-[100] shadow-sm transform-gpu transition-none">

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
                      {userProfile?.email === 'guest@rojgarmatch.local' ? 'Guest' : (userProfile?.fullName || 'Candidate')}
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
          <div className="fixed top-0 right-0 h-full w-[240px] z-[1001] shadow-[-10px_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-right duration-400 lg:hidden border-l border-white/10 opacity-100 flex flex-col"
            style={{ backgroundColor: '#0D244D' }}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0D244D] flex-shrink-0">
              <strong className="text-white text-sm font-serif font-bold uppercase tracking-widest opacity-40">Menu</strong>
              <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white"><IconX /></button>
            </div>
            <div className="flex flex-col p-6 space-y-4 overflow-y-auto flex-1">

              {/* 👤 Simplified Profile section */}
              <div className="mb-4">
                {!isLoggedIn ? (
                  <Link
                    href="/login"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 no-underline hover:bg-white/10 transition-all font-serif font-bold text-white text-lg"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span>Candidate Login</span>
                    <span className="ml-auto opacity-20 group-hover:opacity-100 transition-all font-sans">➜</span>
                  </Link>
                ) : (
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-white/10 no-underline hover:bg-white/10 transition-all font-serif font-bold text-white text-base group"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <span className="group-hover:text-blue-400 transition-colors">
                      {userProfile?.email === 'guest@rojgarmatch.local' ? 'Guest Access' : (userProfile?.fullName || 'Candidate')}
                    </span>
                    <span className="ml-auto opacity-20 group-hover:opacity-100 transition-all font-sans">➜</span>
                  </Link>
                )}
              </div>

              {/* 🗺 Navigation Links (Unified List) */}
              <div className="flex flex-col gap-2 pt-6 border-t border-white/5">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'For You', href: '/for-you' },
                  { name: 'All Jobs', href: '/all-jobs' },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-4 py-3 px-2 no-underline group transition-all ${pathname === link.href ? 'text-white' : 'text-white/40 hover:text-white'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${pathname === link.href ? 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' : 'bg-white/10'}`}></div>
                    <span className="text-lg font-serif font-bold tracking-tight">{link.name}</span>
                  </Link>
                ))}
              </div>

              {/* 🚪 Logout (Simplified) */}
              {isLoggedIn && (
                <div className="mt-auto pt-8 border-t border-white/5">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 text-red-400/60 hover:text-red-400 transition-colors bg-transparent border-none p-2 font-serif font-bold text-base cursor-pointer"
                  >
                    <span className="text-lg">⎆</span> Logout
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
