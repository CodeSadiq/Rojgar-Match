import { JobPost, Post } from '@/types/job';

export interface QualificationEntry {
  name: string;
  level: number;
  label: string;
  branch: string;
}

export interface CandidateProfile {
  fullName?: string;
  email?: string;
  gender?: string;
  // Support for multiple qualifications across different levels
  qualifications: QualificationEntry[];
  screeningAnswers?: Record<string, boolean | null>;
  screeningQuestions?: any[];
  screenedJobIds?: string;
  blockedPostNames?: string[];
}

export interface MatchedJob {
  job: JobPost;
  matchedPosts: Post[];
  matchScore: number;
  matchTier: 'exact' | 'none';
  matchedOn?: string; // e.g. "12th" or "B.Tech"
}

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export function getEligibleJobs(
  candidate: CandidateProfile,
  allJobs: JobPost[]
): MatchedJob[] {
  const results: MatchedJob[] = [];

  // Robust check for missing or legacy profile data
  if (!candidate || !candidate.qualifications || !Array.isArray(candidate.qualifications)) {
    return results;
  }

  for (const job of allJobs) {
    // 1. GENDER FILTER
    if (job.eligibleGender && job.eligibleGender.length > 0) {
      const userGender = candidate.gender?.toLowerCase();

      // If candidate is 'other', show both types (bypass restrictions) as requested
      if (userGender !== 'other') {
        const isEligible = userGender && job.eligibleGender.some(g => g.toLowerCase() === userGender);
        if (!isEligible) continue;
      }
    }

    const { matchedPosts, matchedOn } = getMatchedPostsForJob(candidate, job);
    if (matchedPosts.length === 0) continue;

    results.push({
      job,
      matchedPosts,
      matchScore: 100,
      matchTier: 'exact',
      matchedOn
    });
  }

  return results;
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLLECT ELIGIBLE POSTS FOR ONE JOB
// ─────────────────────────────────────────────────────────────────────────────
function getMatchedPostsForJob(candidate: CandidateProfile, job: JobPost): { matchedPosts: Post[], matchedOn: string } {
  const eligiblePosts: Post[] = [];
  const matchedQualLabels: Set<string> = new Set();

  if (job.posts && job.posts.length > 0) {
    for (const post of job.posts) {
      // Check if ANY of the candidate's qualification records match this post's requirement.
      candidate.qualifications.forEach(q => {
        if (evaluatePost(q, post)) {
          if (!eligiblePosts.includes(post)) eligiblePosts.push(post);
          matchedQualLabels.add(q.name);
        }
      });
    }
  } else if (job.qualification) {
    // synthesise a virtual post
    const virtualPost: Post = {
      name: job.title,
      totalVacancy: job.totalVacancy,
      minQualificationLevel: null,
      qualification: job.qualification,
      educationRequirementForMatch: [],
      prerequisite: [],
      categoryWiseVacancy: (job.categoryWiseVacancyTotal as any) || { general: null, ews: null, obc: null, sc: null, st: null, pwd: null },
      appearingEligible: false,
      appearingConditions: null,
      ageLimit: (job as any).ageLimit || { min: null, max: null, relaxation: {} },
      salary: (job as any).salary || { payLevel: null, min: null, max: null, currency: 'INR' },
    };

    candidate.qualifications.forEach(q => {
      if (evaluatePost(q, virtualPost)) {
        if (!eligiblePosts.includes(virtualPost)) eligiblePosts.push(virtualPost);
        matchedQualLabels.add(q.name);
      }
    });
  }

  // Convert Set to string like "12th" or "10th, 12th"
  // Sort by level ID to ensure consistent order (e.g. 10th then 12th)
  const matchedOn = Array.from(matchedQualLabels).join(', ');

  return { matchedPosts: eligiblePosts, matchedOn };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE EVALUATOR — CHECKS IF A SPECIFIC QUALIFICATION MATCHES A POST
// ─────────────────────────────────────────────────────────────────────────────
function evaluatePost(qEntry: QualificationEntry, post: Post): boolean {
  const cCourse = (qEntry.name || '').trim().toLowerCase();
  const cBranch = (qEntry.branch || '').trim().toLowerCase();

  // 1. PRIMARY MATCH: check educationRequirementForMatch array
  if (post.educationRequirementForMatch && (post.educationRequirementForMatch as any).length > 0) {
    return (post.educationRequirementForMatch as any).some((req: any) => {
      const matchCourse = (req.qualification || '').trim().toLowerCase() === cCourse;
      const matchBranch = !req.branches ||
        req.branches.length === 0 ||
        req.branches.some((b: string) => b.toLowerCase() === cBranch);
      return matchCourse && matchBranch;
    });
  }

  // 2. FALLBACK MATCH: check simple qualification object structure
  const qual = post.qualification as any;
  if (!qual || !qual.course) return false;

  const jobCourses = (Array.isArray(qual.course) ? qual.course : [qual.course]).map((c: string) => c.toLowerCase());
  const jobBranches = (Array.isArray(qual.branch) ? qual.branch : []).map((b: string) => b.toLowerCase());

  const isCourseMatch = jobCourses.includes(cCourse);
  const isBranchMatch = jobBranches.length === 0 || jobBranches.includes(cBranch);

  return isCourseMatch && isBranchMatch;
}
