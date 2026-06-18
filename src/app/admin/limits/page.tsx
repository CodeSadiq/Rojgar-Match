'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import BackButton from '@/components/BackButton';

function LimitsDashboardContent() {
  const router = useRouter();

  const limitsData = [
    {
      category: '📧 Outbound Communication (SMTP)',
      items: [
        { name: 'SMTP Transporter Provider', value: 'Gmail SMTP Relay (smtp.gmail.com)', limit: 'N/A', status: 'Active (App Passwords)', url: 'https://myaccount.google.com/apppasswords' },
        { name: 'Daily Email Outbound Cap', value: '500 messages/day', limit: '500/day', status: 'Google Personal Account Limit' },
        { name: 'Max Email Payload Size', value: '25 MB', limit: '25 MB', status: 'Standard attachment maximum' },
        { name: 'Unsubscribe List-Headers', value: 'Configured', limit: 'N/A', status: 'Ensuring mailbox inboxing rates' }
      ]
    },
    {
      category: '🗄️ Database Cloud (MongoDB Atlas)',
      items: [
        { name: 'Database Cluster Tier', value: 'M0 Sandbox Shared Cluster', limit: 'Free Tier', status: 'Operational', url: 'https://cloud.mongodb.com' },
        { name: 'Max Database Storage Size', value: '512 MB', limit: '512 MB', status: 'MongoDB Free Tier Threshold' },
        { name: 'Max Active Connections', value: '100 Concurrent', limit: '100', status: 'Auto-scaled pool' },
        { name: 'Database Indexes Status', value: 'Stabilized (id, type, active, dates)', limit: 'N/A', status: 'Optimized query latency' }
      ]
    },
    {
      category: '🤖 AI Screening (OpenRouter & Models)',
      items: [
        { name: 'Default Screening Model', value: 'openai/gpt-4o-mini', limit: 'N/A', status: 'Active (Cost-Optimized)', url: 'https://openrouter.ai/keys' },
        { name: 'Model Context Window', value: '128,000 Tokens', limit: '128k', status: 'Maximum input context capacity' },
        { name: 'Max Completion Tokens', value: '16,384 Tokens', limit: '16k', status: 'Maximum model response length' },
        { name: 'OpenRouter Rate Limit Limit', value: 'Auto-managed', limit: 'Varies', status: 'Model specific throughput' }
      ]
    },
    {
      category: '📎 Client File System & Payload Caps',
      items: [
        { name: 'Resume PDF Size Threshold', value: '2 MB', limit: '2 MB', status: 'Enforced in Client Screening Modal' },
        { name: 'Serverless Request Payload Cap', value: '4.5 MB', limit: '4.5 MB', status: 'Vercel Serverless Function Max Body Size', url: 'https://vercel.com/dashboard' },
        { name: 'Vercel Function Execution Limit', value: '10 Seconds', limit: '10s (Hobby)', status: 'Serverless execution time-out' }
      ]
    },
    {
      category: '🔐 Authentication & Token Expirations',
      items: [
        { name: 'Password Recovery Token', value: '1 Hour (3,600 Seconds)', limit: '1h', status: 'Secure window' },
        { name: 'Google OAuth Console config', value: 'Configured Redirects', limit: 'N/A', status: 'Google Web Client Credentials', url: 'https://console.cloud.google.com/apis/credentials' },
        { name: 'NextAuth Session Lifetime', value: '30 Days', limit: '30d', status: 'Rolling cookie persistence' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 lg:p-10 font-sans selection:bg-navy selection:text-white">
      <div className="max-w-[1000px] mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Unified Header */}
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
              <h1 className="text-2xl font-black text-navy uppercase tracking-tighter">System & API Limits</h1>
              <p className="text-[10px] text-navy/40 font-bold uppercase tracking-widest mt-0.5">Console overview of infrastructure quotas and configurations</p>
            </div>
          </div>
        </div>

        {/* Limits Cards */}
        <div className="space-y-6">
          {limitsData.map((section, secIdx) => (
            <div key={secIdx} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-navy">{section.category}</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/25 transition-colors">
                    <div className="min-w-0 flex-1">
                      {item.url ? (
                        <a 
                          href={item.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#0D244D] hover:text-blue-600 transition-colors inline-flex items-center gap-1.5 no-underline"
                        >
                          <span>{item.name}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="opacity-55"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                        </a>
                      ) : (
                        <span className="text-xs font-bold text-navy block">{item.name}</span>
                      )}
                      <span className="text-[9px] text-navy/35 font-bold uppercase tracking-wider block mt-1">{item.status}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="px-3 py-1 bg-navy/5 text-navy text-[10px] font-black uppercase tracking-widest rounded-lg border border-navy/5">
                          {item.value}
                        </span>
                      </div>
                      <div className="w-[100px] text-right hidden md:block">
                        <span className="text-[10px] text-navy/40 font-mono font-bold">{item.limit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LimitsDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FDFDFD]">
        <div className="text-[10px] font-black uppercase tracking-widest text-navy/20 animate-pulse">Establishing Secure Command Session...</div>
      </div>
    }>
      <LimitsDashboardContent />
    </Suspense>
  );
}
