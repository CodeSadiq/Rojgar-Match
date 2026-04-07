import { JobPost, Post } from '@/types/job';

export interface CandidateProfile {
  qualification: string;
  level: number;
  branch: string;
}

export interface MatchedJob {
  job: JobPost;
  matchedPosts: Post[];
  matchScore: number;
  matchTier: 'exact' | 'moderate' | 'broad';
  isExpired: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCORE THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────
const SCORE_EXACT = 60;
const SCORE_MODERATE = 30;

// ─────────────────────────────────────────────────────────────────────────────
//  PROFESSIONAL DEGREE GATE  (Fix #2 + Fix #3)
//
//  These are terminal professional degrees that CANNOT be inferred from a
//  general graduation level. If a job's qualification list requires one of
//  these, the candidate MUST explicitly hold it (by qualification name or
//  branch). A general Graduate profile does NOT satisfy "B.Ed", "LLB", etc.
//
//  Key   = normalised job qualification name
//  Value = candidate qualification names / branches that satisfy the requirement
// ─────────────────────────────────────────────────────────────────────────────
const PROFESSIONAL_DEGREES: Record<string, string[]> = {
  'b.ed': ['b.ed', 'education', 'm.ed'],
  'm.ed': ['m.ed'],
  'llb': ['llb', 'law', 'ba llb', 'llm'],
  'llm': ['llm'],
  'mbbs': ['mbbs', 'medicine'],
  'bds': ['bds', 'dental'],
  'bams': ['bams', 'ayurveda'],
  'bhms': ['bhms', 'homeopathy'],
  'bums': ['bums', 'unani'],
  'b.pharm': ['b.pharm', 'pharmacy', 'm.pharm'],
  'm.pharm': ['m.pharm'],
  'b.sc nursing': ['b.sc nursing', 'nursing', 'gnm', 'anm'],
  'gnm': ['gnm', 'nursing', 'b.sc nursing'],
  'anm': ['anm', 'gnm', 'nursing'],
  'ca': ['ca', 'chartered accountancy'],
  'cs': ['cs', 'company secretaryship'],
  'cma': ['cma', 'cost management accountancy'],
  'b.arch': ['b.arch', 'architecture', 'm.arch'],
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODERATE MATCH: LEVEL GAP SAFETY WALL  (Fix #2)
//
//  Moderate matching (candidate exactly 1 level below requirement) is only
//  permitted between directly adjacent general education tiers:
//
//    Candidate level 1 (10th)    → may see moderate suggestions for level 2 jobs only
//    Candidate level 2 (12th)    → may see moderate suggestions for level 3 jobs only
//    Candidate level 3 (Diploma) → may see moderate suggestions for level 4 jobs only
//    Candidate level 4 (Graduate)→ may see moderate suggestions for level 5 jobs only
//    Candidate level 5 (PG)      → may see moderate suggestions for level 6 jobs only
//
//  This prevents a 12th-pass candidate from ever receiving a "moderate"
//  suggestion for a Graduate-level post (even if the DB stored it as Level 3).
// ─────────────────────────────────────────────────────────────────────────────
const MODERATE_MAX_JOB_LEVEL: Record<number, number> = {
  1: 2,
  2: 3,
  3: 4,
  4: 5,
  5: 6,
};

// ─────────────────────────────────────────────────────────────────────────────
//  PUBLIC ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────
export function getEligibleJobs(
  candidate: CandidateProfile,
  allJobs: JobPost[]
): MatchedJob[] {
  const results: MatchedJob[] = [];

  for (const job of allJobs) {
    const matchedPosts = getMatchedPostsForJob(candidate, job);
    if (matchedPosts.length === 0) continue;

    const score = calculateMatchScore(candidate, job, matchedPosts);
    if (score < SCORE_MODERATE) continue;

    const isExpired = isJobExpired(job);
    const matchTier: MatchedJob['matchTier'] =
      score >= SCORE_EXACT ? 'exact' :
        score >= SCORE_MODERATE ? 'moderate' : 'broad';

    results.push({ job, matchedPosts, matchScore: score, matchTier, isExpired });
  }

  // Primary sort: score desc. Secondary: active jobs before expired at equal score.
  return results.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
    if (a.isExpired !== b.isExpired) return a.isExpired ? 1 : -1;
    return 0;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
//  COLLECT ELIGIBLE POSTS FOR ONE JOB
// ─────────────────────────────────────────────────────────────────────────────
function getMatchedPostsForJob(candidate: CandidateProfile, job: JobPost): Post[] {
  const eligiblePosts: Post[] = [];

  if (job.posts && job.posts.length > 0) {
    for (const post of job.posts) {
      // Fix #1: always re-derive minQualificationLevel from the qual array
      // to ignore incorrectly stored scalars in the database.
      const corrected = withCorrectedLevel(post);
      if (evaluatePost(candidate, corrected).qualifies) {
        eligiblePosts.push(corrected);
      }
    }
  } else if (job.qualification && job.qualification.length > 0) {
    // No sub-posts: build a virtual post from root-level qualification
    const virtualPost: Post = {
      name: job.title,
      totalVacancy: job.totalVacancy,
      // Fix #1: derive from qualification array, not from a stored scalar
      minQualificationLevel: Math.min(...job.qualification.map(q => q.level)),
      qualification: job.qualification,
      prerequisite: [],
      categoryWiseVacancy: job.categoryWiseVacancyTotal,
      appearingEligible: false,
      appearingConditions: null,
      qualificationNote: null,
    };
    if (evaluatePost(candidate, virtualPost).qualifies) {
      eligiblePosts.push(virtualPost);
    }
  }

  return eligiblePosts;
}

/**
 * Fix #1 — Always recompute minQualificationLevel from the qualification
 * array rather than trusting the stored scalar value, which can be wrong
 * (e.g. a Graduate post stored as Level 3 instead of Level 4).
 */
function withCorrectedLevel(post: Post): Post {
  if (!post.qualification || post.qualification.length === 0) return post;
  const derived = Math.min(...post.qualification.map(q => q.level));
  if (post.minQualificationLevel === derived) return post;
  return { ...post, minQualificationLevel: derived };
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE EVALUATOR
// ─────────────────────────────────────────────────────────────────────────────
interface EvalResult {
  qualifies: boolean;
  tier: 'exact' | 'moderate' | 'none';
  branchScore: number;
}

function evaluatePost(candidate: CandidateProfile, post: Post): EvalResult {
  const minLevel = post.minQualificationLevel ?? 1;
  const candidateLevel = candidate.level ?? 0;

  // ── Gate 1: Hard level floor ─────────────────────────────────────────────
  // Candidate more than 1 level below → immediate reject
  if (candidateLevel < minLevel - 1) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  const isModerateLevel = candidateLevel === minLevel - 1;

  // ── Gate 2: Moderate safety wall (Fix #2) ───────────────────────────────
  // Even if within 1 level, candidate-level ceiling must allow this job level.
  if (isModerateLevel) {
    const ceiling = MODERATE_MAX_JOB_LEVEL[candidateLevel] ?? (candidateLevel + 1);
    if (minLevel > ceiling) {
      return { qualifies: false, tier: 'none', branchScore: 0 };
    }
  }

  // ── Gate 3: Professional degree gate (Fix #2 + Fix #3) ──────────────────
  // If the post demands a specific professional credential, the candidate must
  // explicitly hold it. Level proximity alone does not satisfy it.
  if (checkProfessionalGate(candidate, post)) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // ── Gate 4: Branch match ─────────────────────────────────────────────────
  let bestBranchScore = 0;
  let levelMatched = false;

  for (const qual of post.qualification) {
    if (candidateLevel < qual.level - 1) continue;
    levelMatched = true;
    const bs = scoreBranchMatch(candidate.branch, qual.branches ?? []);
    if (bs > bestBranchScore) bestBranchScore = bs;
    if (bestBranchScore === 2) break;
  }

  if (!levelMatched && !isModerateLevel) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // Moderate path: branch must at least loosely match
  if (isModerateLevel) {
    let moderateBranch = 0;
    for (const qual of post.qualification) {
      moderateBranch = Math.max(
        moderateBranch,
        scoreBranchMatch(candidate.branch, qual.branches ?? [])
      );
    }
    if (moderateBranch > 0) {
      return { qualifies: true, tier: 'moderate', branchScore: moderateBranch };
    }
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // Exact / over-qualified path
  if (bestBranchScore > 0) {
    return { qualifies: true, tier: 'exact', branchScore: bestBranchScore };
  }

  return { qualifies: false, tier: 'none', branchScore: 0 };
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROFESSIONAL GATE CHECKER  (Fix #3)
//
//  Returns true = BLOCK when the post requires a professional degree and the
//  candidate does not hold it. Checks both the qualification name list and
//  extraConditions / qualificationNote for "B.Ed" keyword mentions.
// ─────────────────────────────────────────────────────────────────────────────
function checkProfessionalGate(candidate: CandidateProfile, post: Post): boolean {
  const cQual = (candidate.qualification || '').toLowerCase().trim();
  const cBranch = (candidate.branch || '').toLowerCase().trim();

  for (const qual of post.qualification) {
    const qName = (qual.name || '').toLowerCase().trim();
    const satisfiers = PROFESSIONAL_DEGREES[qName];
    if (!satisfiers) continue;

    const candidateHoldsIt =
      satisfiers.includes(cQual) ||
      satisfiers.includes(cBranch);

    if (!candidateHoldsIt) return true; // BLOCK — missing required professional degree
  }

  // Targeted B.Ed scan (Fix #3): covers cases where it appears in free-text
  // conditions rather than as a named qualification object.
  const bedMentionedInConditions = post.qualification.some(q =>
    (q.extraConditions || []).some(c => /\bb\.?\s*ed\b/i.test(c))
  );
  const bedMentionedInNote = /\bb\.?\s*ed\b/i.test(post.qualificationNote || '');

  if (bedMentionedInConditions || bedMentionedInNote) {
    const candidateHasBed =
      /\bb\.?\s*ed\b/i.test(candidate.qualification) ||
      ['b.ed', 'education', 'm.ed'].includes(cBranch);
    if (!candidateHasBed) return true; // BLOCK
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BRANCH SCORING
//  2 = specific named match  |  1 = 'any' / open  |  0 = no match
// ─────────────────────────────────────────────────────────────────────────────
function scoreBranchMatch(candidateBranch: string, jobBranches: string[]): number {
  if (!jobBranches || jobBranches.length === 0) return 1; // no restriction → open

  const cb = (candidateBranch || 'any').toLowerCase().trim();
  const jb = jobBranches.map(b => b.toLowerCase().trim());

  if (jb.includes('any')) return 1;
  if (cb === 'any') return 1;
  if (jb.includes(cb)) return 2;
  if (partialBranchMatch(cb, jb)) return 1;

  return 0;
}

const BRANCH_SYNONYMS: Record<string, string[]> = {
  'cse': ['computer science', 'computer science & engineering', 'computer science and engineering', 'cs'],
  'it': ['information technology'],
  'ece': ['electronics & communication', 'electronics and communication', 'electronics'],
  'eee': ['electrical & electronics', 'electrical and electronics'],
  'mechanical': ['mechanical engineering'],
  'civil': ['civil engineering'],
  'electrical': ['electrical engineering'],
  'chemical': ['chemical engineering'],
  'computer applications': ['bca', 'mca'],
  'nursing': ['b.sc nursing', 'gnm', 'anm'],
  'law': ['llb', 'ba llb'],
  'education': ['b.ed', 'm.ed'],
  'pharmacy': ['b.pharm', 'm.pharm', 'd.pharm'],
  'architecture': ['b.arch', 'm.arch'],
  'agriculture': ['agricultural engineering'],
  'data science': ['data science and engineering'],
  'ai': ['artificial intelligence', 'ai / artificial intelligence', 'ai/ml', 'machine learning'],
  'environmental science': ['environmental engineering'],
  'public health': ['public health engineering'],
  'science (pcm)': ['mathematics', 'physics', 'chemistry'],
  'science (pcb)': ['biology', 'physics', 'chemistry', 'botany', 'zoology'],
};

function partialBranchMatch(candidateBranch: string, jobBranches: string[]): boolean {
  const synonyms = BRANCH_SYNONYMS[candidateBranch] ?? [];
  for (const syn of synonyms) {
    if (jobBranches.some(jb => jb.includes(syn) || syn.includes(jb))) return true;
  }
  // Reverse lookup
  for (const [key, syns] of Object.entries(BRANCH_SYNONYMS)) {
    if (syns.includes(candidateBranch)) {
      if (jobBranches.includes(key) || jobBranches.some(jb => jb.includes(key))) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  SCORING  (qualification-only, no age / category / fees)
// ─────────────────────────────────────────────────────────────────────────────
function calculateMatchScore(
  candidate: CandidateProfile,
  job: JobPost,
  matchedPosts: Post[]
): number {
  let score = 0;
  const primaryPost = matchedPosts[0];
  const minLevel = primaryPost.minQualificationLevel ?? 1;

  // 1. Level alignment (max 40 pts)
  if (candidate.level === minLevel) score += 40;
  else if (candidate.level > minLevel) score += 25;
  else if (candidate.level === minLevel - 1) score += 15;

  // 2. Branch relevance (max 35 pts)
  let bestBranch = 0;
  for (const qual of primaryPost.qualification) {
    const bs = scoreBranchMatch(candidate.branch, qual.branches ?? []);
    if (bs > bestBranch) bestBranch = bs;
  }
  if (bestBranch === 2) score += 35;
  else if (bestBranch === 1) score += 15;

  // 3. Breadth — number of matched posts (max 15 pts)
  score += Math.min(matchedPosts.length * 5, 15);

  // 4. Stream alignment bonus (max 10 pts)
  const stream = primaryPost.qualification[0]?.streamRequired?.toLowerCase();
  if (stream) {
    const cb = (candidate.branch || '').toLowerCase();
    const STREAM_MAP: Record<string, string[]> = {
      science: ['science (pcm)', 'science (pcb)', 'physics', 'chemistry', 'mathematics',
        'biology', 'cse', 'it', 'ece', 'eee', 'mechanical', 'civil', 'electrical', 'chemical'],
      commerce: ['commerce', 'accounting', 'finance', 'b.com', 'taxation', 'banking'],
      arts: ['arts', 'hindi', 'english', 'history', 'political science', 'sociology', 'geography'],
      mathematics: ['mathematics', 'statistics', 'cse', 'it'],
    };
    if (STREAM_MAP[stream]?.includes(cb)) score += 10;
  }

  return score;
}

// ─────────────────────────────────────────────────────────────────────────────
//  UTILITY — isJobExpired
//  Used for UI badge only. Never used to filter jobs out of results.
// ─────────────────────────────────────────────────────────────────────────────
function isJobExpired(job: JobPost): boolean {
  if (!job.importantDates?.lastDate) return false;
  const lastDate = new Date(job.importantDates.lastDate);
  lastDate.setHours(23, 59, 59, 999);
  return lastDate < new Date();
}