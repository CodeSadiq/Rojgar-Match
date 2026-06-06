
// 🏛 Institutional Data Persistence Service
// This service synchronizes manifests with the MongoDB backend.

import { CATEGORY_DATA, NOTIFICATIONS } from './data';

export const getRegistryData = async (all = false) => {
  // If we are server-side, we can't fetch from internal API easily without full URL
  // But this is usually called from client-side useEffect.
  if (typeof window === 'undefined') return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };

  try {
    const url = all ? '/api/bulletins?all=true' : '/api/bulletins';
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const bulletins = await res.json();

    if (!Array.isArray(bulletins)) return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };

    // Initialize with static data
    const categories: any = { ...CATEGORY_DATA };
    const mergedNotifications = [...NOTIFICATIONS];

    // Merge DB data
    bulletins.forEach((b: any) => {
      if (b.category === 'Important') {
        const index = mergedNotifications.findIndex(n => n.id === b.id);
        if (index === -1) {
          mergedNotifications.unshift(b);
        } else {
          // If it matches a static fallback, merge it (especially for active status)
          mergedNotifications[index] = { ...mergedNotifications[index], ...b };
        }
      } else {
        if (!categories[b.category]) categories[b.category] = [];
        const index = categories[b.category].findIndex((item: any) => item.id === b.id);
        if (index === -1) {
          categories[b.category].unshift(b);
        } else {
          categories[b.category][index] = { ...categories[b.category][index], ...b };
        }
      }
    });

    return { notifications: mergedNotifications, categories };
  } catch (e) {
    console.error('Registry sync failed, falling back to static data:', e);
    return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };
  }
};

export const saveBulletinToRegistry = async (bulletin: any, category: string) => {
  if (typeof window === 'undefined') return;

  const payload = { ...bulletin, category, updatedAt: new Date().toISOString() };

  try {
    const res = await fetch('/api/bulletins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('Failed to save bulletin');
    return await res.json();
  } catch (e) {
    console.error('Save to Registry failed:', e);
    throw e;
  }
};
