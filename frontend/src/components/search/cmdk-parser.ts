/**
 * CmdK keyword parser — extracts structured filters from a free-form query.
 *
 * Examples:
 *   "react remote 20m hà nội"        → { keywords:["react"], workMode:"REMOTE", salaryMin:20, location:"hà nội" }
 *   "fullstack hybrid 15-25 tphcm"   → { keywords:["fullstack"], workMode:"HYBRID", salaryMin:15, salaryMax:25, location:"tphcm" }
 *   "match>80 python"                → { matchMin:80, keywords:["python"] }
 *
 * Unrecognized tokens fall back to free-text keywords.
 */

export type WorkMode = "REMOTE" | "ON_SITE" | "HYBRID";
export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "FREELANCE";

export interface ParsedQuery {
  keywords: string[];
  workMode?: WorkMode;
  jobType?: JobType;
  salaryMin?: number;
  salaryMax?: number;
  location?: string;
  matchMin?: number;
  freeText: string;
}

const WORK_MODE_MAP: Record<string, WorkMode> = {
  remote: "REMOTE",
  onsite: "ON_SITE",
  "on-site": "ON_SITE",
  hybrid: "HYBRID",
};

const JOB_TYPE_MAP: Record<string, JobType> = {
  fulltime: "FULL_TIME",
  "full-time": "FULL_TIME",
  parttime: "PART_TIME",
  "part-time": "PART_TIME",
  contract: "CONTRACT",
  intern: "INTERNSHIP",
  internship: "INTERNSHIP",
  freelance: "FREELANCE",
};

const KNOWN_LOCATIONS = [
  "hà nội",
  "ha noi",
  "hanoi",
  "tp.hcm",
  "tphcm",
  "tp hcm",
  "hồ chí minh",
  "ho chi minh",
  "saigon",
  "đà nẵng",
  "da nang",
  "danang",
  "hải phòng",
  "hai phong",
  "cần thơ",
  "can tho",
];

const SALARY_RE = /^(\d{1,3})(?:-(\d{1,3}))?(?:m|tr|triệu)?$/i;
const MATCH_RE = /^match>(\d{1,3})$/i;

function normalize(s: string) {
  return s.trim().toLowerCase();
}

export function parseQuery(input: string): ParsedQuery {
  const result: ParsedQuery = { keywords: [], freeText: input.trim() };
  if (!input.trim()) return result;

  let remaining = " " + input.toLowerCase() + " ";
  for (const loc of KNOWN_LOCATIONS) {
    const idx = remaining.indexOf(" " + loc + " ");
    if (idx !== -1) {
      result.location = loc;
      remaining =
        remaining.slice(0, idx + 1) +
        remaining.slice(idx + 1 + loc.length);
      break;
    }
  }

  const tokens = remaining.trim().split(/\s+/).filter(Boolean);
  for (const raw of tokens) {
    const tok = normalize(raw);
    if (!tok) continue;

    if (WORK_MODE_MAP[tok]) {
      result.workMode = WORK_MODE_MAP[tok];
      continue;
    }
    if (JOB_TYPE_MAP[tok]) {
      result.jobType = JOB_TYPE_MAP[tok];
      continue;
    }
    const mMatch = MATCH_RE.exec(tok);
    if (mMatch) {
      result.matchMin = Math.min(100, parseInt(mMatch[1], 10));
      continue;
    }
    const sMatch = SALARY_RE.exec(tok);
    if (sMatch) {
      const lo = parseInt(sMatch[1], 10);
      const hi = sMatch[2] ? parseInt(sMatch[2], 10) : undefined;
      if (lo > 0 && lo < 500) {
        result.salaryMin = lo;
        if (hi) result.salaryMax = hi;
        continue;
      }
    }
    result.keywords.push(raw);
  }

  return result;
}

export interface QueryChip {
  key: string;
  label: string;
  tone: "keyword" | "filter";
}

export function chipsFor(q: ParsedQuery): QueryChip[] {
  const chips: QueryChip[] = [];
  q.keywords.forEach((k) =>
    chips.push({ key: `kw:${k}`, label: k, tone: "keyword" })
  );
  if (q.workMode)
    chips.push({
      key: "workMode",
      label: q.workMode === "REMOTE" ? "Remote" : q.workMode === "HYBRID" ? "Hybrid" : "On-site",
      tone: "filter",
    });
  if (q.jobType)
    chips.push({ key: "jobType", label: q.jobType.replace("_", " ").toLowerCase(), tone: "filter" });
  if (q.salaryMin != null)
    chips.push({
      key: "salary",
      label:
        q.salaryMax != null
          ? `${q.salaryMin}–${q.salaryMax}tr`
          : `≥ ${q.salaryMin}tr`,
      tone: "filter",
    });
  if (q.location)
    chips.push({ key: "location", label: q.location, tone: "filter" });
  if (q.matchMin != null)
    chips.push({ key: "matchMin", label: `match > ${q.matchMin}`, tone: "filter" });
  return chips;
}
