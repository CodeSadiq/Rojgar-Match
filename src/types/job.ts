export interface QualificationCourse {
  name: string;
  branches: string[];
}

export interface Qualification {
  courses: QualificationCourse[];
  extraQualificationText: string;
}

export interface EducationRequirement {
  qualification: string;
  level: number;
  branches: string[];
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
  qualification: Qualification;
  educationRequirementForMatch: EducationRequirement[];
  categoryWiseVacancy: CategoryVacancy;
  appearingEligible: boolean;
  appearingConditions: string | null;
  ageLimit: AgeLimit;
  salary: Salary;
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
  notificationType: string | null;
  notificationRelease: string | null;
  applicationStartDate: string | null;
  applicationLastDate: string | null;
  feePaymentLastDate: string | null;
  correctionWindowLastDate: string | null;
  admitCardDate: string | null;
  examDate: string | null;
  resultDate: string | null;
  interviewDate: string | null;
  documentVerificationDate: string | null;
  officialWebsite: string | null;
  applyOnline: string | null;
  applyLink: string | null;
  notificationPdfLink: string | null;
  checkResult: string | null;
  lastDate?: string | null;
  customDates?: Array<{ label: string; date: string }>;
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
  _id?: string;
  title: string;
  advertisementNumber: string | null;
  organization: string;
  department: string | null;
  type: string;
  postNames: string[];
  posts: Post[];
  totalVacancy: number | null;
  categoryWiseVacancyTotal?: CategoryVacancy;
  qualification?: Qualification | any;
  ageLimit?: AgeLimit;
  salary?: Salary | any;
  categoryEligibility: string[];
  pwdEligible: boolean;
  femaleOnly: boolean;
  exServicemanQuota: boolean;
  location: string[];
  applicationFee: ApplicationFee;
  importantDates: ImportantDates;
  applicationProcess: string[];
  selectionProcess: string[];
  selectionProcessNote?: string;
  description: string;
  shortInfo: string | null;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  emoji?: string;
  urgency?: string;
  displayStatus?: DisplayStatus;
  notificationType?: string;
  active?: boolean;
}
