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

export const NOTIFICATIONS: Notification[] = [
  {
    id: "ssc-cgl-vacancy-metadata",
    time: "2 HOURS AGO",
    text: "SSC CGL 2025: Vacancy inventory metadata has been updated with institutional branch mapping.",
    desc: "The latest vacancy manifest for the Combined Graduate Level Examination 2025 is now fully synchronized with our matching engine. Candidates can now view individual post levels.",
    dot: "dot-green"
  },
  {
    id: "rrb-technical-announcement",
    time: "5 HOURS AGO",
    text: "New recruitment notification from Indian Railways (RRB) for Technical Personnel.",
    desc: "RRB has announced a new recruitment cycle for technical posts. The baseline eligibility registry will be updated within the next 12 hours.",
    dot: "dot-amber"
  },
  {
    id: "ibps-po-interview-schedule",
    time: "1 DAY AGO",
    text: "IBPS PO 2025: Final interview schedule has been released for all Banking institutions.",
    desc: "Candidates who cleared the mains can now download their interview call letters. Institutional mapping for final placement is currently in progress.",
    dot: "dot-navy"
  },
  {
    id: "upsc-cse-manifest-locked",
    time: "1 DAY AGO",
    text: "UPSC CSE 2025: Preliminary examinee manifest has been established and verified.",
    desc: "The Civil Services (Preliminary) Examination manifest is now locked. No further modifications to candidate credentials will be accepted for this cycle.",
    dot: "dot-green"
  }
];

