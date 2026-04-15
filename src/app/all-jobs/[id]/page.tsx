import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Job from "@/models/Job";
import { JobPost } from "@/types/job";
import { fmtDate, fmtMoney } from "@/lib/helpers";
import Link from "next/link";
import BackButton from "@/components/BackButton";
import { getCachedData, setCachedData } from "@/lib/cache";

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 0.5,
  maximumScale: 5,
  userScalable: true,
};

// ── ICONS ────────────────────────────────────────────────────────────────────
const IconInfo = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
);
const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
);
const IconUsers = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
);
const IconBriefcase = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
);
const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
);
const IconCreditCard = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
);
const IconArrow = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const IconBack = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
);
const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
);
const IconCheckGreen = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

  .jd {
    --serif:  'Libre Baskerville', Georgia, serif;
    --sans:   'Source Sans 3', system-ui, sans-serif;
    --mono:   'Roboto Mono', monospace;

    --ink:        #1c1917;
    --ink-light:  #44403c;
    --ink-muted:  #78716c;
    --paper:      #fafaf9;
    --paper-alt:  #f5f5f4;
    --border:     #d6d3d1;
    --navy:       #1e3a5f;
    --crimson:    #7f1d1d;
    --gold-bg:    #fef3c7;
    --green:      #14532d;
    --green-light: #f0fdf4;
    --blue:       #1e40af;
    --blue-bg:    #eff6ff;
    --amber-bg:   #fffbeb;
    --amber:      #78350f;

    font-family: var(--sans);
    font-size: 14px;
    line-height: 1.5;
    color: var(--ink);
    background: var(--paper);
    -webkit-font-smoothing: antialiased;
    min-height: 100vh;
    padding-top: 20px;
  }

  @media (max-width: 768px) {
    .jd { padding-top: 5px; }
    .jd-wrap { padding: 0 16px 60px; }
  }

  .jd * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── LAYOUT ── */
  .jd-wrap {
    max-width: 1240px;
    margin: 0 auto;
    padding: 0 60px 100px;
  }

  /* ── MASTHEAD ── */
  .jd-masthead {
    border-bottom: 3px double var(--border);
    padding: 28px 0 22px;
  }
  .jd-eyebrow {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .jd-eyebrow::before, .jd-eyebrow::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .jd-header-back { display: none; }
  .jd-title {
    font-family: var(--serif);
    font-size: clamp(24px, 4vw, 38px);
    font-weight: 700;
    line-height: 1.2;
    color: var(--navy);
    text-align: center;
    margin-bottom: 12px;
  }
  .jd-advert {
    font-family: var(--mono);
    font-size: 11px;
    color: var(--ink-muted);
    text-align: center;
    margin-bottom: 16px;
  }
  .jd-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 5px;
  }
  .jd-tag {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 2px 8px;
    border: 1px solid var(--border);
    color: var(--ink-muted);
    background: var(--paper-alt);
  }

  /* ── HERO STRIP ── */
  .tr-highlight td { color: #D93025 !important; font-weight: 700; }
  
  .jd-hero {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border: 1px solid var(--border);
    border-bottom: 2px solid var(--navy);
    margin: 24px 0;
    background: var(--border);
    gap: 1px;
  }
  .jd-hero-cell {
    background: var(--paper);
    padding: 18px 16px;
    text-align: center;
  }
  .jd-hero-cell.accent { background: var(--navy); }
  .jd-hero-label {
    font-family: var(--mono);
    font-size: 9px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 5px;
  }
  .jd-hero-cell.accent .jd-hero-label { color: rgba(255,255,255,0.55); }
  .jd-hero-value {
    font-family: var(--serif);
    font-size: 28px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .jd-hero-cell.accent .jd-hero-value { color: #fff; }
  .jd-hero-sub { font-size: 12px; color: var(--ink-muted); margin-top: 3px; }
  .jd-hero-cell.accent .jd-hero-sub { color: rgba(255,255,255,0.5); }

  /* ── LEDE ── */
  .jd-lede {
    font-size: 15px;
    color: var(--ink-light);
    font-style: italic;
    line-height: 1.7;
    border-left: 3px solid var(--navy);
    padding-left: 16px;
    margin: 24px 0;
  }

  /* ── SECTION HEADER ── */
  .jd-section {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 60px 0 12px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--navy);
  }
  .jd-section-icon { color: var(--crimson); display: flex; }
  .jd-section-title {
    font-family: var(--serif);
    font-size: 16px;
    font-weight: 700;
    color: var(--navy);
  }

  /* ── UNIVERSAL BORDERED TABLE ── */
  .jd-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    border: 1px solid var(--border);
  }
  .jd-table th {
    background: var(--navy);
    color: #fff;
    font-family: var(--sans);
    font-size: 12.5px;
    font-weight: 600;
    text-align: left;
    padding: 9px 12px;
    border: 1px solid #2d5986;
    white-space: nowrap;
  }
  .jd-table th.center { text-align: center; }
  .jd-table td {
    padding: 10px 14px;
    border: 1px solid var(--border);
    vertical-align: middle;
    color: var(--ink);
    font-size: 16px;
    word-break: break-word;
    overflow-wrap: break-word;
  }
  .jd-table tbody tr:nth-child(even) td { background: var(--paper-alt); }
  .jd-table tbody tr:hover td { background: #eeede9; }
  .jd-table td.center { text-align: center; }
  .jd-table td.label {
    font-weight: 600;
    color: var(--ink-light);
    white-space: nowrap;
    width: 220px;
  }
  .jd-table td.mono { font-family: var(--mono); font-size: 13px; }
  .jd-table td.bold { font-weight: 700; }
  .jd-table td.green { color: var(--green); font-weight: 600; }
  .jd-table td.red   { color: var(--crimson); font-weight: 600; }

  /* totals row */
  .jd-table tr.tr-total td {
    background: #dce6f0 !important;
    font-weight: 700;
    color: var(--navy);
    border-top: 2px solid var(--navy);
  }
  /* highlighted date row */
  .jd-table tr.tr-highlight td { background: var(--gold-bg) !important; }
  /* group subheader inside table */
  .jd-table tr.tr-subhead td {
    background: #e8eef5 !important;
    font-weight: 600;
    font-size: 13px;
    color: var(--navy);
    border-top: 2px solid var(--navy);
  }
  /* note row inside table */
  .jd-table tr.tr-note td {
    background: var(--amber-bg) !important;
    color: var(--amber);
    font-size: 13px;
  }

  /* ── QUAL CELL STYLES ── */
  .qual-cell {
    padding: 10px 14px;
    border: 1px solid var(--border);
    vertical-align: top;
    background: #fff;
    min-width: 280px;
  }

  .qual-course-pill {
    display: inline-block;
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 700;
    color: var(--navy);
    background: rgba(30,58,95,0.07);
    border: 1px solid rgba(30,58,95,0.15);
    padding: 3px 9px;
    border-radius: 3px;
    margin-bottom: 4px;
  }

  .qual-branch-line {
    font-size: 13px;
    color: var(--ink-light);
    margin: 5px 0 0 2px;
    line-height: 1.5;
  }

  .qual-branch-label {
    font-weight: 600;
    color: var(--ink);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-right: 4px;
  }

  .qual-extra {
    font-size: 12px;
    color: var(--amber);
    background: var(--amber-bg);
    border-left: 3px solid #d97706;
    padding: 6px 10px;
    margin-top: 8px;
    line-height: 1.5;
  }

  .qual-or-sep {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 0;
  }
  .qual-or-sep-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }
  .qual-or-sep-badge {
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    color: var(--ink-muted);
    background: var(--paper-alt);
    border: 1px solid var(--border);
    padding: 2px 7px;
    border-radius: 4px;
    letter-spacing: 0.1em;
  }

  .qual-appearing {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: var(--green-light);
    color: var(--green);
    font-weight: 600;
    padding: 5px 9px;
    border-radius: 3px;
    font-size: 12px;
    margin-top: 10px;
    border: 1px solid #86efac;
    line-height: 1.4;
  }

  .qual-prereq {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #fef9c3;
    color: #713f12;
    font-size: 11px;
    font-weight: 600;
    padding: 4px 8px;
    border-radius: 3px;
    margin-top: 8px;
    border: 1px solid #fde047;
    line-height: 1.4;
  }

  /* ── AGE CELL STYLES ── */
  .age-main {
    font-family: var(--mono);
    font-size: 14px;
    font-weight: 500;
    color: var(--navy);
    white-space: nowrap;
  }
  .age-ason {
    font-size: 10px;
    color: var(--ink-muted);
    margin-top: 2px;
    white-space: nowrap;
  }
  .age-relax-row {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
    color: var(--blue);
    margin-top: 2px;
    flex-wrap: wrap;
  }
  .age-relax-chip {
    background: var(--blue-bg);
    border: 1px solid #bfdbfe;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: var(--mono);
    font-size: 9px;
    font-weight: 600;
    white-space: nowrap;
  }

  /* ── SALARY CELL ── */
  .sal-level {
    font-family: var(--mono);
    font-size: 13px;
    font-weight: 500;
    color: var(--navy);
  }
  .sal-range {
    font-size: 12px;
    color: var(--ink-muted);
    margin-top: 2px;
    white-space: nowrap;
  }

  /* ── CAT VAC CHIP ── */
  .cat-vac-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 3px;
    min-width: 160px;
  }
  .cat-vac-chip {
    text-align: center;
    background: var(--paper-alt);
    border: 1px solid var(--border);
    border-radius: 2px;
    padding: 2px 0;
  }
  .cat-vac-chip-label {
    font-family: var(--mono);
    font-size: 8px;
    color: var(--ink-muted);
    display: block;
    letter-spacing: 0.04em;
  }
  .cat-vac-chip-val {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--navy);
    display: block;
  }

  /* ── ELIGIBILITY BADGES ── */
  .jd-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .jd-badge {
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    padding: 5px 13px;
    border: 1px solid var(--border);
    color: var(--ink-light);
    background: var(--paper-alt);
  }
  .jd-badge.on {
    background: var(--navy);
    color: #fff;
    border-color: var(--navy);
  }

  /* ── SELECTION STAGES ── */
  .jd-stages {
    display: flex;
    align-items: flex-start;
    overflow-x: auto;
    padding: 6px 0 12px;
  }
  .jd-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    min-width: 130px;
    text-align: center;
  }
  .jd-stage-num {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: var(--navy);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-family: var(--serif);
    font-size: 17px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .jd-stage-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--navy);
    max-width: 110px;
    line-height: 1.4;
  }
  .jd-stage-arrow {
    display: flex;
    align-items: center;
    padding-bottom: 30px;
    color: var(--ink-muted);
    flex-shrink: 0;
  }

  /* ── STEPS ── */
  .jd-steps { display: flex; flex-direction: column; }
  .jd-step {
    display: flex;
    gap: 14px;
    padding: 11px 0;
    border-bottom: 1px solid var(--border);
    align-items: flex-start;
  }
  .jd-step:last-child { border-bottom: none; }
  .jd-step-num {
    width: 26px; height: 26px;
    background: var(--navy);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    border-radius: 0px;
    font-size: 11px;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .jd-step-text { font-size: 14px; line-height: 1.6; color: var(--ink-light); }

  /* ── APPLY CTA ── */
  .jd-apply {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;
    margin: 36px 0 0;
    padding: 20px;
    border: 2px solid var(--navy);
    background: var(--navy);
    color: #fff;
    text-decoration: none;
    font-family: var(--serif);
    font-size: 18px;
    font-weight: 700;
    transition: background 0.15s, color 0.15s;
  }
  .jd-apply:hover { background: var(--paper); color: var(--navy); }

  .tbl-scroll { overflow-x: auto; }

  @media (max-width: 600px) {
    .jd { font-size: 11px; padding-top: 16px; }
    .jd-wrap { padding: 0 20px 120px; }
    .jd-masthead { padding: 12px 0 10px; border-bottom: 2px solid var(--border); }
    
    .jd-title { font-size: 20px; margin-bottom: 6px; font-weight: 800; line-height: 1.3; text-align: center; display: flex; align-items: flex-start; justify-content: center; gap: 6px; }
    .jd-header-back { display: flex; color: var(--navy); margin-top: 2px; flex-shrink: 0; }
    .jd-advert { font-size: 9px; margin-bottom: 8px; text-align: center; }
    .jd-eyebrow { margin-bottom: 4px; font-size: 8px; justify-content: center; text-align: center; }

    /* 2x2 Grid for Hero on Mobile */
    .jd-hero { 
      grid-template-columns: 1fr 1fr; 
      margin: 12px 0; 
      gap: 1px; 
      border-bottom: 3px solid var(--navy);
    }
    .jd-hero-cell { padding: 12px 8px; }
    .jd-hero-cell:last-child:nth-child(odd) { grid-column: span 2; }
    .jd-hero-label { font-size: 8px; margin-bottom: 3px; }
    .jd-hero-value { font-size: 20px !important; letter-spacing: -0.02em; }
    .jd-hero-sub { font-size: 10px; opacity: 0.8; }

    .jd-lede { font-size: 11px; margin: 12px 0; padding-left: 8px; line-height: 1.5; border-left-width: 3px; }
    
    .jd-section { margin: 24px 0 10px; padding-bottom: 4px; }
    .jd-section-title { font-size: 13px; letter-spacing: 0.05em; }
    
    /* Micro-Table Layout */
    .jd-table { font-size: 10px; table-layout: auto; }
    .jd-table th { padding: 4px 6px; font-size: 9px; }
    .jd-table td { padding: 5px 8px; font-size: 10.5px; line-height: 1.3; }
    .jd-table td.label { width: 90px; min-width: 90px; font-size: 9.5px; }
    
    .jd-apply { font-size: 15px; padding: 14px; margin-top: 20px; border-radius: 12px; }
    .qual-course-pill { font-size: 9px; padding: 0px 4px; }
    .qual-branch-line, .qual-extra { font-size: 8px; margin-top: 1px; }
    .cat-vac-grid { min-width: 60px; gap: 2px; }
  }
`;

// ── DATA FETCHING ─────────────────────────────────────────────────────────────
async function getJob(id: string): Promise<JobPost | null> {
  const cacheKey = `job:${id}`;
  try {
    // 1. Try Cache
    const cached = await getCachedData<any>(cacheKey);
    if (cached) return cached as unknown as JobPost;

    // 2. Try DB
    await dbConnect();
    const jobData = await Job.findOne({ id }).lean();
    if (jobData) {
      // 3. Save to Cache
      await setCachedData(cacheKey, jobData, 3600);
      return jobData as unknown as JobPost;
    }
  } catch (e) {
    console.error("Mongo/Cache Error:", e);
  }
  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) return { title: "Recruitment Not Found" };
  return {
    title: `${job.title} | Rojgar Match`,
    description: job.shortInfo || job.description,
  };
}

// ── CONSTANTS ─────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = {
  general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD",
};
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"] as const;

const RELAX_LABELS: Record<string, string> = {
  obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD",
  exServiceman: "Ex-SM", female: "Female",
};

const DATE_ROWS: { label: string; key: string; highlight?: boolean }[] = [
  { label: "Notification Released", key: "notificationRelease" },
  { label: "Application Start Date", key: "applicationStartDate" },
  { label: "Application Last Date", key: "applicationLastDate", highlight: true },
  { label: "Fee Payment Last Date", key: "feePaymentLastDate", highlight: true },
  { label: "Correction Window Last Date", key: "correctionWindowLastDate" },
  { label: "Admit Card Released", key: "admitCardDate" },
  { label: "Examination Date", key: "examDate", highlight: true },
  { label: "Result Announced", key: "resultDate" },
  { label: "Interview Date", key: "interviewDate" },
  { label: "DV Date", key: "documentVerificationDate" },
];

// ── HELPERS ───────────────────────────────────────────────────────────────────
function hasCategoryData(catObj: any): boolean {
  if (!catObj) return false;
  return Object.values(catObj).some((v) => v !== null && v !== undefined);
}

/** Derive a representative age limit from posts[] for the hero strip */
function deriveAgeLimitFromPosts(posts: any[]): { min: number | null; max: number | null; asOnDate: string | null } {
  for (const p of posts) {
    if (p.ageLimit?.max) return { min: p.ageLimit.min ?? null, max: p.ageLimit.max, asOnDate: p.ageLimit.asOnDate ?? null };
  }
  return { min: null, max: null, asOnDate: null };
}

/** Derive a representative salary from posts[] for the hero strip */
function deriveSalaryFromPosts(posts: any[]): { payLevel: number | null; min: number | null; max: number | null } {
  for (const p of posts) {
    if (p.salary?.payLevel || p.salary?.min || p.salary?.max) {
      return { payLevel: p.salary.payLevel ?? null, min: p.salary.min ?? null, max: p.salary.max ?? null };
    }
  }
  return { payLevel: null, min: null, max: null };
}

// ── QUALIFICATION CELL ────────────────────────────────────────────────────────
/**
 * Renders the rich qualification object from the new schema:
 *   { course: string[], branch: string[], extraQualificationText: string }
 * Also handles legacy string / array-of-objects formats gracefully.
 */
function QualCell({ post, rowSpan }: { post: any; rowSpan?: number }) {
  const q = post.qualification;

  // ── NEW SCHEMA: { courses: { name, branches }[], extraQualificationText } ──
  if (q && !Array.isArray(q) && (q.courses !== undefined || q.course !== undefined)) {
    const courses: any[] = q.courses 
      ? (Array.isArray(q.courses) ? q.courses : [q.courses])
      : (Array.isArray(q.course) ? q.course.map((c: any) => ({ name: c, branches: Array.isArray(q.branch) ? q.branch : [] })) : [{ name: q.course, branches: Array.isArray(q.branch) ? q.branch : [] }]);

    const extra: string = q.extraQualificationText?.trim() || "";

    return (
      <td className="qual-cell" rowSpan={rowSpan}>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {courses.map((course, i) => {
            const name = typeof course === 'string' ? course : course.name;
            const branches = Array.isArray(course.branches) ? course.branches : [];
            
            return (
              <div key={i} className="qual-course-block">
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "14.5px" }}>{name}</div>
                {branches.length > 0 && (
                  <div className="qual-branch-line" style={{ marginTop: '2px' }}>
                    <span className="qual-branch-label" style={{ fontSize: '10px', color: 'var(--ink-muted)' }}>Required Stream: </span>
                    <span style={{ fontSize: '13px', color: 'var(--ink-light)' }}>{branches.join(", ")}</span>
                  </div>
                )}
                {i < courses.length - 1 && (
                  <div className="qual-or-sep" style={{ marginTop: '10px' }}>
                    <div className="qual-or-sep-line"></div>
                    <div className="qual-or-sep-badge">OR</div>
                    <div className="qual-or-sep-line"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {extra && (
          <div className="qual-extra">
            <strong style={{ fontWeight: 600, color: "var(--amber)" }}>Note: </strong>
            {extra}
          </div>
        )}

        {post.prerequisite?.length > 0 && (
          <div className="qual-prereq">⚠ {post.prerequisite.join("; ")}</div>
        )}
        {post.appearingEligible && (
          <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--ink-light)", lineHeight: "1.4" }}>
            <span style={{ fontWeight: 600, color: "var(--green)" }}>Appearing eligible</span>
            {post.appearingConditions ? ` — ${post.appearingConditions}` : ""}
          </div>
        )}
      </td>
    );
  }

  const qualArr: any[] = Array.isArray(q) ? q : q ? [q] : [];

  if (qualArr.length === 0) {
    return <td className="qual-cell" rowSpan={rowSpan} style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>Not specified</td>;
  }

  return (
    <td className="qual-cell" rowSpan={rowSpan}>
      {qualArr.map((item, i) => {
        const name = item.name || item.qualification || "Degree";
        const branches: string[] = (item.branches || item.branch || []).filter(
          (b: string) => b && b.toLowerCase() !== "any"
        );
        const extras: string[] = [];
        if (item.streamRequired) extras.push(`Stream: ${item.streamRequired}`);
        if (item.minMarksPercent) extras.push(`Min. ${item.minMarksPercent}% marks`);
        if (item.minExperienceYears) extras.push(`${item.minExperienceYears} yr exp.`);
        if (item.extraQualificationText?.trim()) extras.push(item.extraQualificationText.trim());

        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div style={{ margin: "4px 0", fontSize: "12px", color: "var(--ink-muted)", fontStyle: "italic" }}>
                — OR —
              </div>
            )}
            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "14.5px" }}>{name}</span>
            {branches.length > 0 && (
              <div className="qual-branch-line">
                <span className="qual-branch-label">Branch: </span>
                {branches.join(", ")}
              </div>
            )}
            {extras.length > 0 && (
              <div className="qual-extra">
                <strong style={{ fontWeight: 600, color: "var(--amber)" }}>Note: </strong>
                {extras.join(" · ")}
              </div>
            )}
          </React.Fragment>
        );
      })}

      {post.prerequisite?.length > 0 && (
        <div className="qual-prereq">⚠ {post.prerequisite.join("; ")}</div>
      )}
      {post.appearingEligible && (
        <div style={{ marginTop: "8px", fontSize: "13px", color: "var(--ink-light)", lineHeight: "1.4" }}>
          <span style={{ fontWeight: 600, color: "var(--green)" }}>Appearing eligible</span>
          {post.appearingConditions ? ` — ${post.appearingConditions}` : ""}
        </div>
      )}
    </td>
  );
}

// ── AGE CELL ─────────────────────────────────────────────────────────────────
function AgeCell({ post, job }: { post: any; job: any }) {
  // Deep fallback: Mongoose might return an empty object {} for omitted subdocuments
  const pAL = post?.ageLimit || {};
  const jAL = job?.ageLimit || {};

  const min = pAL.min ?? jAL.min;
  const max = pAL.max ?? jAL.max;
  const asOn = pAL.asOnDate ?? jAL.asOnDate;

  if (!min && !max) return <td className="jd-table center mono" style={{ color: "var(--ink-muted)", border: "1px solid var(--border)" }}>—</td>;

  const rawRelax = (pAL.relaxation && Object.keys(pAL.relaxation).length > 0) ? pAL.relaxation : jAL.relaxation;
  const relaxEntries = rawRelax
    ? Object.entries(rawRelax).filter(([, v]) => v != null && v !== 0 && !isNaN(Number(v))) as [string, number][]
    : [];

  return (
    <td className="center" style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)" }}>
      <div className="age-main" style={{ fontWeight: 500, color: "var(--ink)", fontSize: "15px", lineHeight: "1.2" }}>
        {min && max ? `${min}–${max}` : max ? `≤ ${max}` : `≥ ${min}`}
      </div>
      {asOn && (
        <div className="age-ason" style={{ fontSize: "10px", color: "var(--ink-muted)", marginTop: "2px", fontWeight: 500 }}>
          as on {fmtDate(asOn)}
        </div>
      )}
      {relaxEntries.length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
          {relaxEntries.map(([cat, val], idx) => (
            <span key={cat} style={{ fontSize: "11px", color: "var(--ink-light)", fontWeight: 500, whiteSpace: "nowrap" }}>
              {RELAX_LABELS[cat] || cat.toUpperCase()}: {max ? Number(max) + Number(val) : `+${val}`}
              {idx < relaxEntries.length - 1 ? <span style={{ color: "var(--border)", marginLeft: "6px", fontWeight: 400 }}>|</span> : ""}
            </span>
          ))}
        </div>
      )}
    </td>
  );
}

// ── SALARY CELL ───────────────────────────────────────────────────────────────
function SalaryCell({ post, job }: { post: any; job: any }) {
  // Deep fallback
  const pSal = post?.salary || {};
  const jSal = job?.salary || {};

  const payLevel = pSal.payLevel ?? jSal.payLevel;
  const min = pSal.min ?? jSal.min;
  const max = pSal.max ?? jSal.max;

  if (!payLevel && !min && !max) {
    return <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>—</td>;
  }
  return (
    <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      {payLevel != null && <div className="sal-level" style={{ fontWeight: 500, color: "var(--ink)", fontSize: "14px" }}>Level {payLevel}</div>}
      {(min || max) ? (
        <div className="sal-range" style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px" }}>
          {min ? fmtMoney(min) : ""}
          {min && max ? " – " : ""}
          {max ? fmtMoney(max) : ""}
        </div>
      ) : null}
    </td>
  );
}

// ── CATEGORY VAC CELL ─────────────────────────────────────────────────────────
function CatVacCell({ post, job }: { post: any; job: any }) {
  const catVac = post.categoryWiseVacancy || job.categoryWiseVacancy;
  const hasData = hasCategoryData(catVac);
  if (!hasData) {
    return (
      <td className="center mono" style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)", fontSize: 15 }}>
        —
      </td>
    );
  }
  return (
    <td style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      <div className="cat-vac-grid">
        {catCols.map((c) => (
          <div key={c} className="cat-vac-chip">
            <span className="cat-vac-chip-label">{CAT_LABELS[c]}</span>
            <span className="cat-vac-chip-val">
              {catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"}
            </span>
          </div>
        ))}
      </div>
    </td>
  );
}

// ── PAGE COMPONENT ─────────────────────────────────────────────────────────────
export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const af = job.applicationFee || { paymentMode: [] };
  const dates = job.importantDates || {};

  // Normalise posts array
  const rawPosts: any[] =
    (job.posts || []).length > 0
      ? job.posts
      : (job.qualification as any)
        ? [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }]
        : [];

  // Hero: derive age + salary from posts (new schema — per-post only)
  const heroAge = deriveAgeLimitFromPosts(rawPosts);
  const heroSal = deriveSalaryFromPosts(rawPosts);

  // Check if any post has category-wise vacancy data
  const anyPostHasCatVac = rawPosts.some((p) => hasCategoryData(p.categoryWiseVacancy));

  // Check if all posts share identical salary (to decide whether to show salary column)
  const salaryValues = rawPosts.map((p) => `${p.salary?.payLevel}|${p.salary?.min}|${p.salary?.max}`);
  const allSameSalary = salaryValues.every((v) => v === salaryValues[0]);
  const anySalary = rawPosts.some((p) => p.salary?.payLevel || p.salary?.min || p.salary?.max);

  // Fee grouping: amount → categories
  const feeMap: Record<string, string[]> = {};
  const FEE_CAT_LABELS: Record<string, string> = {
    general: "General", ews: "EWS", obc: "OBC", sc: "SC", st: "ST",
    pwd: "PwBD", female: "Female", exServiceman: "Ex-Serviceman",
  };
  Object.entries(af).forEach(([cat, val]) => {
    if (cat === "paymentMode" || val === null || val === undefined) return;
    const k = String(val);
    if (!feeMap[k]) feeMap[k] = [];
    feeMap[k].push(FEE_CAT_LABELS[cat] || cat);
  });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="jd">
        <div className="jd-wrap">
          <div className="hidden md:block mt-6 mb-4 md:mb-8">
            <BackButton className="gap-2 text-sm font-semibold text-navy/40 hover:text-navy transition-colors">
              <IconBack /> Back
            </BackButton>
          </div>

          {/* ── MASTHEAD ── */}
          <header className="jd-masthead">
            <div className="jd-eyebrow">Official Recruitment Notice</div>
            <h1 className="jd-title">
              <BackButton className="jd-header-back">
                <IconBack />
              </BackButton>
              <span>{job.title}</span>
            </h1>
            {job.advertisementNumber && (
              <div className="jd-advert">Advt. No. {job.advertisementNumber}</div>
            )}
            {job.tags?.length > 0 && (
              <div className="jd-tags">
                {job.tags.slice(0, 8).map((t: string) => (
                  <span key={t} className="jd-tag">{t}</span>
                ))}
              </div>
            )}
          </header>

          {/* ── HERO STRIP ── */}
          <div className="jd-hero">
            <div className="jd-hero-cell accent">
              <div className="jd-hero-label">Total Vacancies</div>
              <div className="jd-hero-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div>
              <div className="jd-hero-sub">{rawPosts.length} post{rawPosts.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="jd-hero-cell">
              <div className="jd-hero-label">Application Start Date</div>
              <div className="jd-hero-value" style={{ fontSize: 19 }}>
                {dates.applicationStartDate ? fmtDate(dates.applicationStartDate) : "—"}
              </div>
              <div className="jd-hero-sub">Application opens</div>
            </div>
            <div className="jd-hero-cell">
              <div className="jd-hero-label">Application Last Date</div>
              <div className="jd-hero-value" style={{ fontSize: 19, color: '#D93025', fontWeight: 'bold' }}>
                {dates.applicationLastDate ? fmtDate(dates.applicationLastDate) : "—"}
              </div>
              <div className="jd-hero-sub">Application deadline</div>
            </div>
          </div>

          {/* ── LEDE ── */}
          {(job.description || job.shortInfo) && (
            <div className="jd-lede">{job.description || job.shortInfo}</div>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              RECRUITMENT OVERVIEW
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconBriefcase /></span>
            <span className="jd-section-title">Recruitment Overview</span>
          </div>
          <table className="jd-table">
            <tbody>
              <tr><td className="label">Organisation</td><td>{job.organization || "—"}</td></tr>
              {job.department && <tr><td className="label">Department</td><td>{job.department}</td></tr>}
              <tr><td className="label">Govt. Type</td><td>{job.type || "—"}</td></tr>
              <tr><td className="label">Job Location</td><td>{job.location?.join(", ") || "All India"}</td></tr>
              {dates.notificationType && (
                <tr><td className="label">Notification Type</td><td>{dates.notificationType}</td></tr>
              )}
              {/* Salary shown in overview only if all posts share the same salary */}
              {allSameSalary && heroSal.payLevel && (
                <tr><td className="label">Pay Level</td><td>Level {heroSal.payLevel}</td></tr>
              )}
              {allSameSalary && (heroSal.min || heroSal.max) && (
                <tr>
                  <td className="label">Salary</td>
                  <td style={{ fontWeight: 500 }}>
                    {heroSal.min ? fmtMoney(heroSal.min) : ""}
                    {heroSal.min && heroSal.max ? " – " : ""}
                    {heroSal.max ? fmtMoney(heroSal.max) : ""}
                    {" INR"}
                  </td>
                </tr>
              )}
              {/* Eligibility flags */}
              {job.categoryEligibility?.length > 0 && (
                <tr>
                  <td className="label">Category Eligibility</td>
                  <td>{job.categoryEligibility.join(", ")}</td>
                </tr>
              )}
              {job.pwdEligible && <tr><td className="label">PwBD Eligible</td><td style={{ color: "var(--green)", fontWeight: 600 }}>Yes</td></tr>}
              {job.femaleOnly && <tr><td className="label">Female Only</td><td style={{ color: "var(--crimson)", fontWeight: 600 }}>Yes</td></tr>}
              {job.exServicemanQuota && <tr><td className="label">Ex-Serviceman Quota</td><td style={{ fontWeight: 600 }}>Yes</td></tr>}
              {dates.officialWebsite && (
                <tr>
                  <td className="label">Official Website</td>
                  <td>
                    <a href={dates.officialWebsite} target="_blank" rel="noreferrer"
                      style={{ color: "#1e40af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                      {dates.officialWebsite} <IconExternalLink />
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* ══════════════════════════════════════════════════════════════════
              APPLICATION FEE
          ══════════════════════════════════════════════════════════════════ */}
          {Object.keys(feeMap).length > 0 && (
            <>
              <div className="jd-section">
                <span className="jd-section-icon"><IconCreditCard /></span>
                <span className="jd-section-title">Application Fee</span>
              </div>
              <table className="jd-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Fee Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(feeMap).map(([fee, cats]) => (
                    <tr key={fee}>
                      <td>{cats.join(", ")}</td>
                      <td className={Number(fee) === 0 ? "green bold" : "red bold"}>
                        {Number(fee) === 0 ? "Exempt — ₹0" : `₹${Number(fee).toLocaleString("en-IN")}`}
                      </td>
                    </tr>
                  ))}
                  {af.paymentMode?.length > 0 && (
                    <tr>
                      <td className="label">Payment Modes</td>
                      <td style={{ fontSize: 13 }}>{af.paymentMode.join(", ")}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════════
              POST-WISE VACANCY TABLE
              Columns: Post | Vacancies | Category-wise | Age | Salary | Qualification
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconUsers /></span>
            <span className="jd-section-title">Post-wise Vacancy & Eligibility</span>
          </div>

          <div className="tbl-scroll">
            <table className="jd-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Post / Designation</th>
                  <th className="center" style={{ width: 80 }}>Total</th>
                  <th className="center" style={{ minWidth: 170 }}>Category Vacancy</th>
                  <th className="center" style={{ minWidth: 130 }}>Age Limit (incl. Relaxation)</th>
                  <th className="center" style={{ minWidth: 120 }}>Salary / Pay Level</th>
                  <th style={{ minWidth: 280 }}>Qualification & Requirements</th>
                </tr>
              </thead>
              <tbody>
                {rawPosts.map((p: any, idx: number) => (
                  <tr key={idx}>
                    {/* Post name */}
                    <td style={{ verticalAlign: "top", fontWeight: 600, fontSize: 14, paddingTop: 12 }}>
                      {p.name}
                    </td>

                    {/* Total vacancy */}
                    <td className="center bold mono"
                      style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)", fontSize: 15, whiteSpace: "nowrap" }}>
                      {p.totalVacancy != null ? p.totalVacancy.toLocaleString("en-IN") : "—"}
                    </td>

                    {/* Category-wise vacancies — compact chip grid */}
                    <CatVacCell post={p} job={job} />

                    {/* Age limit + relaxation chips */}
                    <AgeCell post={p} job={job} />

                    {/* Salary (always shown) */}
                    <SalaryCell post={p} job={job} />

                    {/* Qualification — rich display */}
                    <QualCell post={p} />
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="tr-total">
                  <td>Total (All Posts)</td>
                  <td className="center mono" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                    {job.totalVacancy?.toLocaleString("en-IN") ?? "—"}
                  </td>
                  <td />
                  <td />
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              RECRUITMENT PROCEDURES (Selection & Application)
          ══════════════════════════════════════════════════════════════════ */}
          {(() => {
            const getSteps = (primary: any, secondary?: any, tertiary?: any) => {
              const val = primary || secondary || tertiary;
              if (!val) return [];
              if (Array.isArray(val)) return val;
              if (typeof val === 'string') return val.split(/\n|,|;/).map(s => s.trim()).filter(Boolean);
              return [];
            };

            const selSteps = getSteps(job.selectionProcess, (job as any).selection_process, (job as any).selectionStages);
            const appSteps = getSteps(job.applicationProcess, (job as any).application_process, (job as any).howToApply);

            return (
              <>
                {selSteps.length > 0 && (
                  <>
                    <div className="jd-section">
                      <span className="jd-section-icon"><IconBriefcase /></span>
                      <span className="jd-section-title">Selection Process</span>
                    </div>
                    <div className="jd-stages">
                      {selSteps.map((stage: string, idx: number) => (
                        <React.Fragment key={idx}>
                          <div className="jd-stage">
                            <div className="jd-stage-num">{idx + 1}</div>
                            <div className="jd-stage-label">{stage}</div>
                          </div>
                          {idx < selSteps.length - 1 && (
                            <div className="jd-stage-arrow"><IconArrow /></div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}

                {appSteps.length > 0 && (
                  <>
                    <div className="jd-section">
                      <span className="jd-section-icon"><IconInfo /></span>
                      <span className="jd-section-title">How to Apply</span>
                    </div>
                    <div className="jd-steps">
                      {appSteps.map((step: string, idx: number) => (
                        <div key={idx} className="jd-step">
                          <div className="jd-step-num">{idx + 1}</div>
                          <p className="jd-step-text">{step}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}

          {/* ══════════════════════════════════════════════════════════════════
              IMPORTANT DATES
          ══════════════════════════════════════════════════════════════════ */}
          <div className="jd-section">
            <span className="jd-section-icon"><IconCalendar /></span>
            <span className="jd-section-title">Important Dates</span>
          </div>
          <table className="jd-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const standardKeys = [
                  "notificationRelease", "applicationStartDate", "applicationLastDate", 
                  "feePaymentLastDate", "correctionWindowLastDate", "admitCardDate", 
                  "examDate", "resultDate", "interviewDate", "documentVerificationDate",
                  "notificationType", "officialWebsite", "applyOnline", "applyLink", 
                  "notificationPdfLink", "checkResult"
                ];

                const tableRows: { label: string; key: string; val: any; highlight?: boolean }[] = [];

                // 1. Standard keys (if present)
                const standardDefs = [
                  { label: "Notification Released", key: "notificationRelease" },
                  { label: "Application Start Date", key: "applicationStartDate" },
                  { label: "Application Last Date", key: "applicationLastDate", highlight: true },
                  { label: "Fee Payment Last Date", key: "feePaymentLastDate", highlight: true },
                  { label: "Correction Window Last Date", key: "correctionWindowLastDate" },
                  { label: "Admit Card Released", key: "admitCardDate" },
                  { label: "Examination Date", key: "examDate", highlight: true },
                  { label: "Result Announced", key: "resultDate" },
                  { label: "Interview Date", key: "interviewDate" },
                  { label: "DV Date", key: "documentVerificationDate" },
                  { label: "Notification Type", key: "notificationType" },
                  { label: "Official Website", key: "officialWebsite" },
                  { label: "Apply Online", key: "applyOnline" },
                  { label: "Apply Link", key: "applyLink" },
                  { label: "Notification Pdf Link", key: "notificationPdfLink" },
                  { label: "Check Result", key: "checkResult" },
                ];

                standardDefs.forEach(def => {
                  const val = (dates as any)[def.key];
                  if (val !== undefined && val !== null) {
                    tableRows.push({ ...def, val });
                  }
                });

                // 2. Extra keys (Dates and Links)
                const excludeKeys = [...standardKeys, "customDates", "_id"];
                Object.keys(dates).forEach(key => {
                  if (!excludeKeys.includes(key)) {
                    const prettify = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
                    tableRows.push({ label: prettify(key), key, val: (dates as any)[key] });
                  }
                });

                return (
                  <>
                    {tableRows.map((row) => (
                      <tr key={row.key} className={row.highlight ? "tr-highlight" : ""}>
                        <td className="label">{row.label}</td>
                        <td className="mono bold">
                          {(() => {
                            const val = typeof row.val === 'string' ? row.val.trim() : row.val;
                            if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.'))) {
                              const href = val.startsWith('www.') ? `https://${val}` : val;
                              return (
                                <a href={href} target="_blank" rel="noreferrer"
                                  style={{ color: "#2563eb", textDecoration: "underline", fontSize: "13px", wordBreak: "break-all", fontWeight: 600 }}>
                                  {val}
                                </a>
                              );
                            }
                            // Date check: format if it looks like a date, otherwise show as is
                            const d = new Date(val);
                            if (val && !isNaN(d.getTime())) {
                              return fmtDate(val);
                            }
                            return val || "—";
                          })()}
                        </td>
                      </tr>
                    ))}
                    {/* 3. Custom Milestones */}
                    {((dates as any).customDates || []).map((cd: any, idx: number) => (
                      <tr key={`custom-${idx}`}>
                        <td className="label">{cd.label}</td>
                        <td className="mono bold">{cd.date ? fmtDate(cd.date) : "—"}</td>
                      </tr>
                    ))}
                  </>
                );
              })()}
            </tbody>
          </table>

          {/* ── APPLY CTA ── */}
          {dates.applyLink && (
            <a href={dates.applyLink} target="_blank" rel="noreferrer" className="jd-apply">
              Apply Now at {dates.officialWebsite || "Official Portal"} <IconExternalLink />
            </a>
          )}

        </div>
      </div>
    </>
  );
}