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
//  PROFESSIONAL DEGREE GATE
//
//  Terminal professional degrees that CANNOT be inferred from a general
//  graduation level. The candidate MUST explicitly hold one.
//
//  Key   = normalised QUAL_TREE qualification name (lowercase)
//  Value = candidate qualification names / branches that satisfy it
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
//  QUALIFICATION FAMILIES
//
//  Groups specific professional/technical degrees by family.
//  Matching rule: If a job requires 'b.tech', the candidate must have a
//                 qualification that falls within the 'b.tech' family.
// ─────────────────────────────────────────────────────────────────────────────
const QUAL_FAMILIES: Record<string, string[]> = {
  'b.tech': ['b.tech', 'be', 'm.tech', 'me', 'engineering'],
  'm.tech': ['m.tech', 'me'],
  'iti': ['iti'],
  'diploma': ['diploma', 'polytechnic'],
  'bca': ['bca', 'mca', 'computer applications'],
  'mca': ['mca'],
  'llb': ['llb', 'law', 'ba llb', 'llm'],
  'llm': ['llm'],
  'b.ed': ['b.ed', 'education', 'm.ed'],
  'm.ed': ['m.ed'],
  'mbbs': ['mbbs', 'medicine'],
  'b.sc nursing': ['b.sc nursing', 'nursing'],
  'gnm': ['gnm', 'nursing'],
  'anm': ['anm', 'nursing'],
  'b.pharm': ['b.pharm', 'pharmacy', 'm.pharm'],
  'd.pharm': ['d.pharm', 'pharmacy'],
  'ca': ['ca', 'chartered accountancy'],
  'cs': ['cs', 'company secretaryship'],
  'b.sc': ['b.sc', 'm.sc'],
  'm.sc': ['m.sc'],
  'b.com': ['b.com', 'm.com'],
  'm.com': ['m.com'],
  'ba': ['ba', 'ma'],
  'ma': ['ma'],
  'bba': ['bba', 'mba'],
  'mba': ['mba'],
};

const GENERIC_QUALS = ['10th', '12th', 'graduate', 'post graduate', 'phd'];
const COURSES_WITHOUT_BRANCHES = ['10th', 'matriculation', 'gnm', 'anm', 'd.pharm', 'high school'];

// ─────────────────────────────────────────────────────────────────────────────
//  MODERATE MATCH: LEVEL GAP SAFETY WALL — HIGH STRICT MODE
//
//  Key   = candidate level
//  Value = maximum job level allowed as a moderate suggestion.
//          -1 = moderate completely disabled for that candidate level.
//
//  Level 1 (10th)    → -1  NO moderate matching at all.
//                         10th is a hard eligibility floor; showing 12th jobs
//                         to a 10th candidate is incorrect and misleading.
//
//  Level 2 (12th)    →  3  Only Diploma/ITI/GNM/ANM level jobs allowed.
//                         12th candidates must NEVER see Graduate (4) jobs.
//
//  Level 3 (Diploma) →  4  Graduate level jobs only.
//                         But branch must be a NAMED match (see below).
//
//  Level 4 (Graduate)→  5  PG level jobs only.
//
//  Level 5 (PG)      →  6  PhD level jobs only.
// ─────────────────────────────────────────────────────────────────────────────
const MODERATE_MAX_JOB_LEVEL: Record<number, number> = {
  1: -1,
  2: -1,
  3: 4,
  4: 5,
  5: 6,
};

