export interface MatchResult {
  score: number;
  matched: string[];
  unmatched: string[];
}

export function computeMatchScore(candidateSkills: string[], jobRequirements: string): MatchResult {
  if (!candidateSkills.length) return { score: 0, matched: [], unmatched: [] };
  const req = jobRequirements.toLowerCase();
  const matched = candidateSkills.filter(s => req.includes(s.toLowerCase()));
  const unmatched = candidateSkills.filter(s => !req.includes(s.toLowerCase()));
  const score = Math.round((matched.length / candidateSkills.length) * 100);
  return { score, matched, unmatched };
}

export function scoreColor(score: number): string {
  if (score >= 70) return "text-[#4ADE80] bg-[rgba(34,197,94,.1)] border-[rgba(34,197,94,.2)]";
  if (score >= 40) return "text-[#FCD34D] bg-[rgba(245,158,11,.1)] border-[rgba(245,158,11,.2)]";
  return "text-[#EF4444] bg-[rgba(239,68,68,.1)] border-[rgba(239,68,68,.2)]";
}
