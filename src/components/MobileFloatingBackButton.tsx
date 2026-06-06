'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function MobileFloatingBackButton() {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Check if the loading screen is present in the DOM
    const checkLoading = () => {
      const loadingEl = document.getElementById('loading-screen');
      setIsLoading(!!loadingEl);
    };

    checkLoading();

    // Set up MutationObserver to detect DOM changes
    const observer = new MutationObserver(checkLoading);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [pathname]);

  // On job post pages, place the back button higher (above zoom controls)
  const isJobPost = pathname.startsWith('/all-jobs/') && pathname !== '/all-jobs';
  const bottomClass = isJobPost ? 'bottom-20' : 'bottom-6';
  
  const isVisible = pathname !== '/' && !isLoading && !isJobPost;

  return (
    <button
      onClick={(e) => { e.preventDefault(); router.back(); }}
      className={`md:hidden fixed ${bottomClass} right-6 z-[90] bg-white/95 backdrop-blur shadow-xl border border-gray-200 rounded-full p-2 flex items-center justify-center text-navy hover:bg-navy hover:text-white transition-all duration-300 ease-out w-12 h-12 ${
        isVisible 
          ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
          : 'opacity-0 scale-75 translate-y-4 pointer-events-none'
      }`}
      aria-label="Go Back"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="19" y1="12" x2="5" y2="12"></line>
        <polyline points="12 19 5 12 12 5"></polyline>
      </svg>
    </button>
  );
}
