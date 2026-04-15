'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BackButton from '@/components/BackButton';

const IconLock = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
const IconCheck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ text: '', isError: false, isSuccess: false });

  useEffect(() => {
    if (!token) {
      setStatus({ text: 'Invalid or missing security token.', isError: true, isSuccess: false });
    }
  }, [token]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ text: 'Passwords do not match.', isError: true, isSuccess: false });
      return;
    }

    setIsLoading(true);
    setStatus({ text: '', isError: false, isSuccess: false });

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Reset failed');

      setStatus({ text: 'Success! Your institutional credentials have been updated.', isError: false, isSuccess: true });
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setStatus({ text: err.message, isError: true, isSuccess: false });
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !status.isSuccess) {
     return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-2xl font-serif font-bold text-navy mb-4">Security Access Denied</h2>
            <p className="text-navy/60 mb-8">This recovery link is invalid or has expired.</p>
            <BackButton className="bg-navy text-white px-8 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest">Return to Login</BackButton>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans overflow-hidden">
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        <main className="w-full max-w-[440px] relative z-10 animate-in fade-in zoom-in-95 duration-700">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-navy text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-navy/20">
                <IconLock />
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-navy leading-none mb-2">Finalize Recovery</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Identity Verification Successful</p>
          </div>

          <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl shadow-navy/5 border border-gray-100/50">
            <div className="p-8 md:p-10">
              {status.text && (
                <div className={`mb-8 p-5 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 leading-relaxed ${status.isError ? 'bg-red/5 border-red/10 text-red' : 'bg-green-500/5 border-green-500/10 text-green-600'}`}>
                  {status.isError ? '⚠️' : '✅'} {status.text}
                </div>
              )}

              {!status.isSuccess && (
                <form onSubmit={handleReset} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 block px-1">
                        New Security Credential
                    </label>
                    <div className="relative group/field">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within/field:text-navy transition-colors">
                            <IconLock />
                        </span>
                        <input
                            type="password"
                            required
                            min={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 text-[15px] font-sans font-medium text-navy placeholder:text-gray-400 rounded-2xl focus:outline-none focus:border-navy transition-all shadow-sm"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2.5 block px-1">
                        Confirm Credential
                    </label>
                    <div className="relative group/field">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none group-focus-within/field:text-navy transition-colors">
                            <IconLock />
                        </span>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Repeat new password"
                            className="w-full bg-white border-2 border-gray-100 py-4 pl-12 pr-4 text-[15px] font-sans font-medium text-navy placeholder:text-gray-400 rounded-2xl focus:outline-none focus:border-navy transition-all shadow-sm"
                        />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-navy hover:bg-[#06142E] text-white py-4 px-8 font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 group/btn shadow-lg shadow-navy/20 rounded-2xl relative overflow-hidden active:scale-[0.98]"
                  >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <span>Update Password</span>
                            <IconCheck />
                        </>
                    )}
                  </button>
                </form>
              )}

              {status.isSuccess && (
                <div className="text-center py-4">
                     <p className="text-[14px] font-medium text-navy/40 uppercase tracking-widest animate-pulse">Redirecting to login portal...</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
