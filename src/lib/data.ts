export interface Job {
  id: number | string;
  emoji: string;
  title: string;
  org: string;
  type: string;
  typeLabel: string;
  salary: string | { min?: number; max?: number };
  location: string;
  lastDate: string;
  urgency: 'normal' | 'soon' | 'urgent';
  isNew: boolean;
  isRecommended: boolean;
  btnClass: string;
  qual: string;
  ageMin: number;
  ageMax: number;
  process: string;
  tags: string[];
  // Extended properties for Database/Post-wise detail
  qualification?: any[];
  selectionProcess?: string[];
  applicationFee?: Record<string, any>;
  importantDates?: Record<string, any>;
  notificationType?: string;
  totalVacancy?: number;
  advertisementNumber?: string;
}

export interface Notification {
  id: string;
  dot: string;
  text: string;
  desc: string;
  time: string;
}

export const JOBS: any[] = [];

export const NOTIFICATIONS: Notification[] = [];

export const CATEGORY_DATA: Record<string, any[]> = {
  "All Jobs": [],
  "Important": [],
  "Admit Card": [],
  "Result": [],
  "Admission": [],
  "Syllabus": []
};
