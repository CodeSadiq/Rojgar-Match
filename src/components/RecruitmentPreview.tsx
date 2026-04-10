'use client';

import React from "react";
import { fmtDate, fmtMoney } from "@/lib/helpers";

// ── ICONS ────────────────────────────────────────────────────────────────────
const IconInfo = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>;
const IconCalendar = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
const IconUsers = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><circle cx="19" cy="7" r="4" /></svg>;
const IconBriefcase = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
const IconArrow = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></svg>;

// ── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  .jd-preview {
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
    --blue:       #1e40af;
    --blue-bg:    #eff6ff;
    --amber-bg:   #fffbeb;
    --amber:      #78350f;

    font-family: var(--sans);
    font-size: 15px;
    color: var(--ink);
    line-height: 1.5;
    background: #fff;
    padding: 40px;
    border-radius: 40px;
  }

  /* ── MASTHEAD ── */
  .jd-masthead {
    border-bottom: 3px double var(--border);
    padding: 0 0 22px;
    margin-bottom: 24px;
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
  .jd-eyebrow::before { content: ""; width: 24px; height: 1px; background: var(--border); }
  .jd-title {
    font-family: var(--serif);
    font-size: 32px;
    font-weight: 700;
    line-height: 1.15;
    color: var(--navy);
    margin-bottom: 10px;
  }
  .jd-advert {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 500;
    color: var(--ink-muted);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .jd-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; }
  .jd-tag {
    font-size: 10.5px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    background: var(--paper-alt);
    color: var(--ink-muted);
    padding: 3px 10px;
    border: 1px solid var(--border);
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
  .jd-hero-cell.accent .jd-hero-label { color: rgba(255,255,255,0.4); }
  .jd-hero-value {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1.1;
  }
  .jd-hero-cell.accent .jd-hero-value { color: #fff; }
  .jd-hero-sub {
    font-size: 11px;
    color: var(--ink-muted);
    font-weight: 500;
    margin-top: 4px;
  }
  .jd-hero-cell.accent .jd-hero-sub { color: rgba(255,255,255,0.6); }

  .jd-lede {
    font-size: 16px;
    font-weight: 500;
    color: var(--ink-light);
    line-height: 1.6;
    margin-bottom: 32px;
    padding: 0 4px;
  }

  /* ── SECTIONS ── */
  .jd-section {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 40px 0 16px;
    padding-bottom: 8px;
    border-bottom: 1.5px solid var(--navy);
  }
  .jd-section-icon { color: var(--navy); display: flex; }
  .jd-section-title {
    font-family: var(--mono);
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.14em;
    color: var(--navy);
  }

  /* ── TABLES ── */
  .jd-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
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
  .jd-table th.center, .jd-table td.center { text-align: center; }
  .jd-table td {
    padding: 10px 12px;
    border: 1px solid var(--border);
    vertical-align: middle;
  }
  .jd-table td.label {
    background: var(--paper-alt);
    font-family: var(--mono);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--ink-muted);
    width: 170px;
  }
  .jd-table .mono { font-family: var(--mono); }
  .jd-table .bold { font-weight: 700; }

  /* ── STAGES ── */
  .jd-stages {
    display: flex;
    align-items: flex-start;
    overflow-x: auto;
    padding: 6px 0 12px;
    gap: 4px;
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

  /* ── EDIT MODE UTILS ── */
  .jd-preview.is-editing .not-editable {
    opacity: 0.35;
    filter: grayscale(1);
    pointer-events: none;
    transition: all 400ms ease;
  }

  /* ── RESPONSIVENESS ── */
  @media (max-width: 768px) {
    .jd-preview { padding: 24px 16px; border-radius: 12px; }
    .jd-title { font-size: 24px; }
    .jd-hero { grid-template-columns: 1fr; border-bottom: 2px solid var(--navy); }
    .jd-hero-cell { border-bottom: 1px solid var(--border); }
    .jd-hero-cell:last-child { border-bottom: none; }
    
    .overflow-x-auto {
      margin: 0 -16px;
      padding: 0 16px;
      -webkit-overflow-scrolling: touch;
    }
    .jd-table { min-width: 500px; }
    .jd-table td.label { width: 120px; }
    
    .jd-stage { min-width: 100px; }
    .jd-stage-label { font-size: 11px; }
  }
`;

const CAT_LABELS: Record<string, string> = {
    general: "GEN", ews: "EWS", obc: "OBC", sc: "SC", st: "ST", pwd: "PwBD",
};
const catCols = ["general", "ews", "obc", "sc", "st", "pwd"] as const;

function hasCategoryData(catObj: any): boolean {
    if (!catObj) return false;
    return Object.values(catObj).some((v) => v !== null && v !== undefined);
}

// ── QUALIFICATION LABEL ───────────────────────────────────────────────────────
// Supports:
//   v9 (new): posts[].qualification = { course: string[], branch: string[], extraQualificationText: string }
//   v8 (legacy): posts[].qualification = array of objects with name/level/branches/...
function qualLabel(q: any): string {
    if (!q) return "Not specified";
    if (typeof q === "string") return q;

    // ── v9 schema: single object with course / branch / extraQualificationText ──
    if (q.course !== undefined) {
        const courseStr = Array.isArray(q.course)
            ? q.course.join(" / ")
            : String(q.course);

        const validBranches = Array.isArray(q.branch)
            ? q.branch.filter((b: string) => b && b.toLowerCase() !== "any")
            : [];
        const branchStr = validBranches.length > 0
            ? ` in ${validBranches.join(", ")}`
            : "";

        const extra = q.extraQualificationText?.trim() || "";
        return `${courseStr}${branchStr}${extra ? ` — ${extra}` : ""}`;
    }

    // ── v8 legacy schema: single qualification object (name / branches / ...) ──
    if (q.name !== undefined) {
        const branch =
            q.branches?.length && !(q.branches.length === 1 && q.branches[0] === "any")
                ? ` in ${q.branches.join(" / ")}`
                : "";
        const extras: string[] = [];
        if (q.streamRequired) extras.push(`Stream: ${q.streamRequired}`);
        if (q.compulsorySubjects?.length) extras.push(`Compulsory: ${q.compulsorySubjects.join(", ")}`);
        if (q.minMarksPercent) extras.push(`Min. ${q.minMarksPercent}% marks`);
        if (q.minExperienceYears) extras.push(`${q.minExperienceYears} yr exp.`);
        q.extraConditions
            ?.filter((ec: string) => !ec.toLowerCase().includes("final year"))
            .forEach((ec: string) => extras.push(ec));
        return `${q.name || "Degree"}${branch}${extras.length ? " — " + extras.join("; ") : ""}`;
    }

    return "Not specified";
}

// ── FINGERPRINT ───────────────────────────────────────────────────────────────
// Produces a stable key for grouping posts that share identical qualification details.
function qualFingerprint(p: any): string {
    const qual = p.qualification;

    // v9: single object
    if (qual && !Array.isArray(qual) && qual.course !== undefined) {
        const courseKey = (Array.isArray(qual.course) ? [...qual.course].sort() : [qual.course]).join(",");
        const branchKey = (Array.isArray(qual.branch) ? [...qual.branch].sort() : []).join(",");
        const extraKey = qual.extraQualificationText?.trim() || "";
        return `course:${courseKey}|branch:${branchKey}|extra:${extraKey}|app:${p.appearingEligible ? p.appearingConditions || "yes" : "no"}`;
    }

    // v8 legacy: array of qualification objects
    const quals: any[] = Array.isArray(qual) ? qual : (qual ? [qual] : []);
    return (
        quals.map(qualLabel).join(" | ") +
        "|note:" + (p.qualificationNote || "") +
        "|app:" + (p.appearingEligible ? p.appearingConditions || "yes" : "no")
    );
}

// ── GROUP POSTS ───────────────────────────────────────────────────────────────
interface QualGroup {
    // One display label per unique qualification "path" (for OR rendering)
    qualTexts: string[];
    // Legacy v8 qualificationNote (null in v9 — extraQualificationText is already in qualTexts)
    qualNote: string | null;
    appearingNote: string | null;
    posts: any[];
}

function groupPostsByQual(posts: any[]): QualGroup[] {
    const map = new Map<string, QualGroup>();

    for (const p of posts) {
        const fp = qualFingerprint(p);

        if (!map.has(fp)) {
            const qual = p.qualification;
            let qualTexts: string[] = [];

            if (qual && !Array.isArray(qual) && qual.course !== undefined) {
                // ── v9: single object → one label string ──
                const label = qualLabel(qual);
                qualTexts = label ? [label] : ["Not specified"];
            } else {
                // ── v8 legacy: array of objects → one label per object ──
                const rawQuals = Array.isArray(qual) ? qual : (qual ? [qual] : []);
                qualTexts = rawQuals.map(qualLabel).filter(Boolean);
                if (qualTexts.length === 0) qualTexts = ["Not specified"];
            }

            map.set(fp, {
                qualTexts,
                // qualificationNote only exists in v8; v9 puts everything in extraQualificationText
                qualNote: p.qualificationNote || null,
                appearingNote: p.appearingEligible
                    ? (p.appearingConditions || "Appearing candidates are eligible")
                    : null,
                posts: [],
            });
        }

        map.get(fp)!.posts.push(p);
    }

    return Array.from(map.values());
}

const Editable = ({ path, value, className, multiline = false, style = {}, editable, onUpdate }: any) => {
    const [localVal, setLocalVal] = React.useState(value || "");

    React.useEffect(() => {
        setLocalVal(value || "");
    }, [value]);

    const handleChange = (newVal: string) => {
        setLocalVal(newVal);
        onUpdate?.(path, newVal);
    };

    if (!editable) return <span className={className} style={style}>{value}</span>;

    if (multiline) {
        return (
            <textarea
                className={`${className} bg-blue-50/50 border-b border-blue-400 outline-none w-full resize-none`}
                style={style}
                value={localVal}
                onChange={(e) => handleChange(e.target.value)}
                rows={3}
            />
        );
    }
    return (
        <input
            className={`${className} bg-blue-50/50 border-b border-blue-400 outline-none w-full`}
            style={style}
            value={localVal}
            onChange={(e) => handleChange(e.target.value)}
        />
    );
};

const EditableKey = ({ parentPath, oldKey, onRenameKey, className }: any) => {
    const [localKey, setLocalKey] = React.useState(oldKey);
    React.useEffect(() => { setLocalKey(oldKey); }, [oldKey]);

    return (
        <input
            className={className}
            value={localKey}
            onChange={(e) => setLocalKey(e.target.value)}
            onBlur={() => onRenameKey?.(parentPath, oldKey, localKey)}
        />
    );
};

export default function RecruitmentPreview({
    job,
    editable = false,
    onUpdate,
    onRenameKey,
    onDeleteKey
}: {
    job: any,
    editable?: boolean,
    onUpdate?: (path: string, value: any) => void,
    onRenameKey?: (parentPath: string, oldKey: string, newKey: string) => void,
    onDeleteKey?: (parentPath: string, key: string) => void
}) {
    if (!job) return null;

    const al = job.ageLimit || {};
    const af = job.applicationFee || { paymentMode: [] };
    const dates = job.importantDates || {};

    // Fee grouping
    const feeMap: Record<string, string[]> = {};
    Object.entries(af).forEach(([cat, val]) => {
        if (cat === "paymentMode" || val === null || val === undefined) return;
        const k = String(val);
        if (!feeMap[k]) feeMap[k] = [];
        feeMap[k].push(CAT_LABELS[cat] || cat.toUpperCase());
    });

    // Build rawPosts — handle both v9 (no root-level qualification array) and v8
    const rawPosts: any[] =
        (job.posts || []).length > 0
            ? job.posts
            : job.qualification?.length
                ? [{ name: "General Cadre", qualification: job.qualification, totalVacancy: job.totalVacancy }]
                : [];

    const postGroups = groupPostsByQual(rawPosts);
    const overallCatVac = job.categoryWiseVacancyTotal || {};
    const hasOverallCat = hasCategoryData(overallCatVac);

    return (
        <div className={`jd-preview ${editable ? 'is-editing' : ''}`}>
            <style dangerouslySetInnerHTML={{ __html: styles }} />

            {/* ── MASTHEAD ── */}
            <header className="jd-masthead">
                <div className="jd-eyebrow">Official Recruitment Notice</div>
                <h1 className="jd-title">
                    <Editable editable={editable} onUpdate={onUpdate} path="title" value={job.title} />
                </h1>
                {job.advertisementNumber && (
                    <div className="jd-advert">
                        Advt. No. <Editable editable={editable} onUpdate={onUpdate} path="advertisementNumber" value={job.advertisementNumber} />
                    </div>
                )}
                {job.tags?.length > 0 && (
                    <div className="jd-tags not-editable">
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
                    <div className="jd-hero-value">
                        <Editable editable={editable} onUpdate={onUpdate} path="totalVacancy" value={job.totalVacancy} />
                    </div>
                    <div className="jd-hero-sub">Posts to be filled</div>
                </div>
                <div className="jd-hero-cell">
                    <div className="jd-hero-label">Age Limit</div>
                    <div className="jd-hero-value">
                        <Editable editable={editable} onUpdate={onUpdate} path="ageLimit.min" value={al.min} style={{ width: '40px' }} />
                        –
                        <Editable editable={editable} onUpdate={onUpdate} path="ageLimit.max" value={al.max} style={{ width: '40px' }} />
                    </div>
                    <div className="jd-hero-sub">
                        years{al.asOnDate ? ` as on ${fmtDate(al.asOnDate)}` : ""}
                    </div>
                </div>
                <div className="jd-hero-cell">
                    <div className="jd-hero-label">Last Date</div>
                    <div className="jd-hero-value">
                        {dates.lastDate ? fmtDate(dates.lastDate) : "—"}
                    </div>
                    <div className="jd-hero-sub">Application deadline</div>
                </div>
            </div>

            {/* ── LEDE ── */}
            {(job.description || job.shortInfo) && (
                <div className="jd-lede">
                    <Editable editable={editable} onUpdate={onUpdate} path="description" value={job.description || job.shortInfo} multiline />
                </div>
            )}

            {/* ── OVERVIEW ── */}
            <div className="jd-section">
                <span className="jd-section-icon"><IconBriefcase /></span>
                <span className="jd-section-title">Recruitment Overview</span>
            </div>
            <table className="jd-table">
                <tbody>
                    <tr>
                        <td className="label">Organization</td>
                        <td className="bold">
                            <Editable editable={editable} onUpdate={onUpdate} path="organization" value={job.organization || job.org} />
                        </td>
                    </tr>
                    {job.department && (
                        <tr>
                            <td className="label">Department</td>
                            <td>
                                <Editable editable={editable} onUpdate={onUpdate} path="department" value={job.department} />
                            </td>
                        </tr>
                    )}
                    <tr>
                        <td className="label">Post Names</td>
                        <td style={{ fontSize: 13, lineHeight: 1.4 }}>
                            {job.postNames?.length ? job.postNames.join(", ") : job.title}
                        </td>
                    </tr>
                    <tr>
                        <td className="label">Job Type</td>
                        <td>
                            <Editable editable={editable} onUpdate={onUpdate} path="type" value={job.type || "Full Time / Permanent"} />
                        </td>
                    </tr>
                    <tr>
                        <td className="label">Location</td>
                        <td>
                            <Editable editable={editable} onUpdate={onUpdate} path="location" value={Array.isArray(job.location) ? job.location.join(", ") : job.location || "All India"} />
                        </td>
                    </tr>
                    {job.salary && (
                        <tr>
                            <td className="label">Scale of Pay</td>
                            <td className="bold">
                                {typeof job.salary === 'object' ? (
                                    <div className="flex items-center gap-1">
                                        <Editable editable={editable} onUpdate={onUpdate} path="salary.min" value={job.salary.min} />
                                        <span> to </span>
                                        <Editable editable={editable} onUpdate={onUpdate} path="salary.max" value={job.salary.max} />
                                    </div>
                                ) : (
                                    <Editable editable={editable} onUpdate={onUpdate} path="salary" value={job.salary} />
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* ── POST-WISE VACANCY ── */}
            <div className="not-editable">
                <div className="jd-section">
                    <span className="jd-section-icon"><IconUsers /></span>
                    <span className="jd-section-title">Post-wise Vacancy</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="jd-table">
                        <thead>
                            <tr>
                                <th style={{ minWidth: 210 }}>Post / Designation</th>
                                <th className="center" style={{ width: 70 }}>Total</th>
                                {hasOverallCat && catCols.map(c => (
                                    <th className="center" key={c} style={{ width: 50 }}>{CAT_LABELS[c]}</th>
                                ))}
                                <th style={{ minWidth: 240 }}>Qualification Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {postGroups.flatMap((grp, gi) => {
                                return grp.posts.map((p: any, pi: number) => {
                                    const catVac = p.categoryWiseVacancy || {};
                                    const hasPostCat = hasCategoryData(catVac);
                                    return (
                                        <tr key={`${gi}-${pi}`}>
                                            <td>{p.name}</td>
                                            <td className="center mono bold">
                                                {p.totalVacancy != null ? p.totalVacancy.toLocaleString("en-IN") : "—"}
                                            </td>
                                            {hasOverallCat && catCols.map(c => (
                                                <td key={c} className="center mono"
                                                    style={{ color: hasPostCat && catVac[c] != null ? "var(--navy)" : "var(--ink-muted)" }}>
                                                    {hasPostCat && catVac[c] != null ? catVac[c].toLocaleString("en-IN") : "—"}
                                                </td>
                                            ))}
                                            {pi === 0 && (
                                                <td rowSpan={grp.posts.length} style={{ verticalAlign: "top", background: "#fff" }}>
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                                        {grp.qualTexts.map((qt, qIdx) => (
                                                            <React.Fragment key={qIdx}>
                                                                <div style={{ fontWeight: 600, color: "var(--navy)", lineHeight: 1.5 }}>
                                                                    {qt}
                                                                </div>
                                                                {qIdx < grp.qualTexts.length - 1 && (
                                                                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                                                                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--ink-muted)", background: "var(--paper-alt)", padding: "2px 6px", borderRadius: "4px", border: "1px solid var(--border)", letterSpacing: "0.1em" }}>OR</span>
                                                                        <div style={{ flex: 1, height: "1px", background: "var(--border)" }}></div>
                                                                    </div>
                                                                )}
                                                            </React.Fragment>
                                                        ))}
                                                    </div>

                                                    {/* Appearing eligibility note */}
                                                    {grp.appearingNote && (
                                                        <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600, marginTop: 12, paddingTop: 8, borderTop: "1px dashed var(--border)" }}>
                                                            {grp.appearingNote}
                                                        </div>
                                                    )}

                                                    {/*
                                                      v8 legacy: qualificationNote rendered as amber callout.
                                                      v9: extraQualificationText is already embedded inside qualTexts — no separate block needed.
                                                    */}
                                                    {grp.qualNote && (
                                                        <div style={{ fontSize: 12, color: "var(--amber)", marginTop: 8, borderLeft: "3px solid var(--amber)", paddingLeft: 10, background: "var(--amber-bg)", padding: "8px 10px", borderRadius: "0 4px 4px 0" }}>
                                                            <strong>Note:</strong> {grp.qualNote}
                                                        </div>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    );
                                });
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── FEE SCHEDULE ── */}
            {Object.keys(feeMap).length > 0 && (
                <div className="not-editable">
                    <div className="jd-section">
                        <span className="jd-section-icon"><IconInfo /></span>
                        <span className="jd-section-title">Fee Schedule</span>
                    </div>
                    <table className="jd-table">
                        <thead>
                            <tr>
                                <th style={{ width: "60%" }}>Category Group</th>
                                <th>Application Fee</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(feeMap).map(([fee, cats]) => (
                                <tr key={fee}>
                                    <td className="bold">{cats.join(", ")}</td>
                                    <td className="mono bold">
                                        {Number(fee) === 0 ? "Exempt — ₹0" : `₹${Number(fee).toLocaleString("en-IN")}`}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── SELECTION PROCESS ── */}
            {job.selectionProcess?.length > 0 && (
                <div className="not-editable">
                    <div className="jd-section">
                        <span className="jd-section-icon"><IconBriefcase /></span>
                        <span className="jd-section-title">Selection Process</span>
                    </div>
                    <div className="jd-stages">
                        {job.selectionProcess.map((stage: string, idx: number) => (
                            <React.Fragment key={idx}>
                                <div className="jd-stage">
                                    <div className="jd-stage-num">{idx + 1}</div>
                                    <div className="jd-stage-label">{stage}</div>
                                </div>
                                {idx < job.selectionProcess.length - 1 && (
                                    <div className="jd-stage-arrow"><IconArrow /></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>
            )}

            {/* ── HOW TO APPLY ── */}
            {job.applicationProcess?.length > 0 && (
                <div className="not-editable">
                    <div className="jd-section">
                        <span className="jd-section-icon"><IconInfo /></span>
                        <span className="jd-section-title">How to Apply</span>
                    </div>
                    <div className="jd-steps">
                        {job.applicationProcess.map((step: string, idx: number) => (
                            <div key={idx} className="jd-step">
                                <div className="jd-step-num">{idx + 1}</div>
                                <p className="jd-step-text">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── IMPORTANT DATES ── */}
            <div className="jd-section">
                <span className="jd-section-icon"><IconCalendar /></span>
                <span className="jd-section-title">Important Dates</span>
            </div>
            <table className="jd-table">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th className="center">Scheduled Date</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(dates).filter(([k, v]) => v || editable).map(([k, v]) => (
                        <tr key={k}>
                            <td className="label" style={{ background: 'none', borderRight: 'none', width: 'auto' }}>
                                {editable ? (
                                    <div className="flex items-center gap-2 group">
                                        <button
                                            onClick={() => onDeleteKey?.('importantDates', k)}
                                            className="opacity-0 group-hover:opacity-100 text-red hover:scale-110 transition-all text-xs"
                                            title="Delete Entry"
                                        >
                                            ✕
                                        </button>
                                        <EditableKey
                                            parentPath="importantDates"
                                            oldKey={k}
                                            onRenameKey={onRenameKey}
                                            className="bg-blue-50/50 border-b border-blue-400 outline-none w-full text-[11px] font-bold uppercase tracking-wider"
                                        />
                                    </div>
                                ) : (
                                    k.replace(/([A-Z])/g, ' $1')
                                )}
                            </td>
                            <td className="center bold">
                                <Editable editable={editable} onUpdate={onUpdate} path={`importantDates.${k}`} value={v as string} />
                                {!editable && <div className="text-[10px] text-gray-400 font-normal">{fmtDate(v as string)}</div>}
                            </td>
                        </tr>
                    ))}
                    {editable && (
                        <tr>
                            <td colSpan={2} className="p-2">
                                <button
                                    onClick={() => onUpdate?.(`importantDates.newEvent_${Date.now().toString().slice(-4)}`, "")}
                                    className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-blue-400 hover:bg-blue-50 transition-all"
                                >
                                    + Insert New Event Timeline
                                </button>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}