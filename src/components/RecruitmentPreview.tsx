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

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = { general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD" };
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"] as const;
const RELAX_LABELS: Record<string, string> = { obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD", exServiceman: "Ex-SM", female: "Female" };

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
    font-size: 18px;
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

  /* ── TABLES ── */
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
  .age-main { font-family: var(--mono); font-size: 14px; font-weight: 700; color: var(--navy); white-space: nowrap; }
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
`;

// ── HELPERS ──────────────────────────────────────────────────────────────────
function hasCategoryData(cv: any): boolean {
  if (!cv) return false;
  return Object.values(cv).some(v => v != null);
}

// ── QUALIFICATION CELL ────────────────────────────────────────────────────────
function QualCell({ post, editable, onUpdate, postIndex, isGeneral }: any) {
  const q = post.qualification;

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
                <div style={{ fontWeight: 700, color: "var(--navy)", fontSize: "12px" }}>{name}</div>
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

        {post.prerequisite?.length > 0 && <div className="qual-prereq" style={{ fontSize: '10px' }}>⚠ {post.prerequisite.join("; ")}</div>}
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
  if (qualArr.length === 0) return <td className="qual-cell" style={{ color: "var(--ink-muted)", fontStyle: "italic" }}>Not specified</td>;
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
      {post.prerequisite?.length > 0 && <div className="qual-prereq">⚠ {post.prerequisite.join("; ")}</div>}
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
function AgeCell({ post, job }: { post: any; job: any }) {
  const pAL = post?.ageLimit || {};
  const jAL = job?.ageLimit || {};
  const min = pAL.min ?? jAL.min;
  const max = pAL.max ?? jAL.max;
  const asOn = pAL.asOnDate ?? jAL.asOnDate;
  if (!min && !max) return <td className="center mono" style={{ color: "var(--ink-muted)", border: "1px solid var(--border)" }}>—</td>;
  const rawRelax = (pAL.relaxation && Object.keys(pAL.relaxation).length > 0) ? pAL.relaxation : jAL.relaxation;
  const relaxEntries = rawRelax ? Object.entries(rawRelax).filter(([, v]) => v != null && v !== 0 && !isNaN(Number(v))) as [string, number][] : [];
  return (
    <td className="center" style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)" }}>
      <div className="age-main" style={{ fontWeight: 700, color: "var(--ink)", fontSize: "14px", lineHeight: "1.2" }}>{min && max ? `${min}–${max}` : max ? `≤ ${max}` : `≥ ${min}`}</div>
      {asOn && <div className="age-ason" style={{ fontSize: "10px", color: "var(--ink-muted)", marginTop: "2px", fontWeight: 500 }}>as on {fmtDate(asOn)}</div>}
      {relaxEntries.length > 0 && (
        <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "6px" }}>
          {relaxEntries.map(([cat, val], idx) => (
            <span key={cat} style={{ fontSize: "11px", color: "var(--ink-light)", fontWeight: 600, whiteSpace: "nowrap" }}>
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
  const pSal = post?.salary || {};
  const jSal = job?.salary || {};
  const payLevel = pSal.payLevel ?? jSal.payLevel;
  const min = pSal.min ?? jSal.min;
  const max = pSal.max ?? jSal.max;
  if (!payLevel && !min && !max) return <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>—</td>;
  return (
    <td className="center" style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      {payLevel != null && <div className="sal-level" style={{ fontWeight: 700, color: "var(--ink)", fontSize: "13px" }}>Level {payLevel}</div>}
      {(min || max) ? (
        <div className="sal-range" style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "2px" }}>{min ? fmtMoney(min) : ""}{min && max ? " – " : ""}{max ? fmtMoney(max) : ""}</div>
      ) : null}
    </td>
  );
}

// ── CATEGORY VAC CELL ─────────────────────────────────────────────────────────
function CatVacCell({ post, job }: { post: any; job: any }) {
  const catVac = post?.categoryWiseVacancy || job?.categoryWiseVacancy;
  const hasData = hasCategoryData(catVac);
  if (!hasData) return <td className="center mono" style={{ fontSize: 15, padding: "10px 12px", border: "1px solid var(--border)", color: "var(--ink-muted)" }}>—</td>;
  return (
    <td style={{ padding: "10px 12px", border: "1px solid var(--border)", verticalAlign: "middle" }}>
      <div className="cat-vac-grid">
        {catCols.map((c) => (
          <div key={c} className="cat-vac-chip">
            <span className="cat-vac-chip-label">{CAT_LABELS[c]}</span>
            <span className="cat-vac-chip-val">{catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"}</span>
          </div>
        ))}
      </div>
    </td>
  );
}

const Editable = ({ editable, value, onUpdate, path, type = 'text', placeholder }: any) => {
  const [localValue, setLocalValue] = React.useState(value || "");

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
    setLocalValue(e.target.value);
  };

  if (type === 'textarea') {
    return (
      <textarea
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
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
      placeholder={placeholder}
      className="jd-edit-field"
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleBlur();
      }}
    />
  );
};

export default function RecruitmentPreview({ job, editable, onUpdate }: any) {
  if (!job) return null;

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

  const rawPosts: any[] = (job.posts || []).length > 0 ? job.posts : [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }];

  // Salary derivation
  const salaryValues = rawPosts.map((p) => `${p.salary?.payLevel || ''}|${p.salary?.min || ''}|${p.salary?.max || ''}`);
  const allSameSalary = salaryValues.every((v) => v === salaryValues[0]);
  const heroSal = rawPosts[0]?.salary || job.salary || {};

  return (
    <div className="jd">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="jd-wrap">

        {/* MASTHEAD */}
        <header className="jd-masthead">
          <div className="jd-eyebrow">Official Recruitment Notice</div>
          <h1 className="jd-title">
            <Editable editable={editable} path="title" value={job.title} onUpdate={onUpdate} />
          </h1>
          <div className="jd-advert">
            Advt. No. <Editable editable={editable} path="advertisementNumber" value={job.advertisementNumber} onUpdate={onUpdate} />
          </div>
          <div className="jd-tags">
            {job.tags?.slice(0, 8).map((t: string) => <span key={t} className="jd-tag">{t}</span>)}
          </div>
        </header>

        {/* HERO STRIP */}
        <div className="jd-hero">
          <div className="jd-hero-cell accent">
            <div className="jd-hero-label">Total Vacancies</div>
            <div className="jd-hero-value">{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</div>
            <div className="jd-hero-sub">Posts to be filled</div>
          </div>
          <div className="jd-hero-cell">
            <div className="jd-hero-label">Application Start Date</div>
            <div className="jd-hero-value" style={{ fontSize: 20 }}>
              {dates.applicationStartDate ? fmtDate(dates.applicationStartDate) : "TBA"}
            </div>
            <div className="jd-hero-sub">Application opens</div>
          </div>
          <div className="jd-hero-cell">
            <div className="jd-hero-label">Application Last Date</div>
            <div className="jd-hero-value" style={{ fontSize: 19 }}>
              {dates.applicationLastDate ? fmtDate(dates.applicationLastDate) : "—"}
            </div>
            <div className="jd-hero-sub">Application deadline</div>
          </div>
        </div>

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

        <div className="jd-section">
          <span className="jd-section-icon"><IconBriefcase /></span>
          <span className="jd-section-title">Recruitment Overview</span>
        </div>
        <table className="jd-table">
          <tbody>
            <tr><td className="label">Organisation</td><td><Editable editable={editable} path="organization" value={job.organization} onUpdate={onUpdate} /></td></tr>
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
                  <button onClick={() => onUpdate('pwdEligible', !job.pwdEligible)} className={`text-[10px] font-bold px-2 py-1 rounded ${job.pwdEligible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
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
                  <button onClick={() => onUpdate('femaleOnly', !job.femaleOnly)} className={`text-[10px] font-bold px-2 py-1 rounded ${job.femaleOnly ? 'bg-crimson/10 text-crimson' : 'bg-gray-100 text-gray-400'}`}>
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
                  <button onClick={() => onUpdate('exServicemanQuota', !job.exServicemanQuota)} className={`text-[10px] font-bold px-2 py-1 rounded ${job.exServicemanQuota ? 'bg-navy/10 text-navy' : 'bg-gray-100 text-gray-400'}`}>
                    {job.exServicemanQuota ? 'YES' : 'NO'}
                  </button>
                ) : (
                  job.exServicemanQuota ? <span style={{ fontWeight: 600 }}>Yes</span> : "No"
                )}
              </td>
            </tr>

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

        {/* FEE */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconCreditCard /></span>
          <span className="jd-section-title">Application Fee</span>
        </div>
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

        {/* VACANCIES */}
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
                  <td style={{ verticalAlign: "top", fontWeight: 600, fontSize: 14, paddingTop: 12 }}>
                    {p.name}
                  </td>
                  <td className="center bold mono" style={{ verticalAlign: "middle", padding: "10px 12px", border: "1px solid var(--border)", fontSize: 15, whiteSpace: "nowrap" }}>
                    {p.totalVacancy != null ? p.totalVacancy.toLocaleString("en-IN") : "—"}
                  </td>
                  <CatVacCell post={p} job={job} />
                  <AgeCell post={p} job={job} />
                  <SalaryCell post={p} job={job} />
                  <QualCell
                    post={p}
                    editable={editable}
                    onUpdate={onUpdate}
                    postIndex={idx}
                    isGeneral={!(job.posts || []).length}
                  />
                </tr>
              ))}
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

          return (
            <>
              {selSteps.length > 0 && (
                <>
                  <div className="jd-section">
                    <span className="jd-section-icon"><IconBriefcase /></span>
                    <span className="jd-section-title">Selection Process</span>
                  </div>
                  <div style={{ padding: "0 4px", fontSize: 14 }}>
                    {selSteps.map((stage: string, idx: number) => (
                      <div key={idx} style={{ display: "flex", gap: "10px", marginBottom: "8px", alignItems: "flex-start" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--navy)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", flexShrink: 0, fontWeight: 700 }}>{idx + 1}</div>
                        <div style={{ color: "var(--ink-light)", lineHeight: "1.4" }}>{stage}</div>
                      </div>
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
          );
        })()}

        {/* TIMELINE */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconCalendar /></span>
          <span className="jd-section-title">Timeline</span>
        </div>
        <table className="jd-table">
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
                              {val}
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
                      if (typeof val === 'string' && val.startsWith('http')) {
                        return (
                          <a href={val} target="_blank" rel="noreferrer" style={{ color: "var(--blue)", textDecoration: "underline" }}>
                            {val}
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

      </div>
    </div>
  );
}