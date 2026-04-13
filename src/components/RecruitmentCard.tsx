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
      className={`group p-3 md:p-5 flex flex-col md:flex-row md:items-center gap-1 md:gap-4 transition-all rounded-xl no-underline relative overflow-hidden ${highlighted
          ? 'bg-navy/[0.02] border-2 border-navy shadow-lg ring-1 ring-navy/10'
          : 'bg-white border-2 border-gray-200 md:shadow-sm'
        } hover:border-navy`}
    >
      <div className="w-full flex-1">
        <div className="flex items-start justify-between gap-4 mb-0.5 md:mb-1">
          <h3 className="text-[14px] md:text-xl font-serif font-bold text-[#0D244D] leading-tight group-hover:text-navy transition-colors w-full">
            {job.title}
          </h3>
          <div className="bg-gray-50 text-navy/20 p-1.5 rounded-full flex-shrink-0 md:hidden">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </div>
        </div>

        <div className="flex items-center justify-between mt-1 md:mt-0">
          <div className="flex items-center gap-1.5">
            {isMatched ? (
              <div className="flex items-center gap-1 bg-navy text-white px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full border border-white/10">
                <span className="w-1 h-1 rounded-full bg-blue-300 animate-pulse"></span>
                <span className="text-[8px] md:text-[10px] font-serif font-bold uppercase tracking-wider">
                  Matched on {job.matchedOn || 'Profile'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-gray-50 text-gray-500 px-1.5 py-0.5 md:px-2 md:py-0.5 rounded-full border border-gray-100">
                <span className="text-[8px] md:text-[10px] font-serif font-bold uppercase tracking-wider">Public</span>
              </div>
            )}
            {/* Removed organization label */}
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <span className="text-[8px] font-serif font-bold text-gray-400 uppercase tracking-widest">Last Date:</span>
            <span className="text-[11px] font-serif font-bold text-[#FF3B30] italic">
              {isFallback && lastDateVal === "DETAILS AWAITED" ? "TBA" : lastDateVal}
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end border-l border-gray-100 pl-6 flex-shrink-0 gap-6">
        <div className="flex flex-col items-end">
          <div className="text-[9px] font-serif font-bold text-gray-400 uppercase tracking-widest mb-0.5">Last Date</div>
          <div className="text-xl font-serif font-bold text-[#FF3B30] leading-none drop-shadow-sm font-black italic">
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
