'use client';

import { JobPost, Post } from '@/types/job';

// ── QUALIFICATION HELPERS ───────────────────────────────────────────────────
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

interface QualGroup {
    qualTexts: string[];
    appearingNote: string | null;
    posts: any[];
}

function groupPostsByQual(posts: any[]): QualGroup[] {
    const map = new Map<string, QualGroup>();
    for (const p of posts) {
        const fp = qualFingerprint(p);
        if (!map.has(fp)) {
            const qual = p.qualification;
            let qualTexts = (qual && !Array.isArray(qual) && qual.course !== undefined) ? [qualLabel(qual)] : (Array.isArray(qual) ? qual : (qual ? [qual] : [])).map(qualLabel).filter(Boolean);
            if (qualTexts.length === 0) qualTexts = ["Not specified"];
            map.set(fp, {
                qualTexts,
                appearingNote: p.appearingEligible ? (p.appearingConditions || "Appearing candidates eligible") : null,
                posts: [],
            });
        }
        map.get(fp)!.posts.push(p);
    }
    return Array.from(map.values());
}

interface JobDetailModalProps {
  job: JobPost | null;
  onClose: () => void;
}

export default function JobDetailModal({ job, onClose }: JobDetailModalProps) {
  if (!job) return null;

  const rawPosts = (job.posts || []).length > 0 ? job.posts : [{ name: "General", qualification: job.qualification }];
  const postGroups = groupPostsByQual(rawPosts);

  return (
    <div className="fixed inset-0 bg-navy-dark/45 backdrop-blur-sm z-[200] flex items-center justify-center p-5 transition-opacity duration-250 animate-in fade-in">
      <div
        className="bg-white rounded-xl max-w-[600px] w-full max-h-[88vh] overflow-y-auto transform transition-transform duration-250 animate-in slide-in-from-bottom-6 shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-br from-navy to-navy-light rounded-t-xl p-[28px_28px_24px] text-white relative">
          <button
            className="absolute top-4 right-4 bg-white/15 w-8 h-8 rounded-full flex items-center justify-center text-white text-base hover:bg-white/25 transition-all"
            onClick={onClose}
          >
            ✕
          </button>
          <div className="w-15 h-15 bg-white/15 rounded-md flex items-center justify-center text-3xl mb-3.5 border border-white/20 shadow-sm">
            {job.emoji}
          </div>
          <h2 className="font-serif text-2xl font-bold tracking-tight mb-1">{job.title}</h2>
          <div className="text-[13.5px] opacity-70 font-medium">{job.org}</div>
        </div>

        {/* MODAL BODY */}
        <div className="p-7 space-y-6">
          <div className="grid grid-cols-3 gap-3 mb-5.5">
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className="text-[14px] font-bold text-text-h mb-0.5 leading-tight">
                {typeof job.salary === 'object' ? `₹${job.salary.min?.toLocaleString()} - ₹${job.salary.max?.toLocaleString()}` : job.salary}
              </div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Salary</div>
            </div>
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className="text-base font-bold text-text-h mb-0.5">{job.location}</div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Location</div>
            </div>
            <div className="bg-surface border border-border rounded-sm p-3 text-center">
              <div className={`text-base font-bold mb-0.5 ${(job.urgency === 'urgent' || !job.lastDate) ? 'text-red' : job.urgency === 'soon' ? 'text-amber' : 'text-green'}`}>
                {job.lastDate || (job as any).importantDates?.lastDate || (job as any).notificationType || "Pending/NA"}
              </div>
              <div className="text-[11px] text-text-s uppercase font-bold tracking-wider">Last Date</div>
            </div>
          </div>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Qualification</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {qualLabel(job.qualification)}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Selection Process</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {job.selectionProcess && job.selectionProcess.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {job.selectionProcess.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="bg-navy/10 text-navy w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      {step}
                    </div>
                  ))}
                </div>
              ) : job.process}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Age Limit</div>
            <div className="text-[13.5px] text-text-b leading-relaxed">
              {job.ageMax > 0
                ? `${job.ageMin} – ${job.ageMax} years (age relaxation applicable for reserved categories)`
                : `Minimum ${job.ageMin} years`}
            </div>
          </section>

          <section>
            <div className="text-xs font-bold uppercase tracking-widest text-text-m mb-2.5">Tags</div>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, idx) => (
                <span key={idx} className="bg-surface border border-border rounded-full px-3 py-1 text-[12.5px] text-text-b font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </section>

          <section className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-bold uppercase tracking-widest text-text-m">Post-wise Vacancy & Qualification</div>
              <div className="text-[11px] bg-navy/5 text-navy-light px-2 py-0.5 rounded font-medium border border-navy/10">
                General Req: Graduate from a recognized university
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden overflow-x-auto">
              <table className="w-full text-left border-collapse text-[13px]">
                <thead>
                  <tr className="bg-surface border-b border-border">
                    <th className="p-3 font-bold text-text-h border-r border-border min-w-[180px]">Post / Designation</th>
                    <th className="p-3 font-bold text-text-h border-r border-border min-w-[100px]">Posts</th>
                    <th className="p-3 font-bold text-text-h">Qualification Specifics</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {postGroups.flatMap((grp, gi) => (
                    grp.posts.map((p, pi) => (
                      <tr key={`${gi}-${pi}`} className="hover:bg-surface/50 transition-colors">
                        <td className="p-3 text-text-h font-medium border-r border-border">{p.name || "N/A"}</td>
                        <td className="p-3 text-text-m border-r border-border" style={{ whiteSpace: "nowrap" }}>
                          {p.totalVacancy != null ? p.totalVacancy.toLocaleString() : "—"}
                        </td>
                        {pi === 0 && (
                          <td rowSpan={grp.posts.length} className="p-3 text-text-b leading-relaxed align-top">
                            <div className="flex flex-col gap-2">
                              {grp.qualTexts.map((qt, qIdx) => (
                                <React.Fragment key={qIdx}>
                                  <div className="font-semibold text-navy">{qt}</div>
                                  {qIdx < grp.qualTexts.length - 1 && (
                                    <div className="flex items-center gap-2 py-1">
                                      <div className="flex-1 h-px bg-border"></div>
                                      <span className="text-[9px] font-bold text-ink-muted px-1.5 py-0.5 border border-border rounded bg-surface">OR</span>
                                      <div className="flex-1 h-px bg-border"></div>
                                    </div>
                                  )}
                                </React.Fragment>
                              ))}
                              {grp.appearingNote && (
                                <div className="text-[11.5px] text-green font-semibold mt-1 pt-2 border-t border-dashed border-border">
                                  {grp.appearingNote}
                                </div>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* MODAL ACTIONS */}
        <div className="p-7 pt-0 flex gap-2.5">
          <button className="flex-1 py-3.5 bg-gradient-to-br from-navy to-accent text-white rounded-sm font-bold text-sm hover:opacity-90 transition-all">
            Apply Now →
          </button>
          <button className="px-4.5 py-3.5 border-[1.5px] border-border bg-transparent rounded-sm font-semibold text-sm text-text-m hover:border-accent hover:text-accent transition-all">
            🔖 Save
          </button>
        </div>
      </div>
    </div>
  );
}
