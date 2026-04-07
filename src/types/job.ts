export interface Qualification {
  name: string;
  level: number;
  branches: string[];
  extraConditions: string[];
  streamRequired?: string | null;
  institutionType?: string | null;
}

export interface CategoryVacancy {
  general: number | null;
  ews: number | null;
  obc: number | null;
  sc: number | null;
  st: number | null;
  pwd: number | null;
}

export interface Post {
  name: string;
  totalVacancy: number | null;
  minQualificationLevel: number | null;
  prerequisite: string[];
  qualification: Qualification[];
  categoryWiseVacancy: CategoryVacancy;
  appearingEligible: boolean;
  appearingConditions: string | null;
  qualificationNote: string | null;
}

export interface AgeRelaxation {
  obc: number | null;
  sc: number | null;
  st: number | null;
  pwd: number | null;
  exServiceman: number | null;
  female: number | null;
}

export interface AgeLimit {
  min: number | null;
  max: number | null;
  asOnDate: string | null;
  relaxation: AgeRelaxation;
}

export interface ApplicationFee {
  general: number | null;
  obc: number | null;
  sc: number | null;
  st: number | null;
  pwd: number | null;
  female: number | null;
  exServiceman: number | null;
  ews: number | null;
  paymentMode: string[];
}

export interface ImportantDates {
  notificationRelease: string | null;
  startDate: string | null;
  lastDate: string | null;
  feePaymentLastDate: string | null;
  correctionWindowLastDate: string | null;
  admitCardDate: string | null;
  examDate: string | null;
  resultDate: string | null;
  interviewDate: string | null;
  documentVerificationDate: string | null;
}

export interface DisplayStatus {
  notificationType: string;
  startDate: string;
  lastDate: string;
  examDate: string;
  admitCardDate: string;
  applicationFee: string;
  salaryRange: string;
  ageLimit: string;
  applyStatus: string;
}

export interface Salary {
  payLevel: number | null;
  min: number | null;
  max: number | null;
  currency: string;
}

export interface JobPost {
  id: string;
  title: string;
  advertisementNumber: string | null;
  organization: string;
  department: string | null;
  type: string;
  postNames: string[];
  posts: Post[];
  totalVacancy: number | null;
  categoryWiseVacancyTotal: CategoryVacancy;
  qualification: Qualification[];
  ageLimit: AgeLimit;
  categoryEligibility: string[];
  pwdEligible: boolean;
  femaleOnly: boolean;
  exServicemanQuota: boolean;
  location: string[];
  salary: Salary;
  applicationFee: ApplicationFee;
  importantDates: ImportantDates;
  applicationProcess: string[];
  selectionProcess: string[];
  description: string;
  shortInfo: string | null;
  officialWebsite: string | null;
  applyLink: string | null;
  notificationPdfLink: string | null;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  notificationType?: string;
  displayStatus?: DisplayStatus;
}
