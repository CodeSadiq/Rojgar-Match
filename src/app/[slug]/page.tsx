'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getRegistryData } from '@/lib/data-service';
import { getTimeAgo } from '@/lib/helpers';
import BackButton from '@/components/BackButton';

const IconArrowLeft = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>;
const IconBuilding = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="22"></line><line x1="15" y1="22" x2="15" y2="22"></line></svg>;
const IconRefresh = ({ className }: { className?: string }) => <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>;

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [registry, setRegistry] = React.useState<any>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isMounted, setIsMounted] = React.useState(false);

  const loadData = React.useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const data = await getRegistryData();
      setRegistry(data);
    } catch (e) {
      console.error(e);
    } finally {
      if (isManual) setTimeout(() => setIsRefreshing(false), 500);
    }
  }, []);

  React.useEffect(() => {
    setIsMounted(true);
    loadData(true);
  }, [loadData]);

  // Map slug back to category name
  const categoryMap: Record<string, string> = {
    'admission': 'Admission',
    'syllabus': 'Syllabus',
    'result': 'Result',
    'admit-card': 'Admit Card',
    'important': 'Important',
    'all-jobs': 'All Jobs'
  };

  const categoryName = categoryMap[slug] || 'Notifications';

  const data = React.useMemo(() => {
    if (!registry) return [];
    if (categoryName === 'Important') {
      return registry.notifications || [];
    }
    return (registry.categories && registry.categories[categoryName]) || [];
  }, [registry, categoryName]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      <main className="flex-1 max-w-[1440px] mx-auto px-1 md:px-12 pt-6 md:pt-3 pb-1 md:pb-3 w-full animate-in fade-in duration-500">
        <div className="hidden md:block mb-6 pt-6">
          <BackButton className="gap-2 text-sm font-semibold text-navy/40 hover:text-navy transition-colors">
            <IconArrowLeft /> Back to Dashboard
          </BackButton>
        </div>

        <header className="mb-8 border-b-2 border-navy pb-5 flex flex-col md:flex-row md:items-end justify-between gap-1 md:gap-6 px-1 md:px-0">
          <div className="flex items-start gap-1 text-left">
            <BackButton className="md:hidden mt-0.5 text-navy/60 hover:text-navy transition-colors flex-shrink-0">
              <IconArrowLeft />
            </BackButton>
            <div>
              <h1 className="text-xl md:text-3xl font-serif font-bold tracking-tight text-navy leading-tight">{categoryName}</h1>
              <p className="text-[9px] md:text-[11px] md:text-gray-500 font-bold uppercase tracking-widest mt-1.5 opacity-60">All verified government openings</p>
            </div>
          </div>
          {isMounted && (
            <button 
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className={`self-end md:self-auto p-2 rounded-full hover:bg-navy/5 text-navy/40 hover:text-navy transition-all active:scale-90 ${isRefreshing ? 'opacity-50' : 'opacity-100'}`}
              title="Refresh Bulletins"
            >
              <IconRefresh className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          )}
        </header>

        {data.length > 0 ? (
          <div className="flex flex-col gap-3">
            {data.map((item: any, idx: number) => (
              <Link
                key={idx}
                href={`/bulletin/${item.id}`}
                className="group bg-white border-2 border-gray-200 rounded-xl p-4 md:p-6 flex items-center justify-between gap-4 no-underline hover:bg-gray-50 hover:border-navy hover:shadow-lg hover:shadow-navy/5 transition-all mb-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full shrink-0"></span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400 truncate">
                      {item.createdAt ? getTimeAgo(item.createdAt) : item.time}
                    </span>
                  </div>

                  <h3 className="text-[14px] md:text-lg font-bold text-navy leading-snug line-clamp-2">
                    {item.text}
                  </h3>
                </div>

                {/* 🔘 Action */}
                <div className="text-navy/20 group-hover:text-navy group-hover:translate-x-1 transition-all shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-100 p-10 md:p-20 text-center rounded-2xl md:rounded-3xl flex flex-col items-center justify-center">
            <p className="text-sm md:text-[15px] font-medium text-gray-500 leading-relaxed max-w-[400px] text-center">
              No current announcements found in the {categoryName} registry.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
