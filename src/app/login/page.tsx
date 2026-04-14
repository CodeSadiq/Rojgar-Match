'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

const IconShield = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>;
const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconArrowRight = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconMail = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>;
const IconGoogle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
  </svg>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Invalid credentials');
      }

      const userData = await res.json();

      // Success: Save session
      localStorage.setItem('rojgarmatch_auth', JSON.stringify({
        fullName: userData.fullName,
        email: userData.email
      }));

      // Restore profile if it exists on the server
      if (userData.profile) {
        localStorage.setItem('rojgarmatch_profile', JSON.stringify({
          ...userData.profile,
          fullName: userData.fullName,
          email: userData.email
        }));
      }

      // Signal Navbar for immediate update
      window.dispatchEvent(new Event('rojgarmatch_auth_change'));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });

      if (!res.ok) throw new Error('Google authentication failed');

      const userData = await res.json();

      // Success: Save session
      localStorage.setItem('rojgarmatch_auth', JSON.stringify({
        fullName: userData.fullName,
        email: userData.email,
        avatar: userData.avatar
      }));

      if (userData.profile) {
        localStorage.setItem('rojgarmatch_profile', JSON.stringify({
          ...userData.profile,
          fullName: userData.fullName,
          email: userData.email
        }));
      }

      window.dispatchEvent(new Event('rojgarmatch_auth_change'));
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    // Initialize Google One Tap / Login
    const initializeGoogle = () => {
      if (typeof window !== 'undefined' && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: "962213572826-d6j12qircjvf1eritlm468cqsbkeufvt.apps.googleusercontent.com",
          callback: (response: any) => handleGoogleLogin(response.credential),
        });
      }
    };

    const script = document.createElement('script');
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = initializeGoogle;
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const triggerGooglePrompt = () => {
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
      // Also try to render or trigger standard flow
      // For simplicity in this UI, we can just use the prompt or a custom button
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">

        {/* BACKGROUND DECOR */}
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-[0.02] flex items-center justify-center">
          <h1 className="text-[25vw] font-serif font-bold text-navy rotate-[-10deg]">Portal</h1>
        </div>

        <main className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
          
          {/* 🔙 BACK NAVIGATION (Repositioned) */}
          <div className="mb-6">
            <BackButton className="text-navy/40 hover:text-navy text-[10px] font-bold uppercase tracking-[0.3em] font-sans flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
              <span>Back</span>
            </BackButton>
          </div>

          <div className="text-center mb-10">
            <h2 className="text-4xl font-serif font-bold text-navy leading-none mb-2">Login</h2>
          </div>

          {/* AUTH CARD */}
          <div className="bg-white rounded-[32px] overflow-hidden group shadow-2xl shadow-navy/5 border border-gray-100/50">
            <form onSubmit={handleLogin} className="p-8 md:p-10 space-y-4">

              {error && (
                <div className="bg-red/5 border-2 border-red/10 text-red text-[11px] font-black uppercase tracking-widest p-4 rounded-2xl animate-in fade-in slide-in-from-top-2">
                  ⚠️ {error}
                </div>
              )}

              <div className="space-y-6">
                {/* EMAIL */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 block px-1">
                    Email Address
                  </label>
                  <div className="relative group/field">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within/field:text-navy transition-colors">
                      <IconMail />
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.gov"
                      className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 text-[15px] font-sans font-medium text-navy placeholder:text-gray-400 rounded-2xl focus:outline-none focus:border-navy transition-all tracking-tight shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 block px-1">
                    Password
                  </label>
                  <div className="relative group/field">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within/field:text-navy transition-colors">
                      <IconLock />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 text-[15px] font-sans font-medium text-navy placeholder:text-gray-400 rounded-2xl focus:outline-none focus:border-navy transition-all shadow-sm focus:shadow-md"
                    />
                  </div>
                </div>
              </div>

              {/* MAIN ACTION */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-navy hover:bg-[#06142E] text-white py-3 md:py-4 px-8 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 group/btn shadow-lg shadow-navy/20 rounded-2xl relative overflow-hidden active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="group-hover/btn:translate-x-1 transition-transform"><IconArrowRight /></span>
                    </>
                  )}
                </button>
              </div>

              {/* SEPARATOR */}
              <div className="flex items-center gap-4 py-2">
                <div className="flex-1 h-[1px] bg-gray-100"></div>
                <span className="text-[10px] font-black uppercase text-gray-300 tracking-widest">OR</span>
                <div className="flex-1 h-[1px] bg-gray-100"></div>
              </div>

              {/* GUEST ACCESS */}
              <button
                type="button"
                onClick={async () => {
                  setIsLoading(true);
                  try {
                    const res = await fetch('/api/auth/guest', { method: 'POST' });
                    if (res.ok) {
                      const userData = await res.json();
                      localStorage.setItem('rojgarmatch_auth', JSON.stringify({
                        fullName: userData.fullName,
                        email: userData.email,
                        isGuest: true
                      }));
                      window.dispatchEvent(new Event('rojgarmatch_auth_change'));
                      window.location.href = '/';
                    }
                  } catch (e) {
                    console.error('Guest auth failed', e);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="w-full bg-navy/[0.03] border-2 border-navy/[0.05] hover:bg-navy/[0.06] hover:border-navy/[0.1] text-navy/60 hover:text-navy py-3 md:py-4 px-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 rounded-2xl active:scale-[0.95] group/guest"
              >
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-sm group-hover/guest:bg-navy group-hover/guest:text-white transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <span>Continue as a guest</span>
                <span className="group-hover/guest:translate-x-1 transition-transform">➜</span>
              </button>

              {/* SOCIAL LOGIN */}
              <button
                type="button"
                onClick={triggerGooglePrompt}
                className="w-full bg-white border-2 border-gray-100 hover:border-gray-200 text-navy py-3 md:py-4 px-8 font-black text-xs uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-4 rounded-2xl hover:bg-gray-50 active:scale-[0.98] mt-2"
              >
                <IconGoogle />
                <span>Continue with Google</span>
              </button>

            </form>

            {/* BOTTOM LINK */}
            <div className="bg-gray-50/50 p-6 text-center border-t border-gray-100">
              <p className="text-[14px] font-sans font-medium text-gray-500 items-center justify-center gap-2 flex">
                Don't have an account?
                <Link href="/signup" className="text-navy font-bold hover:text-[#1d4ed8] transition-colors no-underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* FOOTER */}
          <p className="mt-6 text-center text-[9px] font-black uppercase tracking-[0.3em] text-gray-300">
            RojgarMatch Verification Protocol Active
          </p>

        </main>
      </div>
    </div>
  );
}