export const CATEGORY_DATA: Record<string, any[]> = {
  "All Jobs": [
    { id: "defense-civilian-2025", text: "Ministry of Defense: Entry for 400+ Civilian Personnel now open.", desc: "The Ministry of Defense has officially released the recruitment manifest for 400+ civilian posts. This include administrative, technical, and support staff roles across various commands.", time: "1 HOUR AGO" },
    { id: "isro-tech-asst-2025", text: "ISRO Technical Assistant: Recruitment notification officially mapped.", desc: "Indian Space Research Organisation (ISRO) has updated the Technical Assistant competency registry. Candidates with diplomas in relevant fields can now prepare for the upcoming examination cycle.", time: "5 HOURS AGO" },
    { id: "sbi-so-manifest-2025", text: "State Bank of India: Specialist Officer recruitment manifest released.", desc: "SBI has announced the SO notification for current financial year. High-level technical and managerial positions are open for experienced professionals.", time: "1 DAY AGO" },
    { id: "npcil-graduate-2025", text: "NPCIL Scientific Officer: Graduate training program registry entry.", desc: "Nuclear Power Corporation of India Limited (NPCIL) has established the recruitment protocol for Scientific Officers via Training Schools. Valid GATE scores are mandatory for initial screening.", time: "2 DAYS AGO" }
  ],
  "Important": [
    { id: "ncte-teaching-parity", text: "NCTE New Guidelines: Mandatory qualification parity for teaching posts.", desc: "The National Council for Teacher Education (NCTE) has released a new institutional directive regarding the normalization of teacher qualification standards across all state registries.", time: "1 HOUR AGO" },
    { id: "nra-cet-mapping", text: "National Recruitment Agency: CET implementation manifest for 2026.", desc: "The NRA has finalized the preliminary blueprint for the Common Eligibility Test (CET) execution in 2026. Preliminary screening for Group B and C posts will be synchronized via this registry.", time: "4 HOURS AGO" },
    { id: "aadhaar-mandatory-sync", text: "Aadhaar Mandatory Policy: Secure registry sync required for all applications.", desc: "Institutional directive: Aadhaar-based biometric verification is now mandatory for all citizen applications. This ensures high-fidelity candidate verification and prevents registry duplication.", time: "1 DAY AGO" },
    { id: "warning-phishing-appointment", text: "Institutional Warning: Phishing alert for fraudulent appointment letters.", desc: "Emergency Alert: Multiple fraudulent appointment letters mimicking official GovRecruit stationery have been detected in the wild. Please verify all appointment logs via the official portal only.", time: "2 DAYS AGO" }
  ],
  "Admit Card": [
    { id: "upsc-mains-admit-2025", text: "UPSC CSE Mains 2025: E-Admit cards now accessible via portal.", desc: "The Union Public Service Commission has released the electronic admit cards for the Civil Services Main Examination 2025. Verify your center manifest immediately.", time: "2 HOURS AGO" },
    { id: "ssc-cgl-tier2-hall-ticket", text: "SSC CGL Tier II: Hall tickets established for Southern Region.", desc: "Staff Selection Commission (SSC) has synchronized the hall ticket distribution for the Southern Region. Candidates can now download their digital entrance manifest.", time: "5 HOURS AGO" },
    { id: "rrb-groupd-phase3-admit", text: "RRB Group D: Phase 3 examinee manifest admit cards released.", desc: "Phase 3 admit cards for the RRB Group D recruitment cycle are now active. Please ensure your photograph metadata matches the originally submitted manifest.", time: "1 DAY AGO" },
    { id: "sbi-po-pre-admit-2025", text: "SBI PO Prelims: Official call letters established for distribution.", desc: "SBI has activated the download link for the Probationary Officer preliminary examination. Biometric enrollment details are included in the manifest.", time: "1 DAY AGO" }
  ],
  "Result": [
    { id: "ssc-mts-merit-2024", text: "SSC Multi Tasking Staff (MTS) 2024: Final merit manifest established.", desc: "The final selection registry for MTS 2024 has been verified. Successful candidates are advised to prepare their document verification manifest for the next phase.", time: "1 HOUR AGO" },
    { id: "rrb-ntpc-stage2-result", text: "RRB NTPC: Stage-II computerized test results officially released.", desc: "Railway Recruitment Board has published the stage-II CBT manifests. Merit lists for individual levels are now available for institutional audit.", time: "4 HOURS AGO" },
    { id: "upsc-geologist-selection-2025", text: "UPSC Combined Geologist: Selection registry now public.", desc: "The Union Public Service Commission has finalized the selection manifest for the Combined Geo-Scientist examination. Appointment letters will follow the verification cycle.", time: "1 DAY AGO" },
    { id: "bpss-sc-provisional-checklist", text: "BPSS SC 2024: Provisional interview checklist finalized.", desc: "The provisional candidate checklist for upcoming interviews has been established. Candidates must verify their qualifying credentials against the baseline manifest.", time: "2 DAYS AGO" }
  ],
  "Admission": [
    { id: "iit-b-mtech-round2-2025", text: "IIT Bombay M.Tech 2025: Admission portal remains open for Round 2 entries.", desc: "IIT Bombay has activated the COAP manifest for the second round of M.Tech admissions. Candidates must lock their choices before the registry deadline.", time: "4 HOURS AGO" },
    { id: "du-pg-alloc-manifest-2025", text: "Delhi University PG Admissions: Revised seat allocation manifest released.", desc: "DU has released the revised PG seat matrix. Institutional mapping for preferred departments must be completed within the next 48 hours.", time: "1 DAY AGO" },
    { id: "clat-2025-seat-matrix", text: "NLU CLAT 2025: Preliminary seat matrix has been established.", desc: "The National Law Universities (NLUs) have released the updated seat manifest for CLAT 2025. Counseling rounds will be synchronized with this registry.", time: "2 DAYS AGO" },
    { id: "jnu-phd-viva-registry", text: "JNU PhD Admissions: Viva-voce registry now finalized.", desc: "Jawaharlal Nehru University has completed the viva-voce mapping for various PhD departments. The final selection manifest is expected within 7 days.", time: "3 DAYS AGO" }
  ],
  "Syllabus": [
    { id: "uppsc-combined-syllabus-2025", text: "UPPSC Combined Services: Revised preliminary syllabus manifest published.", desc: "The Uttar Pradesh Public Service Commission has updated the preliminary examination curriculum. Modern history and current administrative manifests have been expanded.", time: "2 HOURS AGO" },
    { id: "ssc-mts-curriculum-update", text: "SSC Multi Tasking Staff: New departmental curriculum mapping update.", desc: "SSC has released a clarification on the departmental exam syllabus. Specialized sections on administrative workflow have been prioritized.", time: "6 HOURS AGO" },
    { id: "rrb-tech-syllabus-established", text: "Railway Recruitment Board: Technical examination syllabus established.", desc: "RRB has finalized the technical manifest for upcoming engineer and technician roles. Core engineering benchmarks will be the basis of the computerized tests.", time: "1 DAY AGO" },
    { id: "upsc-optional-lit-2026", text: "UPSC Optional Subjects: Updated literature syllabus for 2026 cycle.", desc: "Institutional update: The literature optional syllabus for UPSC 2026 has been refreshed. Candidates should update their preparation registry accordingly.", time: "3 DAYS AGO" }
  ]
};
