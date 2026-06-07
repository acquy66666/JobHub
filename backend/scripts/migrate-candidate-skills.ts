/**
 * One-shot migration: map legacy free-text `Candidate.skills` → Skill bank slug.
 *
 * Usage from backend/:
 *   npx tsx scripts/migrate-candidate-skills.ts            # dry-run (default)
 *   npx tsx scripts/migrate-candidate-skills.ts --apply    # commit changes
 *
 * Strategy per item:
 *   1) exact-match against Skill.slug | nameVi (lower) | nameEn (lower) | aliases (lower)
 *   2) pg_trgm GREATEST(similarity(nameVi), similarity(nameEn)) > 0.5 LIMIT 1
 *   3) push to Candidate.legacySkills (user re-picks later via profile banner)
 */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const APPLY = process.argv.includes('--apply');

type SkillRow = { slug: string; nameVi: string; nameEn: string | null; aliases: string[] };

function norm(s: string) {
  return s.trim().toLowerCase();
}

async function main() {
  console.log(`\n=== Candidate Skills Migration (mode=${APPLY ? 'APPLY' : 'DRY-RUN'}) ===\n`);

  const [skills, candidates] = await Promise.all([
    prisma.skill.findMany({ select: { slug: true, nameVi: true, nameEn: true, aliases: true } }),
    prisma.candidate.findMany({
      where: { skills: { isEmpty: false } },
      select: { id: true, skills: true, legacySkills: true },
    }),
  ]);

  // Build exact-match index: normalized term → slug
  const exactMap = new Map<string, string>();
  for (const s of skills as SkillRow[]) {
    exactMap.set(norm(s.slug), s.slug);
    exactMap.set(norm(s.nameVi), s.slug);
    if (s.nameEn) exactMap.set(norm(s.nameEn), s.slug);
    for (const a of s.aliases) exactMap.set(norm(a), s.slug);
  }

  let totalItems = 0, exactHits = 0, trigramHits = 0, unmapped = 0, candidatesTouched = 0;
  const samples: string[] = [];

  for (const c of candidates) {
    const mappedSlugs = new Set<string>();
    const unmappedOriginals: string[] = [];
    let changed = false;

    for (const raw of c.skills) {
      totalItems++;
      const term = norm(raw);
      if (!term) continue;

      // Step 1: exact match
      const exact = exactMap.get(term);
      if (exact) {
        if (exact !== raw) changed = true;
        mappedSlugs.add(exact);
        exactHits++;
        continue;
      }

      // Step 2: pg_trgm fuzzy
      const rows = await prisma.$queryRawUnsafe<Array<{ slug: string; sim: number }>>(
        `SELECT slug,
                GREATEST(similarity("nameVi", $1), similarity(COALESCE("nameEn", ''), $1)) AS sim
         FROM "Skill"
         WHERE similarity("nameVi", $1) > 0.5 OR similarity(COALESCE("nameEn", ''), $1) > 0.5
         ORDER BY sim DESC
         LIMIT 1`,
        raw,
      );
      if (rows.length > 0) {
        mappedSlugs.add(rows[0].slug);
        trigramHits++;
        changed = true;
        if (samples.length < 12) samples.push(`  trigram: "${raw}" → ${rows[0].slug} (sim=${rows[0].sim.toFixed(2)})`);
        continue;
      }

      // Step 3: unmapped
      unmappedOriginals.push(raw);
      unmapped++;
      changed = true;
      if (samples.length < 12) samples.push(`  unmapped: "${raw}"`);
    }

    if (changed) {
      candidatesTouched++;
      const newSkills = Array.from(mappedSlugs).sort();
      const newLegacy = Array.from(new Set([...c.legacySkills, ...unmappedOriginals]));
      if (APPLY) {
        await prisma.candidate.update({
          where: { id: c.id },
          data: { skills: newSkills, legacySkills: newLegacy },
        });
      }
    }
  }

  console.log(`Candidates scanned:      ${candidates.length}`);
  console.log(`Candidates touched:      ${candidatesTouched}`);
  console.log(`Skill items total:       ${totalItems}`);
  console.log(`  → exact matches:       ${exactHits}`);
  console.log(`  → trigram matches:     ${trigramHits}`);
  console.log(`  → unmapped (legacy):   ${unmapped}`);
  if (samples.length > 0) {
    console.log(`\nSamples:`);
    for (const s of samples) console.log(s);
  }
  console.log(`\n${APPLY ? '✅ Applied to DB.' : 'ℹ️  Dry-run only. Re-run with --apply to commit.'}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