// ─────────────────────────────────────────────────────────────────────────────
//  MODERATE BRANCH STRICTNESS — HIGH STRICT MODE
//
//  Minimum branch score required for moderate to be allowed, per candidate level.
//
//  Level 2 (12th)    → 1  Loose/open match is fine. Most Diploma-level jobs
//                          accept any stream, so 12th candidates can see them.
//
//  Level 3 (Diploma) → 2  NAMED branch match required. A "Civil Diploma"
//                          candidate may see Graduate Civil Engineering jobs.
//                          A generic Diploma candidate must NOT bubble up to
//                          all Graduate posts just because branch is "any".
//
//  Level 4+          → 1  Loose match is fine at higher levels.
// ─────────────────────────────────────────────────────────────────────────────
const MODERATE_MIN_BRANCH_SCORE: Record<number, number> = {
  1: 99, // irrelevant — level 1 fully blocked by MODERATE_MAX_JOB_LEVEL
  2: 1,
  3: 2,
  4: 1,
  5: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
//  EducationSegment — shape of a single educationRequirementForMatch entry.
//  If your types/job.ts already defines this, remove it and import from there.
// ─────────────────────────────────────────────────────────────────────────────
interface EducationSegment {
  qualification: string; // exact QUAL_TREE name, e.g. "B.Tech", "Diploma"
  level: number;         // 1–6
  branches: string[];    // canonical branch values or ["any"]
}

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
      if (evaluatePost(candidate, post).qualifies) {
        eligiblePosts.push(post);
      }
    }
  } else if (job.qualification) {
    // No sub-posts: synthesise a virtual post from root-level data.
    const qual = job.qualification as any;
    const isV9 = !Array.isArray(qual) && qual.course !== undefined;
    
    const virtualPost: Post = {
      name: job.title,
      totalVacancy: job.totalVacancy,
      minQualificationLevel: isV9 ? null : Math.min(...(Array.isArray(qual) ? qual : [qual]).map((q: any) => q.level || 1)),
      qualification: job.qualification,
      educationRequirementForMatch: [],
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

// ─────────────────────────────────────────────────────────────────────────────
//  RESOLVE MATCHING SEGMENTS
//
//  Returns educationRequirementForMatch segments for a post.
//  Falls back to qualification[] for pre-v8 jobs (backward-compat).
// ─────────────────────────────────────────────────────────────────────────────
function getSegments(post: Post): EducationSegment[] {
  if (post.educationRequirementForMatch && post.educationRequirementForMatch.length > 0) {
    return post.educationRequirementForMatch as EducationSegment[];
  }
  return (post.qualification ?? []).map(q => ({
    qualification: q.name,
    level: q.level,
    branches: q.branches ?? [],
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
//  CORE EVALUATOR — HIGH STRICT MODERATE MODE
// ─────────────────────────────────────────────────────────────────────────────
interface EvalResult {
  qualifies: boolean;
  tier: 'exact' | 'moderate' | 'none';
  branchScore: number;
}

function evaluatePost(candidate: CandidateProfile, post: Post): EvalResult {
  const qual = post.qualification as any;

  // ── v9 simplified match ──
  if (qual && !Array.isArray(qual) && qual.course !== undefined) {
    const cCourse = candidate.qualification;
    const cBranch = candidate.branch;

    // RULE: candidate.course ∈ job.course
    const isCourseMatch = Array.isArray(qual.course) && qual.course.includes(cCourse);
    
    // RULE/GOAL: (candidate.branch ∈ job.branch OR job.branch is empty)
    const isBranchMatch = !qual.branch || qual.branch.length === 0 || (Array.isArray(qual.branch) && qual.branch.includes(cBranch));

    if (isCourseMatch && isBranchMatch) {
      return { qualifies: true, tier: 'exact', branchScore: 2 };
    }
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  const segments = getSegments(post);
  const candidateLevel = candidate.level ?? 0;
  const candidateQual = (candidate.qualification || '').toLowerCase().trim();

  const minLevel = segments.length > 0
    ? Math.min(...segments.map(s => s.level))
    : (post.minQualificationLevel ?? 1);

  // ── Gate 1: Hard level floor ─────────────────────────────────────────────
  if (candidateLevel < minLevel) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // ── Gate 2: Professional degree gate ────────────────────────────────────
  if (checkProfessionalGate(candidate, post, segments)) {
    return { qualifies: false, tier: 'none', branchScore: 0 };
  }

  // ── Gate 3: Qualification & Branch match across segments ─────────────────
  let bestBranchScore = 0;
  let matchedSegmentFound = false;

  for (const seg of segments) {
    const jobQualName = seg.qualification.toLowerCase().trim();

    // 1. Course Match (Qualification Name)
    const isQualMatch = checkQualificationCompatibility(candidateQual, jobQualName, candidateLevel, seg.level);
    if (!isQualMatch) continue;

    // 2. Branch Match
    let bs = 0;
    const isNoBranchCourse = COURSES_WITHOUT_BRANCHES.some(c => jobQualName.includes(c));

    if (isNoBranchCourse) {
      bs = 2; // Treat as exact match for branch-less courses like 10th
    } else {
      bs = scoreBranchMatch(candidate.branch, seg.branches);
    }

    if (bs > 0) {
      matchedSegmentFound = true;
      if (bs > bestBranchScore) bestBranchScore = bs;
    }
    if (bestBranchScore === 2) break;
  }

  if (matchedSegmentFound) {
    return { qualifies: true, tier: 'exact', branchScore: bestBranchScore };
  }

  return { qualifies: false, tier: 'none', branchScore: 0 };
}

/**
 * Validates if the candidate's course is compatible with the job's required course.
 */
function checkQualificationCompatibility(cQual: string, jQual: string, cLevel: number, jLevel: number): boolean {
  // If job asks for a generic level (e.g. "Graduate"), any candidate at that level or above passes.
  if (GENERIC_QUALS.includes(jQual)) return cLevel >= jLevel;

  // Exact name match
  if (cQual === jQual || cQual.includes(jQual) || jQual.includes(cQual)) return true;

  // Family check (e.g. M.Tech candidate matches B.Tech job)
  for (const family in QUAL_FAMILIES) {
    const members = QUAL_FAMILIES[family];
    if (members.includes(jQual)) {
      if (members.includes(cQual)) return true;
    }
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROFESSIONAL GATE CHECKER
//
//  Returns true = BLOCK when the post requires a specific professional degree
//  and the candidate does not hold it.
//
//  Check order:
//    1. segments (educationRequirementForMatch) — primary, exact QUAL_TREE names
//    2. qualification[].name — legacy fallback for pre-v8 jobs
//    3. extraConditions / qualificationNote — B.Ed free-text scan
// ─────────────────────────────────────────────────────────────────────────────
function checkProfessionalGate(
  candidate: CandidateProfile,
  post: Post,
  segments: EducationSegment[]
): boolean {
  const cQual = (candidate.qualification || '').toLowerCase().trim();
  const cBranch = (candidate.branch || '').toLowerCase().trim();

  // Primary: segments
  for (const seg of segments) {
    const segName = seg.qualification.toLowerCase().trim();
    const satisfiers = PROFESSIONAL_DEGREES[segName];
    if (!satisfiers) continue;
    if (!satisfiers.includes(cQual) && !satisfiers.includes(cBranch)) return true;
  }

  // Legacy fallback: qualification[].name (pre-v8 jobs only)
  if (!post.educationRequirementForMatch || post.educationRequirementForMatch.length === 0) {
    for (const qual of (post.qualification ?? [])) {
      const qName = (qual.name || '').toLowerCase().trim();
      const satisfiers = PROFESSIONAL_DEGREES[qName];
      if (!satisfiers) continue;
      if (!satisfiers.includes(cQual) && !satisfiers.includes(cBranch)) return true;
    }
  }

  // B.Ed free-text scan
  const bedInConditions = (post.qualification ?? []).some(q =>
    (q.extraConditions ?? []).some(c => /\bb\.?\s*ed\b/i.test(c))
  );
  const bedInNote = /\bb\.?\s*ed\b/i.test(post.qualificationNote ?? '');

  if (bedInConditions || bedInNote) {
    const candidateHasBed =
      /\bb\.?\s*ed\b/i.test(candidate.qualification) ||
      ['b.ed', 'education', 'm.ed'].includes(cBranch);
    if (!candidateHasBed) return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
//  BRANCH SCORING
//  2 = specific named match  |  1 = 'any' / open  |  0 = no match
// ─────────────────────────────────────────────────────────────────────────────
function scoreBranchMatch(candidateBranch: string, jobBranches: string[]): number {
  if (!jobBranches || jobBranches.length === 0) return 1;

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
  const segments = getSegments(primaryPost);

  const minLevel = segments.length > 0
    ? Math.min(...segments.map(s => s.level))
    : (primaryPost.minQualificationLevel ?? 1);

  // 1. Level alignment (max 40 pts)
  if (candidate.level === minLevel) score += 40;
  else if (candidate.level > minLevel) score += 25;
  else if (candidate.level === minLevel - 1) score += 15;

  // 2. Branch relevance across all segments (max 35 pts)
  let bestBranch = 0;
  for (const seg of segments) {
    const bs = scoreBranchMatch(candidate.branch, seg.branches);
    if (bs > bestBranch) bestBranch = bs;
    if (bestBranch === 2) break;
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