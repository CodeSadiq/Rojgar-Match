
// 🏛 Institutional Data Persistence Service (Mock)
// This service simulates a backend by synchronizing manifests with the browser's localStorage.

import { CATEGORY_DATA, NOTIFICATIONS } from './data';

const STORAGE_KEY = 'govrecruit_manifest_store';

export const getRegistryData = () => {
  if (typeof window === 'undefined') return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };
  
  try {
    const dynamicData = JSON.parse(stored);
    
    // Merge static and dynamic data
    const mergedNotifications = [...(dynamicData.notifications || [])];
    const mergedCategories = { ...CATEGORY_DATA };
    
    Object.keys(dynamicData.categories || {}).forEach(cat => {
      mergedCategories[cat] = [...(mergedCategories[cat] || []), ...(dynamicData.categories[cat] || [])];
    });

    return { notifications: mergedNotifications, categories: mergedCategories };
  } catch (e) {
    return { notifications: NOTIFICATIONS, categories: CATEGORY_DATA };
  }
};

export const saveBulletinToRegistry = (bulletin: any, category: string) => {
  if (typeof window === 'undefined') return;

  const stored = localStorage.getItem(STORAGE_KEY);
  let data = stored ? JSON.parse(stored) : { notifications: [], categories: {} };

  if (!data.categories[category]) data.categories[category] = [];
  
  // Update or Add
  const index = data.categories[category].findIndex((b: any) => b.id === bulletin.id);
  if (index >= 0) {
    data.categories[category][index] = bulletin;
  } else {
    data.categories[category].unshift(bulletin);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};
