'use client';

import React from 'react';
import Link from 'next/link';

interface RecruitmentCardProps {
  job: any;
  isMatched?: boolean;
  highlighted?: boolean;
}

const RecruitmentCard: React.FC<RecruitmentCardProps> = ({ job, isMatched, highlighted }) => {
  const lastDateVal = job.importantDates?.applicationLastDate || job.importantDates?.lastDate || job.lastDate || job.notificationType || (job as any).displayStatus?.notificationType || "DETAILS AWAITED";
  const isFallback = !lastDateVal?.toString().includes('202');

  return (
    <Link
      href={`/all-jobs/${job.id || job._id}`}
      className={`group mx-4 mb-1 md:mx-0 md:mb-0 p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-2 md:gap-4 transition-all rounded-xl no-underline relative overflow-hidden ${highlighted
        ? 'bg-navy/[0.02] border-2 border-navy shadow-lg ring-1 ring-navy/10'
        : 'bg-white border-2 border-gray-100 md:border-gray-200 shadow-sm md:shadow-sm'
        } hover:border-navy`}
    >
      <div className="w-full flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-[13px] md:text-xl font-serif font-bold text-[#0D244D] leading-tight group-hover:text-navy transition-colors">
            {job.title}
          </h3>
        </div>

        <div className="flex items-center justify-between mt-2 md:mt-2 border-t border-gray-50 pt-2 md:border-0 md:pt-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isMatched ? (
              <div className="flex items-center gap-1 bg-navy text-white px-2 py-0.5 rounded-full border border-white/10">
                <span className="w-1 h-1 rounded-full bg-blue-300 animate-pulse"></span>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wider">
                  Matched on {job.matchedOn || 'Profile'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-navy text-white px-2 py-0.5 rounded-full border border-white/10">
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-wider">Public</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 md:hidden">
              <span className="hidden xs:inline text-[8px] font-bold text-gray-300 uppercase tracking-widest">Last Date:</span>
              <span className="text-[10px] font-black text-[#FF3B30] italic bg-red-50 px-2 py-0.5 rounded-md border border-red-100/30">
                {isFallback && lastDateVal === "DETAILS AWAITED" ? "PENDING" : lastDateVal}
              </span>
            </div>

            <div className="bg-gray-50 text-navy/20 p-2 rounded-full flex-shrink-0 md:hidden scale-75">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end border-l border-gray-100 pl-6 flex-shrink-0 gap-6">
        <div className="flex flex-col items-end">
          <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Last Date</div>
          <div className="text-xl font-serif font-black text-[#FF3B30] leading-none italic">
            {isFallback && lastDateVal === "DETAILS AWAITED" ? "PENDING" : lastDateVal}
          </div>
        </div>

        <div className="bg-gray-50 text-navy/20 p-2 rounded-full flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      </div>
    </Link>
  );
};

export default RecruitmentCard;
