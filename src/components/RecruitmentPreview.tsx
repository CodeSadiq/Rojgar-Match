'use client';

import React from "react";
import { fmtDate, fmtMoney } from "@/lib/helpers";

// ── ICONS ────────────────────────────────────────────────────────────────────
const IconInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconUsers = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const IconBriefcase = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
const IconShield = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
const IconCreditCard = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
const IconExternalLink = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
const IconCheckGreen = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
const IconArrow = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = { general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD" };
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"] as const;
const RELAX_LABELS: Record<string, string> = { obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD", exServiceman: "Ex-SM", female: "Female" };

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Source+Sans+3:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap');

  .jd {
    --serif:  'Source Sans 3', system-ui, sans-serif;
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
    line-height: 1.6;
    color: var(--ink);
    background: var(--paper);
    -webkit-font-smoothing: antialiased;
  }

  .jd * { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── LAYOUT ── */
  .jd-wrap {
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px 20px 80px;
    background: #fff;
    border-radius: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
    margin-top: 20px;
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
  .jd-hero {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin: 28px 0;
    gap: 16px;
  }
  .jd-hero-cell {
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: transform 0.2s ease;
  }
  .jd-hero-cell:hover {
    transform: translateY(-2px);
  }
  .jd-hero-cell.accent {
    background: linear-gradient(135deg, var(--navy) 0%, #1e293b 100%);
    border: none;
    color: #ffffff;
  }
  .jd-hero-cell.accent:hover {
    /* Hover scale/translation without shadows */
  }
  .jd-hero-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 10px;
    background: rgba(30, 58, 95, 0.05);
    color: var(--navy);
    flex-shrink: 0;
  }
  .jd-hero-icon svg {
    width: 20px;
    height: 20px;
  }
  .jd-hero-cell.accent .jd-hero-icon {
    background: rgba(255, 255, 255, 0.15);
    color: #ffffff;
  }
  .jd-hero-cell.highlight-red .jd-hero-icon {
    background: rgba(220, 38, 38, 0.05);
    color: #dc2626;
  }
  .jd-hero-content {
    display: flex;
    flex-direction: column;
    text-align: left;
  }
  .jd-hero-label {
    font-family: var(--mono);
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-muted);
    margin-bottom: 4px;
  }
  .jd-hero-cell.accent .jd-hero-label { color: rgba(255,255,255,0.55); }
  .jd-hero-value {
    font-family: var(--serif);
    font-size: 24px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.2;
  }
  .jd-hero-cell.accent .jd-hero-value { color: #fff; }
  .jd-hero-cell.highlight-red .jd-hero-value { color: #dc2626; }
  .jd-hero-sub { font-size: 12px; color: var(--ink-muted); margin-top: 3px; }
  .jd-hero-cell.accent .jd-hero-sub { color: rgba(255,255,255,0.5); }

  /* ── LEDE ── */
  .jd-lede {
    font-size: 17px;
    color: var(--ink-light);
    font-weight: 500;
    font-style: italic;
    line-height: 1.7;
    margin: 24px 0;
  }

  /* ── SECTION HEADER ── */
  .jd-section {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 72px 0 10px;
    padding: 12px 20px;
    background: var(--navy);
    border-radius: 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .jd-section-icon {
    color: #ffffff !important;
    display: flex;
    align-items: center;
  }
  .jd-section-icon svg {
    width: 18px;
    height: 18px;
  }
  .jd-section-title {
    font-family: var(--sans);
    font-size: 16px;
    font-weight: 600;
    color: #ffffff !important;
    letter-spacing: 0.02em;
  }

  /* ── SELECTION STAGES ── */
  .jd-stages {
    display: flex;
    align-items: stretch;
    gap: 12px;
    overflow-x: auto;
    padding: 12px 4px 20px;
    margin: 16px 0;
  }
  .jd-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 14px;
    padding: 24px 20px;
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: 12px;
    flex: 1;
    min-width: 240px;
    position: relative;
    transition: all 0.2s ease;
  }
  .jd-stage:hover {
    border-color: var(--navy);
    background: #fafafa;
  }
  .jd-stage-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: var(--blue-bg);
    color: var(--navy);
    border: 1px solid #bfdbfe;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .jd-stage-content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .jd-stage-title {
    font-family: var(--sans);
    font-size: 15px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.4;
  }
  .jd-stage-desc {
    font-size: 12.5px;
    color: var(--ink-muted);
    line-height: 1.5;
  }
  .jd-stage-arrow {
    display: flex;
    align-items: center;
    color: #cbd5e1;
    align-self: center;
    flex-shrink: 0;
  }
  .jd-stage-arrow svg {
    width: 16px;
    height: 16px;
    stroke-width: 3;
  }

  /* ── TABLES ── */
  .jd-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 16px;
    border: 1px solid var(--border);
  }
  .jd-table th {
    background: #f1f5f9;
    color: var(--navy);
    font-family: var(--sans);
    font-size: 12.5px;
    font-weight: 700;
    text-align: left;
    padding: 10px 12px;
    border: 1px solid #cbd5e1;
    white-space: nowrap;
  }
  .jd-table td {
    padding: 10px 14px;
    border: 1px solid var(--border);
    font-size: 16px;
  }
  .jd-table .label {
    font-weight: 600;
    color: var(--ink-light);
    white-space: nowrap;
    width: 220px;
    font-size: 14px;
  }
  .jd-table .center { text-align: center; }
  .jd-table .mono { font-family: var(--mono); font-size: 13px; }
  .jd-table .bold { font-weight: 700; color: var(--navy); }
  .jd-table tr.tr-total td { background: #dce6f0 !important; font-weight: 700; color: var(--navy); border-top: 2px solid var(--navy); }
  .jd-table tr.tr-highlight td { background: var(--gold-bg) !important; }

  .tbl-scroll { overflow-x: auto; margin-bottom: 24px; }

  /* Custom thin scrollbar */
  .jd-stages::-webkit-scrollbar,
  .tbl-scroll::-webkit-scrollbar {
    height: 6px;
    width: 6px;
  }
  .jd-stages::-webkit-scrollbar-track,
  .tbl-scroll::-webkit-scrollbar-track {
    background: transparent;
  }
  .jd-stages::-webkit-scrollbar-thumb,
  .tbl-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 10px;
  }
  .jd-stages::-webkit-scrollbar-thumb:hover,
  .tbl-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  .jd-stages,
  .tbl-scroll {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 transparent;
  }

  /* ── QUAL CELL STYLES ── */
  .qual-cell { padding: 10px 14px; border: 1px solid var(--border); vertical-align: top; background: #fff; min-width: 280px; }
  .qual-course-pill { display: inline-block; font-family: var(--sans); font-size: 13px; font-weight: 700; color: var(--navy); background: rgba(30,58,95,0.07); border: 1px solid rgba(30,58,95,0.15); padding: 3px 9px; border-radius: 3px; margin-bottom: 4px; }
  .qual-branch-line { font-size: 13px; color: var(--ink-light); margin: 5px 0 0 2px; line-height: 1.5; }
  .qual-branch-label { font-weight: 600; color: var(--ink); font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 4px; }
  .qual-extra { font-size: 12px; color: var(--amber); background: var(--amber-bg); border-left: 3px solid #d97706; padding: 6px 10px; margin-top: 8px; line-height: 1.5; }
  .qual-or-sep { display: flex; align-items: center; gap: 8px; margin: 10px 0; }
  .qual-or-sep-line { flex: 1; height: 1px; background: var(--border); }
  .qual-or-sep-badge { font-family: var(--mono); font-size: 10px; font-weight: 700; color: var(--ink-muted); background: var(--paper-alt); border: 1px solid var(--border); padding: 2px 7px; border-radius: 4px; letter-spacing: 0.1em; }
  .qual-appearing { display: inline-flex; align-items: center; gap: 5px; background: var(--green-light); color: var(--green); font-weight: 600; padding: 5px 9px; border-radius: 3px; font-size: 12px; margin-top: 10px; border: 1px solid #86efac; line-height: 1.4; }
  .qual-prereq { display: inline-flex; align-items: center; gap: 5px; background: #fef9c3; color: #713f12; font-size: 11px; font-weight: 600; padding: 4px 8px; border-radius: 3px; margin-top: 8px; border: 1px solid #fde047; line-height: 1.4; }

  /* ── AGE CELL STYLES ── */
  .age-main { font-family: var(--sans); font-size: 14px; font-weight: 500; color: var(--navy); white-space: nowrap; }
  .age-ason { font-size: 10px; color: var(--ink-muted); margin-top: 2px; white-space: nowrap; }
  .age-relax-row { display: flex; align-items: center; gap: 4px; font-size: 10px; color: var(--blue); margin-top: 2px; flex-wrap: wrap; }

  /* ── SALARY CELL ── */
  .sal-level { font-family: var(--mono); font-size: 13px; font-weight: 700; color: var(--navy); }
  .sal-range { font-size: 12px; color: var(--ink-muted); margin-top: 2px; white-space: nowrap; }

  /* ── CAT VAC CHIP ── */
  .cat-vac-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; min-width: 160px; }
  .cat-vac-chip { text-align: center; background: var(--paper-alt); border: 1px solid var(--border); border-radius: 2px; padding: 2px 0; }
  .cat-vac-chip-label { font-family: var(--mono); font-size: 8px; color: var(--ink-muted); display: block; letter-spacing: 0.04em; }
  .cat-vac-chip-val { font-family: var(--mono); font-size: 12px; font-weight: 700; color: var(--navy); display: block; }

  /* ── EDITING ── */
  .jd-edit-field {
    background: rgba(59, 130, 246, 0.05);
    border-bottom: 1px dashed var(--blue);
    width: 100%;
    outline: none;
    padding: 2px;
  }

  @media (max-width: 600px) {
    /* Clean 3-Column Stats Bar for Hero on Mobile */
    .jd-hero { 
      grid-template-columns: repeat(3, 1fr); 
      margin: 16px 0; 
      gap: 0; 
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 10px 4px;
    }
    .jd-hero-cell {
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 4px;
      padding: 4px 6px;
      background: transparent !important;
      border: none !important;
    }
    .jd-hero-cell:not(:last-child) {
      border-right: 1px solid var(--border) !important;
      border-radius: 0 !important;
    }
    .jd-hero-cell.accent {
      grid-column: auto;
    }
    .jd-hero-icon {
      display: none !important;
    }
    .jd-hero-label { 
      font-size: 8px; 
      font-weight: 600; 
      margin-bottom: 0; 
      text-align: center;
      color: var(--ink-muted);
    }
    .jd-hero-cell.accent .jd-hero-label {
      color: var(--ink-muted) !important;
    }

    .jd-hero-value { 
      font-size: 12px !important; 
      line-height: 1.2; 
      text-align: center;
      color: var(--navy);
    }
    .jd-hero-cell.accent .jd-hero-value {
      color: var(--navy) !important;
    }
    .jd-hero-cell.highlight-red .jd-hero-value {
      color: #dc2626 !important;
    }

    /* Clean, Visible Table Styling for Mobile */
    .jd-table { 
      font-size: 13px !important; 
      table-layout: auto !important; 
      border-radius: 8px !important;
      overflow: hidden !important;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02) !important;
      border: 1px solid #cbd5e1 !important;
    }
    .jd-table th { 
      padding: 8px 10px !important; 
      font-size: 11.5px !important; 
      border: 1px solid #cbd5e1 !important;
      background: #f1f5f9 !important;
      color: var(--navy) !important;
    }
    .jd-table td { 
      padding: 8px 12px !important; 
      font-size: 13px !important; 
      line-height: 1.4 !important; 
      border: 1px solid #e2e8f0 !important;
    }
    .jd-table td.label, .jd-table .label { 
      width: 120px !important; 
      min-width: 120px !important; 
      font-size: 12px !important; 
      font-weight: 600 !important;
      color: var(--navy) !important; 
    }
    .jd-timeline-table td.label {
      white-space: normal !important;
      width: auto !important;
      min-width: 0 !important;
    }
    .jd-timeline-table td:not(.label) {
      white-space: nowrap !important;
    }
    .jd-section { margin: 54px 0 8px; padding: 10px 16px; border-radius: 6px; }
    .jd-section-title { font-size: 15px; color: #ffffff !important; }
    .jd-section-icon svg { width: 15px; height: 15px; }

    /* Unify mobile stages layout (stack vertically) */
    .jd-stages {
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 8px !important;
      overflow-x: visible !important;
      padding: 4px 0 !important;
    }
    .jd-stage {
      min-width: 0 !important;
      flex-direction: row !important;
      text-align: left !important;
      align-items: center !important;
      padding: 16px !important;
      gap: 16px !important;
      border-radius: 8px !important;
    }
    .jd-stage-arrow {
      transform: rotate(90deg) !important;
      margin: 4px auto !important;
    }
    .jd-stage-content {
      text-align: left !important;
    }
  }
`;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function hasCategoryData(cv: any): boolean {
  if (!cv) return false;
  return Object.values(cv).some(v => v != null);
}

// ── QUALIFICATION CELL ────────────────────────────────────────────────────────
function QualCell({ post, editable, onUpdate, postIndex, isGeneral }: any) {
  const q = post.qualification;
  const onFocusPath = React.useContext(EditableFocusContext);

  // ── NEW SCHEMA: { courses: { name, branches }[], extraQualificationText } ──
  if (q && !Array.isArray(q) && (q.courses !== undefined || q.course !== undefined)) {
    const courses: any[] = q.courses
      ? (Array.isArray(q.courses) ? q.courses : [q.courses])
      : (Array.isArray(q.course) ? q.course.map((c: any) => ({ name: c, branches: Array.isArray(q.branch) ? q.branch : [] })) : [{ name: q.course, branches: Array.isArray(q.branch) ? q.branch : [] }]);

    const extra: string = q.extraQualificationText?.trim() || "";

    return (
      <td className="qual-cell">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {courses.map((course, i) => {
            const name = typeof course === 'string' ? course : course.name;
            const branches = Array.isArray(course.branches) ? course.branches : [];

            return (
              <div key={i} className="qual-course-block">
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "12px" }}>
                  <Editable editable={editable} value={name} path={isGeneral ? `qualification.courses.${i}.name` : `posts.${postIndex}.qualification.courses.${i}.name`} onUpdate={onUpdate} />
                </div>
                {branches.length > 0 && (
                  <div className="qual-branch-line" style={{ marginTop: '1px' }}>
                    <span className="qual-branch-label" style={{ fontSize: '9px' }}>Stream: </span>
                    <span style={{ fontSize: '11px' }}>{branches.join(", ")}</span>
                  </div>
                )}
                {i < courses.length - 1 && (
                  <div className="qual-or-sep" style={{ margin: '8px 0' }}>
                    <div className="qual-or-sep-line" style={{ height: '0.5px' }}></div>
                    <div className="qual-or-sep-badge" style={{ fontSize: '8px', padding: '1px 5px' }}>OR</div>
                    <div className="qual-or-sep-line" style={{ height: '0.5px' }}></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {editable && (
          <div style={{ marginTop: courses.length > 0 ? '8px' : '0' }}>
            <button
              onClick={() => {
                const path = isGeneral ? "qualification.courses" : `posts.${postIndex}.qualification.courses`;
                onFocusPath?.(path);
                onUpdate(path, [...courses, { name: "New Course", branches: [] }]);
              }}
              className="bg-navy/10 text-navy hover:bg-navy hover:text-white px-2 py-1 rounded text-[10px] font-bold transition-all"
            >
              + Add Course
            </button>
          </div>
        )}

        {(extra || editable) && (
          <div className="qual-extra" style={{ marginTop: '8px', padding: '4px 8px' }}>
            <strong style={{ fontWeight: 600, color: "var(--amber)", fontSize: '11px' }}>Note: </strong>
            <Editable
              editable={editable}
              type="textarea"
              value={extra}
              path={isGeneral ? "qualification.extraQualificationText" : `posts.${postIndex}.qualification.extraQualificationText`}
              onUpdate={onUpdate}
            />
          </div>
        )}

        {((post.prerequisite && post.prerequisite.length > 0) || editable) && (
          <div className="qual-prereq" style={{ fontSize: '10px', marginTop: '6px' }}>
            <span style={{ fontWeight: 600 }}>⚠ Prereq: </span>
            {editable ? (
              <Editable
                editable={editable}
                value={(post.prerequisite || []).join("; ")}
                path={isGeneral ? "prerequisite" : `posts.${postIndex}.prerequisite`}
                placeholder="Requirements (comma separated)"
                onUpdate={(path: string, val: string) => onUpdate(path, val ? val.split(/[;,]/).map(s => s.trim()).filter(Boolean) : [])}
              />
            ) : (
              post.prerequisite.join("; ")
            )}
          </div>
        )}
        {post.appearingEligible && (
          <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--ink-light)" }}>
            <span style={{ fontWeight: 600, color: "var(--green)" }}>Appearing eligible</span>
            {post.appearingConditions ? ` — ${post.appearingConditions}` : ""}
          </div>
        )}
      </td>
    );
  }
  const qualArr: any[] = Array.isArray(q) ? q : q ? [q] : [];
  if (qualArr.length === 0) {
    if (editable) {
      return (
        <td className="qual-cell center" style={{ verticalAlign: "middle" }}>
          <button
            onClick={() => {
              const path = isGeneral ? "qualification" : `posts.${postIndex}.qualification`;
              onFocusPath?.(path);
              onUpdate(path, { courses: [{ name: "New Qualification", branches: [] }], extraQualificationText: "" });
            }}
            className="bg-navy/10 text-navy hover:bg-navy hover:text-white px-3 py-1.5 rounded text-xs font-bold transition-all"
          >
            + Add Qualification
          </button>
        </td>
      );
    }
    return <td className="qual-cell" style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>Not specified</td>;
  }
  return (
    <td className="qual-cell">
      {qualArr.map((item, i) => {
        const name = item.name || item.qualification || "Degree";
        const branches = (item.branches || item.branch || []).filter((b: string) => b && b.toLowerCase() !== "any");
        const extras: string[] = [];
        if (item.streamRequired) extras.push(`Stream: ${item.streamRequired}`);
        if (item.minMarksPercent) extras.push(`Min. ${item.minMarksPercent}% marks`);
        if (item.minExperienceYears) extras.push(`${item.minExperienceYears} yr exp.`);
        if (item.extraQualificationText?.trim()) extras.push(item.extraQualificationText.trim());
        return (
          <React.Fragment key={i}>
            {i > 0 && <div style={{ margin: "4px 0", fontSize: "10px", color: "var(--ink-muted)", fontStyle: "italic" }}>— OR —</div>}
            <span style={{ fontWeight: 700, color: "var(--navy)", fontSize: "12px" }}>{name}</span>
            {branches.length > 0 && <div className="qual-branch-line"><span className="qual-branch-label">Branch: </span>{branches.join(", ")}</div>}
            {(extras.length > 0 || editable) && (
              <div className="qual-extra">
                <strong style={{ fontWeight: 600, color: "var(--amber)" }}>Note: </strong>
                <Editable
                  editable={editable}
                  type="textarea"
                  value={item.extraQualificationText || extras.join(" · ")}
                  path={isGeneral ? `qualification.${i}.extraQualificationText` : `posts.${postIndex}.qualification.${i}.extraQualificationText`}
                  onUpdate={onUpdate}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
      {((post.prerequisite && post.prerequisite.length > 0) || editable) && (
        <div className="qual-prereq" style={{ fontSize: '10px', marginTop: '6px' }}>
          <span style={{ fontWeight: 600 }}>⚠ Prereq: </span>
          {editable ? (
            <Editable
              editable={editable}
              value={(post.prerequisite || []).join("; ")}
              path={isGeneral ? "prerequisite" : `posts.${postIndex}.prerequisite`}
              placeholder="Requirements (comma separated)"
              onUpdate={(path: string, val: string) => onUpdate(path, val ? val.split(/[;,]/).map(s => s.trim()).filter(Boolean) : [])}
            />
          ) : (
            post.prerequisite.join("; ")
          )}
        </div>
      )}
      {post.appearingEligible && (
        <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--ink-light)" }}>
          <span style={{ fontWeight: 600, color: "var(--green)" }}>Appearing eligible</span>
          {post.appearingConditions ? ` — ${post.appearingConditions}` : ""}
        </div>
      )}
    </td>
  );
}

// ── AGE CELL ─────────────────────────────────────────────────────────────────
function AgeCell({ post, job, editable, onUpdate, postIndex, isGeneral }: any) {
  const pAL = post?.ageLimit || {};
  const jAL = job?.ageLimit || {};
  const min = pAL.min ?? jAL.min;
  const max = pAL.max ?? jAL.max;
  const asOn = pAL.asOnDate ?? jAL.asOnDate;
  if (!min && !max && !editable) return <td className="center mono" style={{ color: "var(--ink-muted)", border: "1px solid var(--border)" }}>—</td>;
  const rawRelax = (pAL.relaxation && Object.keys(pAL.relaxation).length > 0) ? pAL.relaxation : jAL.relaxation;
  const relaxEntries = rawRelax ? Object.entries(rawRelax).filter(([, v]) => v != null && v !== 0 && !isNaN(Number(v))) as [string, number][] : [];
  return (
    <td className="center" style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)" }}>
      {editable ? (
        <div style={{ display: "flex", gap: "4px", justifyContent: "center", alignItems: "center" }}>
          <Editable editable={true} value={min} path={isGeneral ? "ageLimit.min" : `posts.${postIndex}.ageLimit.min`} placeholder="Min" onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} />
          <span>-</span>
          <Editable editable={true} value={max} path={isGeneral ? "ageLimit.max" : `posts.${postIndex}.ageLimit.max`} placeholder="Max" onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} />
        </div>
      ) : (
        <div className="age-main" style={{ fontWeight: 500, color: "var(--ink)", fontSize: "14px", lineHeight: "1.2" }}>{min && max ? `${min}–${max}` : max ? `≤ ${max}` : `≥ ${min}`}</div>
      )}
      {asOn && <div className="age-ason" style={{ fontSize: "10px", color: "var(--ink-muted)", marginTop: "2px", fontWeight: 500 }}>as on {fmtDate(asOn)}</div>}
      {relaxEntries.length > 0 && (
        <div style={{ marginTop: "6px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
          {relaxEntries.map(([cat, val], idx) => (
            <span key={cat} style={{ fontSize: "9px", color: "var(--ink-muted)", fontWeight: 400, whiteSpace: "nowrap" }}>
              {RELAX_LABELS[cat] || cat.toUpperCase()}: {max ? Number(max) + Number(val) : `+${val}`}
              {idx < relaxEntries.length - 1 ? <span style={{ color: "rgba(0,0,0,0.12)", marginLeft: "4px", fontWeight: 400 }}>|</span> : ""}
            </span>
          ))}
        </div>
      )}
    </td>
  );
}

// ── SALARY CELL ───────────────────────────────────────────────────────────────
function SalaryCell({ post, job, editable, onUpdate, postIndex, isGeneral }: any) {
  const pSal = post?.salary || {};
  const jSal = job?.salary || {};
  const payLevel = pSal.payLevel ?? jSal.payLevel;
  const min = pSal.min ?? jSal.min;
  const max = pSal.max ?? jSal.max;
  if (!payLevel && !min && !max && !editable) return <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>—</td>;
  return (
    <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      {editable ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", justifyContent: "center" }}>
            <span style={{ fontSize: "11px" }}>Lvl</span>
            <Editable editable={true} value={payLevel} path={isGeneral ? "salary.payLevel" : `posts.${postIndex}.salary.payLevel`} onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "2px", justifyContent: "center" }}>
            <Editable editable={true} value={min} path={isGeneral ? "salary.min" : `posts.${postIndex}.salary.min`} onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} placeholder="Min" />
            <span>-</span>
            <Editable editable={true} value={max} path={isGeneral ? "salary.max" : `posts.${postIndex}.salary.max`} onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} placeholder="Max" />
          </div>
        </div>
      ) : (
        <>
          {payLevel != null && <div className="sal-level" style={{ fontWeight: 700, color: "var(--ink)", fontSize: "13px" }}>Level {payLevel}</div>}
          {(min || max) ? (
            <div className="sal-range" style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px" }}>{min ? fmtMoney(min) : ""}{min && max ? " – " : ""}{max ? fmtMoney(max) : ""}</div>
          ) : null}
        </>
      )}
    </td>
  );
}

// ── CATEGORY VAC CELL ─────────────────────────────────────────────────────────
function CatVacCell({ post, job, editable, onUpdate, postIndex, isGeneral }: any) {
  const catVac = post?.categoryWiseVacancy || job?.categoryWiseVacancy || {};
  const hasData = hasCategoryData(catVac);
  if (!hasData && !editable) return <td className="center mono" style={{ fontSize: 15, padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>—</td>;
  return (
    <td style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      <div className="cat-vac-grid">
        {catCols.map((c) => (
          <div key={c} className="cat-vac-chip">
            <span className="cat-vac-chip-label">{CAT_LABELS[c]}</span>
            <span className="cat-vac-chip-val">
              {editable ? (
                <Editable 
                  editable={true} 
                  path={isGeneral ? `categoryWiseVacancy.${c}` : `posts.${postIndex}.categoryWiseVacancy.${c}`}
                  value={catVac[c] != null ? String(catVac[c]) : ""} 
                  onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} 
                />
              ) : (
                catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"
              )}
            </span>
          </div>
        ))}
      </div>
    </td>
  );
}

export const EditableFocusContext = React.createContext<((path: string) => void) | undefined>(undefined);

const Editable = ({ editable, value, onUpdate, path, type = 'text', placeholder }: any) => {
  const [localValue, setLocalValue] = React.useState(value || "");
  const onFocusPath = React.useContext(EditableFocusContext);

  // Initial sync from parent
  React.useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  if (!editable) return <span>{value || "—"}</span>;

  const handleBlur = () => {
    if (localValue !== value) {
      onUpdate(path, localValue);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    onUpdate(path, val);
  };

  if (type === 'textarea') {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={() => onFocusPath?.(path)}
        placeholder={placeholder}
        className="jd-edit-field w-full min-h-[100px] bg-blue-50/50 border-blue-200"
        style={{ fontSize: '14px', lineHeight: '1.6', padding: '10px' }}
      />
    );
  }

  return (
    <input
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onFocus={() => onFocusPath?.(path)}
      placeholder={placeholder}
      className="jd-edit-field"
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleBlur();
      }}
    />
  );
};

export default function RecruitmentPreview({ job, editable, onUpdate, onFocusPath }: any) {
  if (!job) return null;

  const hiddenCols = job.hiddenColumns || [];
  const isColVisible = (colId: string) => !hiddenCols.includes(colId);

  const hiddenSections = job.hiddenSections || [];
  const isSecVisible = (secId: string) => !hiddenSections.includes(secId);

  const hiddenHeroCards = job.hiddenHeroCards || [];
  const isCardVisible = (cardId: string) => !hiddenHeroCards.includes(cardId);

  const al = job.ageLimit || {};
  const af = job.applicationFee || {};
  const dates = job.importantDates || {};

  const feeMap: Record<string, string[]> = {};
  Object.entries(af).forEach(([cat, val]) => {
    if (cat === "paymentMode" || val === null || val === undefined) return;
    const k = String(val);
    if (!feeMap[k]) feeMap[k] = [];
    feeMap[k].push(CAT_LABELS[cat] || cat.toUpperCase());
  });

  const relaxRows = Object.entries(al.relaxation || {}).filter(([k, v]) => v != null).map(([k, v]) => ({
    label: k === "exServiceman" ? "Ex-Serviceman" : k === "female" ? "Female" : k.toUpperCase(),
    val: v as number
  }));

  const standardKeys = [
    "notificationRelease", "applicationStartDate", "applicationLastDate",
    "feePaymentLastDate", "correctionWindowLastDate", "admitCardDate",
    "examDate", "resultDate", "interviewDate", "documentVerificationDate"
  ];

  const timelineRows: { label: string; key: string; highlight?: boolean }[] = [];

  // Only add standard keys if they exist in the data
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
  ];

  standardDefs.forEach(def => {
    if (dates[def.key as keyof typeof dates] !== undefined) {
      timelineRows.push(def);
    }
  });

  // Dynamically add any other keys found in importantDates (Dates and Links)
  const excludeKeys = [...standardKeys, "customDates", "_id"];
  Object.keys(dates).forEach(key => {
    if (!excludeKeys.includes(key)) {
      const prettify = (str: string) => str.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
      timelineRows.push({ label: prettify(key), key });
    }
  });

  const rawPosts: any[] = job.posts ? job.posts : [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }];

  // Salary derivation
  const salaryValues = rawPosts.map((p) => `${p.salary?.payLevel || ''}|${p.salary?.min || ''}|${p.salary?.max || ''}`);
  const allSameSalary = salaryValues.every((v) => v === salaryValues[0]);
  const heroSal = rawPosts[0]?.salary || job.salary || {};

  return (
    <EditableFocusContext.Provider value={onFocusPath}>
      <div className="jd">
        <style dangerouslySetInnerHTML={{ __html: styles }} />
        <div className="jd-wrap">

        {/* MASTHEAD */}
        <header className="jd-masthead">
          <h1 className="jd-title">
            <Editable editable={editable} path="title" value={job.title} onUpdate={onUpdate} />
          </h1>
          <div className="jd-tags">
            {job.tags?.slice(0, 8).map((t: string) => <span key={t} className="jd-tag">{t}</span>)}
          </div>
        </header>

        {/* HERO STRIP */}
        {(() => {
          const showVacancies = isCardVisible('vacancies') || editable;
          const showStartDate = isCardVisible('startDate') || editable;
          const showLastDate = isCardVisible('lastDate') || editable;
          const visibleCount = [isCardVisible('vacancies'), isCardVisible('startDate'), isCardVisible('lastDate')].filter(Boolean).length;
          const gridCount = editable ? 3 : visibleCount;

          if (gridCount === 0) return null;

          return (
            <div className="jd-hero" style={{ gridTemplateColumns: `repeat(${gridCount}, 1fr)` }}>
              {showVacancies && (
                <div 
                  className={`jd-hero-cell accent relative ${!isCardVisible('vacancies') ? 'opacity-30 border-dashed border-red-300' : ''}`}
                  style={{ position: 'relative' }}
                >
                  {editable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isHidden = !isCardVisible('vacancies');
                        const updated = isHidden
                          ? hiddenHeroCards.filter((c: string) => c !== 'vacancies')
                          : [...hiddenHeroCards, 'vacancies'];
                        onUpdate("hiddenHeroCards", updated);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                      className={!isCardVisible('vacancies') ? 'bg-rose-600 text-white' : 'bg-white/20 text-white hover:bg-white/30'}
                    >
                      {!isCardVisible('vacancies') ? '✕ Hidden' : '✓ Visible'}
                    </button>
                  )}
                  <div className="jd-hero-icon"><IconUsers /></div>
                  <div className="jd-hero-content">
                    <div className="jd-hero-label">Total Vacancies</div>
                    <div className="jd-hero-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div>
                  </div>
                </div>
              )}

              {showStartDate && (
                <div 
                  className={`jd-hero-cell relative ${!isCardVisible('startDate') ? 'opacity-30 border-dashed border-red-300' : ''}`}
                  style={{ position: 'relative' }}
                >
                  {editable && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const isHidden = !isCardVisible('startDate');
                        const updated = isHidden
                          ? hiddenHeroCards.filter((c: string) => c !== 'startDate')
                          : [...hiddenHeroCards, 'startDate'];
                        onUpdate("hiddenHeroCards", updated);
                      }}
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        cursor: 'pointer',
                        zIndex: 10,
                      }}
                      className={!isCardVisible('startDate') ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                    >
                      {!isCardVisible('startDate') ? '✕ Hidden' : '✓ Visible'}
                    </button>
                  )}
                  <div className="jd-hero-icon"><IconCalendar /></div>
                  <div className="jd-hero-content">
                    <div className="jd-hero-label">Start Date</div>
                    <div className="jd-hero-value">
                      {dates.applicationStartDate ? fmtDate(dates.applicationStartDate) : "TBA"}
                    </div>
                  </div>
                </div>
              )}

              {showLastDate && (() => {
                const lastDateStr = dates.applicationLastDate;
                
                let dateColor = '#64748B'; // Default slate gray
                
                if (lastDateStr) {
                  const lastDate = new Date(lastDateStr);
                  if (!isNaN(lastDate.getTime())) {
                    const endDateTime = new Date(lastDate);
                    if (endDateTime.getHours() === 0 && endDateTime.getMinutes() === 0) {
                      endDateTime.setHours(23, 59, 59, 999);
                    }
                    const now = new Date();
                    const timeDiff = endDateTime.getTime() - now.getTime();
                    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
                    
                    if (daysLeft < 0) {
                      dateColor = '#EF4444'; // Red for expired
                    } else if (daysLeft <= 7) {
                      dateColor = '#3B82F6'; // Blue for closing soon
                    } else {
                      dateColor = '#10B981'; // Green for active / safe
                    }
                  }
                }
                
                return (
                  <div 
                    className={`jd-hero-cell highlight-red relative ${!isCardVisible('lastDate') ? 'opacity-30 border-dashed border-red-300' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {editable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isHidden = !isCardVisible('lastDate');
                          const updated = isHidden
                            ? hiddenHeroCards.filter((c: string) => c !== 'lastDate')
                            : [...hiddenHeroCards, 'lastDate'];
                          onUpdate("hiddenHeroCards", updated);
                        }}
                        style={{
                          position: 'absolute',
                          top: '6px',
                          right: '6px',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '9px',
                          fontWeight: 'bold',
                          padding: '2px 6px',
                          cursor: 'pointer',
                          zIndex: 10,
                        }}
                        className={!isCardVisible('lastDate') ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}
                      >
                        {!isCardVisible('lastDate') ? '✕ Hidden' : '✓ Visible'}
                      </button>
                    )}
                    <div className="jd-hero-icon"><IconCalendar /></div>
                    <div className="jd-hero-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'start' }}>
                      <div className="jd-hero-label">Last Date</div>
                      <div>
                        <div className="jd-hero-value" style={{ 
                          color: dateColor, 
                          whiteSpace: 'nowrap' 
                        }}>
                          {dates.applicationLastDate ? fmtDate(dates.applicationLastDate) : "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          );
        })()}

        {/* LEDE */}
        {(job.description || job.shortInfo || editable) && (
          <div className="jd-lede">
            <Editable
              editable={editable}
              path="description"
              value={job.description || job.shortInfo}
              onUpdate={onUpdate}
              type="textarea"
            />
          </div>
        )}

        {(isSecVisible('overview') || editable) && (
          <>
            <div className="jd-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="jd-section-icon"><IconBriefcase /></span>
                <span className="jd-section-title">Recruitment Overview</span>
              </div>
              {editable && (
                <button
                  onClick={() => {
                    const isHidden = !isSecVisible('overview');
                    const updated = isHidden
                      ? hiddenSections.filter((s: string) => s !== 'overview')
                      : [...hiddenSections, 'overview'];
                    onUpdate("hiddenSections", updated);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isSecVisible('overview')
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30'
                  }`}
                >
                  {!isSecVisible('overview') ? '✕ Hidden' : '✓ Visible'}
                </button>
              )}
            </div>
            {isSecVisible('overview') && (
              <table className="jd-table">
              <tbody>
                <tr><td className="label">Organisation</td><td><Editable editable={editable} path="organization" value={job.organization} onUpdate={onUpdate} /></td></tr>
                <tr>
                  <td className="label">Advt. No.</td>
                  <td>
                    <Editable editable={editable} path="advertisementNumber" value={job.advertisementNumber || "Phase-XIV/2026/Selection Posts"} onUpdate={onUpdate} />
                  </td>
                </tr>
                {(job.department || editable) && (
                  <tr><td className="label">Department</td><td><Editable editable={editable} path="department" value={job.department} onUpdate={onUpdate} /></td></tr>
                )}
                <tr><td className="label">Govt. Type</td><td><Editable editable={editable} path="type" value={job.type} onUpdate={onUpdate} /></td></tr>
                <tr>
                  <td className="label">Job Location</td>
                  <td>
                    <Editable
                      editable={editable}
                      path="location"
                      value={Array.isArray(job.location) ? job.location.join(", ") : (job.location || "All India")}
                      onUpdate={(path: string, val: string) => {
                        const arr = val.split(",").map(s => s.trim()).filter(Boolean);
                        onUpdate(path, arr);
                      }}
                    />
                  </td>
                </tr>
                {(dates.notificationType || editable) && (
                  <tr><td className="label">Notification Type</td><td><Editable editable={editable} path="importantDates.notificationType" value={dates.notificationType} onUpdate={onUpdate} /></td></tr>
                )}

                {/* Salary shown in overview if consistent across posts */}
                {allSameSalary && (heroSal.payLevel || heroSal.min || heroSal.max) && (
                  <>
                    {heroSal.payLevel && <tr><td className="label">Pay Level</td><td className="bold">Level {heroSal.payLevel}</td></tr>}
                    {(heroSal.min || heroSal.max) && (
                      <tr>
                        <td className="label">Salary</td>
                        <td className="bold">
                          {heroSal.min ? fmtMoney(heroSal.min) : ""}
                          {heroSal.min && heroSal.max ? " – " : ""}
                          {heroSal.max ? fmtMoney(heroSal.max) : ""}
                          {" INR"}
                        </td>
                      </tr>
                    )}
                  </>
                )}

                {/* Eligibility Flags */}
                {(job.categoryEligibility?.length > 0 || editable) && (
                  <tr>
                    <td className="label">Category Eligibility</td>
                    <td>
                      <Editable
                        editable={editable}
                        path="categoryEligibility"
                        value={Array.isArray(job.categoryEligibility) ? job.categoryEligibility.join(", ") : (job.categoryEligibility || "")}
                        onUpdate={(path: string, val: string) => {
                          const arr = val.split(",").map(s => s.trim()).filter(Boolean);
                          onUpdate(path, arr);
                        }}
                      />
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="label">PwBD Eligible</td>
                  <td>
                    {editable ? (
                      <button onClick={() => {
                        onFocusPath?.('pwdEligible');
                        onUpdate('pwdEligible', !job.pwdEligible);
                      }} className={`text-[10px] font-bold px-2 py-1 rounded ${job.pwdEligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {job.pwdEligible ? 'YES' : 'NO'}
                      </button>
                    ) : (
                      job.pwdEligible ? <span style={{ color: "var(--green)", fontWeight: 600 }}>Yes</span> : "No"
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="label">Female Only</td>
                  <td>
                    {editable ? (
                      <button onClick={() => {
                        onFocusPath?.('femaleOnly');
                        onUpdate('femaleOnly', !job.femaleOnly);
                      }} className={`text-[10px] font-bold px-2 py-1 rounded ${job.femaleOnly ? 'bg-crimson/10 text-crimson' : 'bg-gray-100 text-gray-400'}`}>
                        {job.femaleOnly ? 'YES' : 'NO'}
                      </button>
                    ) : (
                      job.femaleOnly ? <span style={{ color: "var(--crimson)", fontWeight: 600 }}>Yes</span> : "No"
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="label">Ex-Serviceman Quota</td>
                  <td>
                    {editable ? (
                      <button onClick={() => {
                        onFocusPath?.('exServicemanQuota');
                        onUpdate('exServicemanQuota', !job.exServicemanQuota);
                      }} className={`text-[10px] font-bold px-2 py-1 rounded ${job.exServicemanQuota ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-400'}`}>
                        {job.exServicemanQuota ? 'YES' : 'NO'}
                      </button>
                    ) : (
                      job.exServicemanQuota ? <span style={{ fontWeight: 600 }}>Yes</span> : "No"
                    )}
                  </td>
                </tr>
                {(job.eligibleGender?.length > 0 || editable) && (
                  <tr>
                    <td className="label">Eligible Gender</td>
                    <td>
                      <Editable
                        editable={editable}
                        path="eligibleGender"
                        value={Array.isArray(job.eligibleGender) ? job.eligibleGender.join(", ") : (job.eligibleGender || "All")}
                        onUpdate={(path: string, val: string) => {
                          const arr = val.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
                          onUpdate(path, arr);
                        }}
                        placeholder="e.g. Male, Female"
                      />
                    </td>
                  </tr>
                )}

                {/* Links in Overview */}
                {dates.officialWebsite && (
                  <tr>
                    <td className="label">Official Website</td>
                    <td>
                      <a href={dates.officialWebsite} target="_blank" rel="noreferrer" style={{ color: "#1e40af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        {dates.officialWebsite} <IconExternalLink />
                      </a>
                    </td>
                  </tr>
                )}
                {dates.notificationPdfLink && (
                  <tr>
                    <td className="label">PDF Notification</td>
                    <td>
                      <a href={dates.notificationPdfLink} target="_blank" rel="noreferrer" style={{ color: "#1e40af", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4 }}>
                        Official PDF <IconExternalLink />
                      </a>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </>
      )}

        {/* FEE */}
        {(isSecVisible('fee') || editable) && (
          <>
            <div className="jd-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="jd-section-icon"><IconCreditCard /></span>
                <span className="jd-section-title">Application Fee</span>
              </div>
              {editable && (
                <button
                  onClick={() => {
                    const isHidden = !isSecVisible('fee');
                    const updated = isHidden
                      ? hiddenSections.filter((s: string) => s !== 'fee')
                      : [...hiddenSections, 'fee'];
                    onUpdate("hiddenSections", updated);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isSecVisible('fee')
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30'
                  }`}
                >
                  {!isSecVisible('fee') ? '✕ Hidden' : '✓ Visible'}
                </button>
              )}
            </div>
            {isSecVisible('fee') && (
              <table className="jd-table">
                <thead><tr><th>Category</th><th className="center">Fee Amount</th></tr></thead>
                <tbody>
                  {Object.entries(feeMap).map(([amount, cats]) => (
                    <tr key={amount}>
                      <td className="label">{cats.join(", ")}</td>
                      <td className="center bold">{amount === "0" ? "Free / Exempted" : fmtMoney(parseInt(amount))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}

        {/* VACANCIES */}
        {(isSecVisible('vacancy') || editable) && (
          <div className="jd-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="jd-section-icon"><IconUsers /></span>
              <span className="jd-section-title">Post-wise Vacancy & Eligibility</span>
            </div>
            {editable && (
              <button
                onClick={() => {
                  const isHidden = !isSecVisible('vacancy');
                  const updated = isHidden
                    ? hiddenSections.filter((s: string) => s !== 'vacancy')
                    : [...hiddenSections, 'vacancy'];
                  onUpdate("hiddenSections", updated);
                }}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                  !isSecVisible('vacancy')
                    ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30'
                }`}
              >
                {!isSecVisible('vacancy') ? '✕ Hidden' : '✓ Visible'}
              </button>
            )}
          </div>
        )}

        {editable && (
          <div className="mb-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 flex flex-col gap-3 text-[11px] md:text-xs">
            {/* Table Option Toggles */}
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200/60 pb-3">
              <span className="font-bold text-navy/60 uppercase tracking-widest mr-2">Table Options:</span>
              <button
                onClick={() => onUpdate("hideVacancyTable", !job.hideVacancyTable)}
                className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                  job.hideVacancyTable
                    ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                    : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                }`}
              >
                {job.hideVacancyTable ? '✕ Default Table Hidden' : '✓ Default Table Visible'}
              </button>

              {job.hideVacancyTable && (
                <button
                  onClick={() => {
                    if (job.customVacancyTable) {
                      if (window.confirm("Remove custom table?")) {
                        onUpdate("customVacancyTable", undefined);
                      }
                    } else {
                      onUpdate("customVacancyTable", {
                        headers: ["Post Name", "Total Vacancies", "Qualification Specifics"],
                        rows: [["General Post", "12", "Graduate"]]
                      });
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                    job.customVacancyTable
                      ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  {job.customVacancyTable ? '✕ Remove Custom Table' : '＋ Add Custom Table for Show'}
                </button>
              )}
            </div>

            {/* Toggle Table Columns (Only visible if default table is not hidden) */}
            {!job.hideVacancyTable && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-navy/60 uppercase tracking-widest mr-2">Toggle Table Columns:</span>
                {[
                  { id: 'total', label: 'Total Vacancy' },
                  { id: 'category', label: 'Category Vacancy' },
                  { id: 'age', label: 'Age Limit' },
                  { id: 'salary', label: 'Salary / Pay Level' },
                  { id: 'qualification', label: 'Qualification' },
                ].map(col => {
                  const isHidden = !isColVisible(col.id);
                  return (
                    <button
                      key={col.id}
                      onClick={() => {
                        const updated = isHidden
                          ? hiddenCols.filter((c: string) => c !== col.id)
                          : [...hiddenCols, col.id];
                        onUpdate("hiddenColumns", updated);
                      }}
                      className={`px-3 py-1.5 rounded-lg border font-bold transition-all cursor-pointer ${
                        isHidden
                          ? 'bg-red-50 text-red-500 border-red-200 hover:bg-red-100'
                          : 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                      }`}
                    >
                      {col.label} {isHidden ? '✕ Hidden' : '✓ Visible'}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {isSecVisible('vacancy') && (job.hideVacancyTable ? (
          job.customVacancyTable ? (
            <div className="tbl-scroll">
              <table className="jd-table">
                <thead>
                  <tr>
                    {job.customVacancyTable.headers.map((h: string, hIdx: number) => (
                      <th key={hIdx}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <Editable
                            editable={editable}
                            value={h}
                            path={`customVacancyTable.headers.${hIdx}`}
                            onUpdate={onUpdate}
                          />
                          {editable && (
                            <button
                              onClick={() => {
                                const newHeaders = [...job.customVacancyTable.headers];
                                newHeaders.splice(hIdx, 1);
                                const newRows = job.customVacancyTable.rows.map((r: string[]) => {
                                  const nr = [...r];
                                  nr.splice(hIdx, 1);
                                  return nr;
                                });
                                onUpdate("customVacancyTable", { headers: newHeaders, rows: newRows });
                              }}
                              style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                              title="Delete Column"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                    {editable && (
                      <th className="center" style={{ width: 60 }}>
                        <button
                          onClick={() => {
                            const newHeaders = [...job.customVacancyTable.headers, "New Column"];
                            const newRows = job.customVacancyTable.rows.map((r: string[]) => [...r, ""]);
                            onUpdate("customVacancyTable", { headers: newHeaders, rows: newRows });
                          }}
                          className="bg-navy/10 text-navy hover:bg-navy hover:text-white px-2 py-0.5 rounded text-[10px] font-bold"
                          title="Add Column"
                        >
                          + Col
                        </button>
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {job.customVacancyTable.rows.map((row: string[], rIdx: number) => (
                    <tr key={rIdx}>
                      {row.map((cell: string, cIdx: number) => (
                        <td key={cIdx}>
                          <Editable
                            editable={editable}
                            value={cell}
                            path={`customVacancyTable.rows.${rIdx}.${cIdx}`}
                            onUpdate={onUpdate}
                          />
                        </td>
                      ))}
                      {editable && (
                        <td className="center" style={{ verticalAlign: 'middle', border: '1px solid var(--border)' }}>
                          <button
                            onClick={() => {
                              const newRows = [...job.customVacancyTable.rows];
                              newRows.splice(rIdx, 1);
                              onUpdate("customVacancyTable.rows", newRows);
                            }}
                            className="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors"
                            title="Delete Row"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {editable && (
                    <tr>
                      <td colSpan={job.customVacancyTable.headers.length + (editable ? 1 : 0)} className="center" style={{ padding: '16px', border: '1px solid var(--border)' }}>
                        <button
                          onClick={() => {
                            const emptyRow = Array(job.customVacancyTable.headers.length).fill("");
                            onUpdate("customVacancyTable.rows", [...job.customVacancyTable.rows, emptyRow]);
                          }}
                          className="bg-navy/10 text-navy hover:bg-navy hover:text-white px-5 py-2 rounded-md font-bold text-sm transition-all"
                        >
                          + Add Row
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Vacancy Table Hidden</p>
            </div>
          )
        ) : (
          <div className="tbl-scroll">
            <table className="jd-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 180 }}>Post / Designation</th>
                  {isColVisible('total') && (
                    <th className="center" style={{ width: 80 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span>Total</span>
                        {editable && (
                          <button
                            onClick={() => onUpdate("hiddenColumns", [...hiddenCols, 'total'])}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            title="Hide Column"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                  {isColVisible('category') && (
                    <th className="center" style={{ minWidth: 170 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span>Category Vacancy</span>
                        {editable && (
                          <button
                            onClick={() => onUpdate("hiddenColumns", [...hiddenCols, 'category'])}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            title="Hide Column"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                  {isColVisible('age') && (
                    <th className="center" style={{ minWidth: 130 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span>Age Limit (incl. Relaxation)</span>
                        {editable && (
                          <button
                            onClick={() => onUpdate("hiddenColumns", [...hiddenCols, 'age'])}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            title="Hide Column"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                  {isColVisible('salary') && (
                    <th className="center" style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <span>Salary / Pay Level</span>
                        {editable && (
                          <button
                            onClick={() => onUpdate("hiddenColumns", [...hiddenCols, 'salary'])}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            title="Hide Column"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                  {isColVisible('qualification') && (
                    <th style={{ minWidth: 280 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                        <span>Qualification & Requirements</span>
                        {editable && (
                          <button
                            onClick={() => onUpdate("hiddenColumns", [...hiddenCols, 'qualification'])}
                            style={{ border: 'none', background: 'transparent', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                            title="Hide Column"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </th>
                  )}
                  {editable && <th className="center" style={{ width: 60 }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {rawPosts.map((p: any, idx: number) => {
                  const isGeneral = !(job.posts || []).length;
                  return (
                    <tr key={idx}>
                      <td style={{ verticalAlign: "top", fontWeight: 600, fontSize: 14, paddingTop: 12 }}>
                        <Editable 
                          editable={editable} 
                          value={p.name} 
                          path={isGeneral ? "title" : `posts.${idx}.name`} 
                          onUpdate={onUpdate} 
                        />
                      </td>
                      {isColVisible('total') && (
                        <td className="center bold mono" style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)", fontSize: 15, whiteSpace: "nowrap" }}>
                          <Editable 
                            editable={editable} 
                            value={p.totalVacancy != null ? String(p.totalVacancy) : ""} 
                            path={isGeneral ? "totalVacancy" : `posts.${idx}.totalVacancy`} 
                            onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} 
                          />
                        </td>
                      )}
                      {isColVisible('category') && <CatVacCell post={p} job={job} editable={editable} onUpdate={onUpdate} postIndex={idx} isGeneral={isGeneral} />}
                      {isColVisible('age') && <AgeCell post={p} job={job} editable={editable} onUpdate={onUpdate} postIndex={idx} isGeneral={isGeneral} />}
                      {isColVisible('salary') && <SalaryCell post={p} job={job} editable={editable} onUpdate={onUpdate} postIndex={idx} isGeneral={isGeneral} />}
                      {isColVisible('qualification') && <QualCell post={p} editable={editable} onUpdate={onUpdate} postIndex={idx} isGeneral={isGeneral} />}
                      {editable && (
                        <td className="center" style={{ verticalAlign: "middle", border: "1px solid var(--border)" }}>
                          <button
                            onClick={() => {
                              if (window.confirm("Are you sure you want to delete this post?")) {
                                const newPosts = [...rawPosts];
                                newPosts.splice(idx, 1);
                                onUpdate("posts", newPosts);
                              }
                            }}
                            className="bg-red-50 text-red-500 hover:bg-red-100 p-1.5 rounded transition-colors"
                            title="Delete Post"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                <tr className="tr-total">
                  <td>Total (All Posts)</td>
                  {isColVisible('total') && (
                    <td className="center mono" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                      {editable ? (
                        <Editable 
                          editable={editable} 
                          value={job.totalVacancy != null ? String(job.totalVacancy) : ""} 
                          path="totalVacancy" 
                          onUpdate={(path: string, val: string) => onUpdate(path, val ? parseInt(val) : null)} 
                        />
                      ) : (
                        job.totalVacancy?.toLocaleString("en-IN") ?? "—"
                      )}
                    </td>
                  )}
                  {isColVisible('category') && <td />}
                  {isColVisible('age') && <td />}
                  {isColVisible('salary') && <td />}
                  {isColVisible('qualification') && <td />}
                  {editable && <td />}
                </tr>
                {editable && (
                  <tr>
                    <td colSpan={1 + ['total', 'category', 'age', 'salary', 'qualification'].filter(isColVisible).length + (editable ? 1 : 0)} className="center" style={{ padding: "16px", border: "1px solid var(--border)" }}>
                      <button
                        onClick={() => {
                          const newPost = { 
                            name: "New Post", 
                            totalVacancy: 0, 
                            ageLimit: { min: null, max: null, asOnDate: null, relaxation: {} }, 
                            salary: { payLevel: null, min: null, max: null }, 
                            categoryWiseVacancy: { general: null, ews: null, obc: null, sc: null, st: null, pwd: null },
                            qualification: { courses: [], extraQualificationText: "" },
                            prerequisite: [],
                            appearingEligible: false,
                            appearingConditions: ""
                          };
                          onUpdate("posts", [...rawPosts, newPost]);
                        }}
                        className="bg-navy/10 text-navy hover:bg-navy hover:text-white px-5 py-2 rounded-md font-bold text-sm transition-all inline-flex items-center gap-2"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        Add New Post
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ))}

        {/* RECRUITMENT PROCEDURES */}
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
          const hasProcedures = selSteps.length > 0 || appSteps.length > 0;

          if (!hasProcedures && !editable) return null;

          return (
            <>
              {(isSecVisible('procedure') || editable) && hasProcedures && (
                <div className="jd-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className="jd-section-icon"><IconBriefcase /></span>
                    <span className="jd-section-title">Selection & Apply Process</span>
                  </div>
                  {editable && (
                    <button
                      onClick={() => {
                        const isHidden = !isSecVisible('procedure');
                        const updated = isHidden
                          ? hiddenSections.filter((s: string) => s !== 'procedure')
                          : [...hiddenSections, 'procedure'];
                        onUpdate("hiddenSections", updated);
                      }}
                      className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                        !isSecVisible('procedure')
                          ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30'
                      }`}
                    >
                      {!isSecVisible('procedure') ? '✕ Hidden' : '✓ Visible'}
                    </button>
                  )}
                </div>
              )}

              {isSecVisible('procedure') && (
                <>
                  {selSteps.length > 0 && (
                    <>
                      <div className="text-[13px] font-bold text-navy uppercase tracking-wider mb-2.5 mt-5 ml-1">Selection Stages</div>
                      <div className="jd-stages">
                        {selSteps.map((stage: string, idx: number) => {
                          const match = stage.match(/^([^(]+)(?:\(([^)]+)\))?/);
                          const title = match ? match[1].trim() : stage;
                          const desc = match && match[2] ? match[2].trim() : null;
                          return (
                            <React.Fragment key={idx}>
                              <div className="jd-stage">
                                <div className="jd-stage-num">{idx + 1}</div>
                                <div className="jd-stage-content">
                                  <div className="jd-stage-title">{title}</div>
                                  {desc && <div className="jd-stage-desc">{desc}</div>}
                                </div>
                              </div>
                              {idx < selSteps.length - 1 && (
                                <div className="jd-stage-arrow"><IconArrow /></div>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {appSteps.length > 0 && (
                    <>
                      <div className="text-[13px] font-bold text-navy uppercase tracking-wider mb-2.5 mt-5 ml-1">How to Apply Steps</div>
                      <div style={{ padding: "0 4px", fontSize: 14 }}>
                        {appSteps.map((step: string, idx: number) => (
                          <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "10px", alignItems: "flex-start" }}>
                            <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: "var(--paper-alt)", border: "1px solid var(--border)", color: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, fontWeight: 700 }}>{idx + 1}</div>
                            <div style={{ color: "var(--ink-light)", lineHeight: "1.5" }}>{step}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </>
          );
        })()}

        {/* TIMELINE */}
        {(isSecVisible('timeline') || editable) && (
          <>
            <div className="jd-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="jd-section-icon"><IconCalendar /></span>
                <span className="jd-section-title">Timeline / Important Dates</span>
              </div>
              {editable && (
                <button
                  onClick={() => {
                    const isHidden = !isSecVisible('timeline');
                    const updated = isHidden
                      ? hiddenSections.filter((s: string) => s !== 'timeline')
                      : [...hiddenSections, 'timeline'];
                    onUpdate("hiddenSections", updated);
                  }}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer border ${
                    !isSecVisible('timeline')
                      ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-500/30'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-500/30'
                  }`}
                >
                  {!isSecVisible('timeline') ? '✕ Hidden' : '✓ Visible'}
                </button>
              )}
            </div>
            {isSecVisible('timeline') && (
              <table className="jd-table jd-timeline-table">
          <tbody>
            {timelineRows.map(row => {
              const val = dates[row.key as keyof typeof dates];
              // Show all rows as per institutional standard
              return (
                <tr key={row.key} className={row.highlight ? "tr-highlight" : ""}>
                  <td className="label">{row.label}</td>
                  <td className={val ? "bold" : "red bold"}>
                    {editable ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ flex: 1 }}>
                            <Editable
                              editable={true}
                              path={`importantDates.${row.key}`}
                              value={val || ""}
                              onUpdate={onUpdate}
                            />
                          </div>
                          <button
                            onClick={() => onUpdate(`importantDates.${row.key}`, undefined)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#fee2e2',
                              color: '#ef4444',
                              border: '1px solid #fecaca',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '16px',
                              cursor: 'pointer',
                              flexShrink: 0
                            }}
                            title="Remove row"
                          >
                            ×
                          </button>
                        </div>
                        <div style={{ fontSize: '9px', opacity: 0.5, marginTop: 4 }}>Date or Link</div>
                      </>
                    ) : (
                      (() => {
                        const raw = dates[row.key as keyof typeof dates];
                        if (!raw) return "Not available";
                        const val = typeof raw === 'string' ? raw.trim() : raw;

                        if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.'))) {
                          const href = val.startsWith('www.') ? `https://${val}` : val;
                          return (
                            <a href={href} target="_blank" rel="noreferrer" style={{ color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}>
                              Link
                            </a>
                          );
                        }
                        const d = new Date(val as string);
                        if (!isNaN(d.getTime())) return fmtDate(val as string);
                        return val;
                      })()
                    )}
                  </td>
                </tr>
              );
            })}
            {/* Custom Milestone Addition */}
            {(dates.customDates || []).map((cd: any, idx: number) => (
              <tr key={`custom-${idx}`}>
                <td className="label">
                  <Editable
                    editable={editable}
                    path={`importantDates.customDates.${idx}.label`}
                    value={cd.label}
                    onUpdate={onUpdate}
                  />
                </td>
                <td className="bold" style={{ position: 'relative' }}>
                  {editable ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ flex: 1 }}>
                          <Editable
                            editable={true}
                            path={`importantDates.customDates.${idx}.date`}
                            value={cd.date || ""}
                            onUpdate={onUpdate}
                          />
                        </div>
                        <button
                          onClick={() => {
                            const current = [...(dates.customDates || [])];
                            current.splice(idx, 1);
                            onUpdate('importantDates.customDates', current);
                          }}
                          style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#fee2e2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}
                          title="Remove row"
                        >
                          ×
                        </button>
                      </div>
                      <div style={{ fontSize: '9px', opacity: 0.5, marginTop: 4 }}>Date or Link</div>
                    </>
                  ) : (
                    (() => {
                      const val = cd.date;
                      if (!val) return "—";
                      if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://') || val.startsWith('www.'))) {
                        const href = val.startsWith('www.') ? `https://${val}` : val;
                        return (
                          <a href={href} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", textDecoration: "underline", fontWeight: 600 }}>
                            Link
                          </a>
                        );
                      }
                      const d = new Date(val as string);
                      if (!isNaN(d.getTime())) return fmtDate(val as string);
                      return val;
                    })()
                  )}
                </td>
              </tr>
            ))}
            {editable && (
              <tr>
                <td colSpan={2} style={{ textAlign: 'center', padding: '12px' }}>
                  <button
                    onClick={() => {
                      const currentCustom = dates.customDates || [];
                      onUpdate('importantDates.customDates', [...currentCustom, { label: 'New Milestone', date: '' }]);
                    }}
                    className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-full border border-blue-100"
                  >
                    + Add New Milestone
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </>
  )}
      </div>
    </div>
    </EditableFocusContext.Provider>
  );
}