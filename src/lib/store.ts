
// 🏪 Global Store for Client-side caching
// This prevents redundant database calls during client-side navigation.

let cachedJobs: any[] | null = null;
let cachedRegistry: any | null = null;

export const getCachedJobs = () => cachedJobs;
export const setCachedJobs = (jobs: any[]) => {
  cachedJobs = jobs;
};

export const getCachedRegistry = () => cachedRegistry;
export const setCachedRegistry = (registry: any) => {
  cachedRegistry = registry;
};

export const clearCache = () => {
  cachedJobs = null;
  cachedRegistry = null;
};
