'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ForceScrollTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Force immediate scroll to top on mount or pathname change
    window.scrollTo(0, 0);
    // Also use a slight delay for aggressive browsers/Next.js scroll restoration
    const timer = setTimeout(() => {
      window.scrollTo(0, 0);
    }, 10);
    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
