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

// ── CONSTANTS ────────────────────────────────────────────────────────────────
const CAT_LABELS: Record<string, string> = { general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD" };
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"] as const;

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
    margin: 36px 0 12px;
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

function qualLabel(q: any): string {
    if (!q) return "Not specified";
    if (typeof q === "string") return q;
    if (q.course !== undefined) {
        const courseStr = Array.isArray(q.course) ? q.course.join(" / ") : String(q.course);
        const validBranches = Array.isArray(q.branch) ? q.branch.filter((b: string) => b && b.toLowerCase() !== "any") : [];
        const branchStr = validBranches.length > 0 ? ` in ${validBranches.join(", ")}` : "";
        const extra = q.extraQualificationText?.trim() || "";
        return `${courseStr}${branchStr}${extra ? ` — ${extra}` : ""}`;
    }
    if (q.name !== undefined) {
        const branch = q.branches?.length && !(q.branches.length === 1 && q.branches[0] === "any") ? ` in ${q.branches.join(" / ")}` : "";
        const extras: string[] = [];
        if (q.streamRequired) extras.push(`Stream: ${q.streamRequired}`);
        if (q.minMarksPercent) extras.push(`Min. ${q.minMarksPercent}% marks`);
        if (q.minExperienceYears) extras.push(`${q.minExperienceYears} yr exp.`);
        return `${q.name || "Degree"}${branch}${extras.length ? " — " + extras.join("; ") : ""}`;
    }
    return "Not specified";
}

function qualFingerprint(p: any): string {
    const qual = p.qualification;
    if (qual && !Array.isArray(qual) && qual.course !== undefined) {
        const courseKey = (Array.isArray(qual.course) ? [...qual.course].sort() : [qual.course]).join(",");
        const branchKey = (Array.isArray(qual.branch) ? [...qual.branch].sort() : []).join(",");
        const extraKey = qual.extraQualificationText?.trim() || "";
        return `course:${courseKey}|branch:${branchKey}|extra:${extraKey}|app:${p.appearingEligible ? p.appearingConditions || "yes" : "no"}`;
    }
    const quals: any[] = Array.isArray(qual) ? qual : (qual ? [qual] : []);
    return quals.map(qualLabel).join(" | ") + "|app:" + (p.appearingEligible ? p.appearingConditions || "yes" : "no");
}

function groupPostsByQual(posts: any[]) {
    const map = new Map<string, any>();
    for (const p of posts) {
        const fp = qualFingerprint(p);
        if (!map.has(fp)) {
            const qual = p.qualification;
            let qualTexts = (qual && !Array.isArray(qual) && qual.course !== undefined) ? [qualLabel(qual)] : (Array.isArray(qual) ? qual : (qual ? [qual] : [])).map(qualLabel).filter(Boolean);
            if (qualTexts.length === 0) qualTexts = ["Not specified"];
            map.set(fp, {
                qualTexts,
                qualNote: p.qualificationNote || null,
                appearingNote: p.appearingEligible ? (p.appearingConditions || "Appearing candidates eligible") : null,
                posts: [],
            });
        }
        map.get(fp)!.posts.push(p);
    }
    return Array.from(map.values());
}

const Editable = ({ editable, value, onUpdate, path }: any) => {
  if (!editable) return <span>{value}</span>;
  return (
    <input
      value={value || ""}
      onChange={(e) => onUpdate(path, e.target.value)}
      className="jd-edit-field"
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

  const timelineRows = [
    { label: "Notification Released", key: "notificationRelease" },
    { label: "Application Opens", key: "startDate" },
    { label: "Application Closes", key: "lastDate", highlight: true },
    { label: "Fee Payment Last Date", key: "feePaymentLastDate", highlight: true },
    { label: "Correction Window Closes", key: "correctionWindowLastDate" },
    { label: "Examination Date", key: "examDate", highlight: true },
  ];

  const rawPosts: any[] = (job.posts || []).length > 0 ? job.posts : [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }];
  const postGroups = groupPostsByQual(rawPosts);
  const overallCatVac = job.categoryWiseVacancyTotal || {};
  const hasOverallCat = hasCategoryData(overallCatVac);

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
            <div className="jd-hero-label">Age Limit</div>
            <div className="jd-hero-value" style={{ fontSize: 22 }}>
              {al.min && al.max ? `${al.min}–${al.max}` : al.max ? `≤ ${al.max}` : "—"}
            </div>
            <div className="jd-hero-sub">years{al.asOnDate ? ` as on ${fmtDate(al.asOnDate)}` : ""}</div>
          </div>
          <div className="jd-hero-cell">
            <div className="jd-hero-label">Last Date</div>
            <div className="jd-hero-value" style={{ fontSize: 19 }}>
              {dates.lastDate ? fmtDate(dates.lastDate) : "—"}
            </div>
            <div className="jd-hero-sub">Application deadline</div>
          </div>
        </div>

        {/* LEDE */}
        {(job.description || job.shortInfo) && (
          <div className="jd-lede">{job.description || job.shortInfo}</div>
        )}

        {/* OVERVIEW */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconBriefcase /></span>
          <span className="jd-section-title">Recruitment Overview</span>
        </div>
        <table className="jd-table">
          <tbody>
            <tr><td className="label">Organisation</td><td><Editable editable={editable} path="organization" value={job.organization} onUpdate={onUpdate} /></td></tr>
            <tr><td className="label">Govt. Type</td><td><Editable editable={editable} path="type" value={job.type} onUpdate={onUpdate} /></td></tr>
            <tr><td className="label">Location</td><td>{job.location?.join(", ") || "All India"}</td></tr>
            {(job.salary?.min || job.salary?.max) && (
              <tr>
                <td className="label">Salary</td>
                <td className="bold">
                  {job.salary?.min ? fmtMoney(job.salary.min) : ""}
                  {job.salary?.max ? ` – ${fmtMoney(job.salary.max)}` : ""}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* VACANCIES */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconUsers /></span>
          <span className="jd-section-title">Post-wise Vacancy</span>
        </div>
        <div className="tbl-scroll">
          <table className="jd-table">
            <thead>
              <tr>
                <th style={{ minWidth: 210 }}>Post / Designation</th>
                <th className="center" style={{ width: 70 }}>Total</th>
                {hasOverallCat && catCols.map(c => <th className="center" key={c} style={{ width: 50 }}>{CAT_LABELS[c]}</th>)}
                <th style={{ minWidth: 280 }}>Qualification Details</th>
              </tr>
            </thead>
            <tbody>
              {postGroups.flatMap((grp, gi) => (
                grp.posts.map((p: any, pi: number) => {
                  const catVac = p.categoryWiseVacancy || {};
                  return (
                    <tr key={`${gi}-${pi}`}>
                      <td>{p.name}</td>
                      <td className="center mono bold" style={{ fontSize: 15, whiteSpace: "nowrap" }}>
                        {p.totalVacancy != null ? p.totalVacancy.toLocaleString("en-IN") : "—"}
                      </td>
                      {hasOverallCat && catCols.map(c => (
                        <td key={c} className="center mono" style={{ whiteSpace: "nowrap" }}>
                          {catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"}
                        </td>
                      ))}
                      {pi === 0 && (
                        <td rowSpan={grp.posts.length} style={{ verticalAlign: "top", background: "#fff" }}>
                           <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                              {grp.qualTexts.map((qt: string, qIdx: number) => (
                                <React.Fragment key={qIdx}>
                                  <div style={{ fontWeight: 600, color: "var(--navy)", lineHeight: 1.5 }}>{qt}</div>
                                  {qIdx < grp.qualTexts.length - 1 && (
                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                      <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--ink-muted)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)" }}>OR</span>
                                      <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                           </div>
                           {grp.appearingNote && <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginTop: 12, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>{grp.appearingNote}</div>}
                           {grp.qualNote && <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 8, borderLeft: "3px solid var(--amber)", paddingLeft: 10, background: "var(--amber-bg)", padding: "8px 10px", borderRadius: "0 4px 4px 0" }}>{grp.qualNote}</div>}
                        </td>
                      )}
                    </tr>
                  );
                })
              ))}
              <tr className="tr-total">
                <td>Total (All Posts)</td>
                <td className="center mono" style={{ whiteSpace: "nowrap" }}>{job.totalVacancy?.toLocaleString("en-IN") ?? "—"}</td>
                {hasOverallCat && catCols.map(c => <td key={c} className="center mono" style={{ whiteSpace: "nowrap" }}>{overallCatVac[c] != null ? overallCatVac[c].toLocaleString("en-IN") : "—"}</td>)}
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* AGE LIMIT */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconUsers /></span>
          <span className="jd-section-title">Age Limit</span>
        </div>
        <table className="jd-table">
          <thead><tr><th>Category</th><th className="center">Min</th><th className="center">Max</th><th>As on Date</th></tr></thead>
          <tbody>
            <tr>
              <td>General / UR</td>
              <td className="center mono">{al.min ? `${al.min} yrs` : "—"}</td>
              <td className="center mono bold">{al.max ? `${al.max} yrs` : "—"}</td>
              <td className="mono">{al.asOnDate ? fmtDate(al.asOnDate) : "—"}</td>
            </tr>
            {relaxRows.map(r => (
              <tr key={r.label}>
                <td>{r.label}</td>
                <td className="center mono">{al.min ? `${al.min} yrs` : "—"}</td>
                <td className="center mono green">{al.max ? `${al.max + r.val} yrs (+${r.val})` : "—"}</td>
                <td className="mono">{al.asOnDate ? fmtDate(al.asOnDate) : "—"}</td>
              </tr>
            ))}
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

        {/* TIMELINE */}
        <div className="jd-section">
          <span className="jd-section-icon"><IconCalendar /></span>
          <span className="jd-section-title">Timeline</span>
        </div>
        <table className="jd-table">
          <tbody>
            {timelineRows.filter(row => dates[row.key as keyof typeof dates]).map(row => (
              <tr key={row.key} className={row.highlight ? "tr-highlight" : ""}>
                <td className="label">{row.label}</td>
                <td className="bold">{fmtDate(dates[row.key as keyof typeof dates] as string)}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
    </div>
  );
}