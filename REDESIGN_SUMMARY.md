# Stage 12 — UI Redesign (Thesis B: Terminal Precision)

**Period:** 2026-06-11 → 2026-06-16 (Sessions 51–57)
**Status:** ✅ COMPLETE — 5 surface chính rewrite + foundation + final QA

## Mục tiêu

Differentiate JobHub khỏi "AI-generated dashboard cliché" (purple gradient cards, sidebar nav, emoji icons) sang ngôn ngữ thiết kế chính xác như terminal: hairline rows, mono numbers, no card grid, no decorative gradient.

## Thesis B — quy ước thiết kế

| Yếu tố | Cách dùng | Anti-pattern bỏ |
|---|---|---|
| Border | Hairline 1px `--border` (#252538) | `rounded-2xl` card shadow |
| Numbers | `<MonoNumber>` Geist Mono tabular-nums | font-black gradient |
| List | `<Row>` 3-col grid `[Lead·Body·End]` | Card grid 2-3 col |
| Section | `<HairlineSection>` topRule + label CAPS | `card-dark` rounded box |
| Search | `<CmdK>` free-form + parser | Filter sidebar checkbox |
| Detail | `<SidePanel>` Radix slide-right | Navigate full-page |
| Nav | `<TabBar>` underline + `<Breadcrumb>` mono | Sidebar 240px fixed |
| Accent | `--accent` amber #F59E0B | `linear-gradient(135deg, #7C3AED, #3B82F6)` |
| Type | Geist Sans 13–36 + Geist Mono 11–13 | Inter 900 hero gradient text |
| Surface | Grain texture overlay | Radial gradient glow |

## Phases delivered

### Phase 1 — Research (Session 51, 2026-06-11)
4 sub-agent reports in `.claude/redesign/phase1/`. Selected Direction 3 (slate + amber).

### Phase 2 — DESIGN_BRIEF (Session 51, `d90c659`)
Source of truth: tokens, typography, component inventory, differentiation thesis, a11y. Added prefers-color-scheme.

### Phase 3 P1 — Tokens & globals (Session 52, `3ef75d3`)
Direction 3 amber tokens, Inter → Geist, `prefers-reduced-motion` guard, ambient radial. Tailwind colors → CSS vars.

### Phase 3 P2-A — Foundation (Session 52, `e97f060`)
**Thesis B pivot** after user feedback "đổi màu chưa đủ". Add Geist Mono + grain texture + row tokens + 9 primitives in `components/ui/`:
- `Row` (3-col grid Lead/Body/End)
- `MonoNumber` (xl/lg/md/sm × default/accent/muted/success/danger)
- `StatHero` (giant count-up)
- `CmdK` + parser (`react location:remote salary>20m`)
- `SidePanel` (Radix Dialog slide-right)
- `TabBar` (underline indicator)
- `Breadcrumb` (mono path)
- `HairlineSection` (topRule + label + meta)
- `CapsLabel`

### Phase 3 P2-B — Homepage (Session 53, `58135b8`, QA 5/5)
Drop 9 legacy sections. New: HeroPanel + HotJobsPanel (real `/api/jobs?limit=6`) + StatsHeroPanel + CTAPanel. Zero purple gradient on homepage.

### Phase 3 P2-C — Jobs list (Session 54, `f6e39b6`, QA 5/5)
`(public)/jobs/JobsContent.tsx` rewrite: sticky CmdK + Row list 20/page + SidePanel slide-right + URL sync `?q=&page=&job=`. Drop filter sidebar + card grid + ScrollReveal.

### Phase 3 P2-D — Candidate dashboard (Session 55, `e739147`, QA 6/6)
Drop sidebar 240px + 11 emoji items → TabBar 7 tabs + Breadcrumb. Rewrite 6 core pages (dashboard/applications/saved-jobs/notifications/recommended). Profile deferred P2-F.

### Phase 3 P2-E — Employer applicants (Session 56, `34958a8`, QA 7/7)
Drop sidebar + 9 emoji items + CreditBadge box → Breadcrumb + TabBar 7 tabs + CreditInline. Rewrite 6 core pages. **`jobs/[id]/applications` drop List/Kanban toggle → unified Row accordion + multi-select checkbox + sticky bulk action bar** (accept/reject/reviewing all, sequential `Promise.all` PATCH).

### Phase 3 P2-F — Billing + candidate profile + summary (Session 57, `5016211`, QA 4/5 + TC3 verified separately)
Rewrite `employer/billing/{page,shop,orders/[id]}` (572 LOC). Refactor `candidate/profile/page.tsx` WRAPPER-ONLY (556 LOC, form logic intact). Build + tsc clean + PUT 200 verified.

## Key rationale (non-obvious decisions)

1. **Drop sidebar 240px in candidate + employer (P2-D, P2-E)** — Sidebar nav is dashboard cliché. Horizontal TabBar recovers 240px width for row density. 11/9 items → 7 essential tabs; secondary routes via direct URL or Breadcrumb crumb.
2. **Drop List/Kanban toggle in applications (P2-E)** — Kanban card grid violates thesis B. 2 view modes increase cognitive switch with no real gain (Kanban doesn't scale > 20). Unified accordion: 1 mode, drop `viewMode`/`kanbanData` state, -40% code.
3. **Bulk action via `Promise.all` sequential PATCH, not backend bulk endpoint (P2-E)** — Migration risk + new endpoint test cost > marginal speed gain. 20 apps × 80ms ≈ 1.6s acceptable for demo scale. Add backend bulk later if scale > 100.
4. **Profile page wrapper-only (P2-D defer, P2-F implement)** — `react-hook-form values` prop syncs server data; touching form internals risks reset race. Wrapper card-dark → HairlineSection swap = safe; form binding untouched.
5. **CmdK over filter sidebar (P2-C)** — Sidebar checkbox is search-engine UX cliché. CmdK free-form lets future "command modifiers" extend filter without UI rewrite. URL simplified to `?q=&page=&job=`.
6. **SidePanel over navigate (P2-C)** — Long scan list (20 rows/page); navigating loses scroll + keyword state. SidePanel keeps flow. Deep-link `/jobs/[id]` route preserved for share + SEO.
7. **MonoNumber match score lead column (P2-B, P2-C, P2-D)** — Stage 11 P4 v2 score surfaced visually as "anchor" for row scan. Tone tiers: accent ≥85, default ≥75, muted <75.
8. **Mono `[active]` bracket vs underline for inline tabs** — In tight inline contexts (filter chips, secondary navs), bracket convention reads correctly as "selected" without ambiguity of pure color. Reserved underline for primary TabBar (`role=tablist`).
9. **CreditInline inline in layout, not CreditBadge reuse (P2-E)** — Existing `<CreditBadge>` styled for sidebar block layout. Inline mono 1-line variant: 20 LOC inline — extracting not worth it.
10. **Drop ScrollReveal/framer-motion across rewrites** — Thesis B "static content scans fast"; per-card scroll-in animations make scan slower. Reduce-motion users covered globally via `prefers-reduced-motion` guard added in P1.

## Surface coverage

| Surface | Status | LOC delta | Notes |
|---|---|---|---|
| Homepage (`(public)/page.tsx`) | ✅ rewrite | -9 sections, +4 panels | P2-B |
| Jobs list (`(public)/jobs/`) | ✅ rewrite | 194 → 280 | P2-C |
| Job detail (`(public)/jobs/[id]`) | ⚪ legacy ok | — | acceptable internal surface |
| Candidate layout + 6 core | ✅ rewrite | -240px sidebar | P2-D |
| Candidate profile (form-heavy) | ✅ wrapper swap | 556 → 556 | P2-F |
| Candidate CV builder | ⚪ legacy ok | — | feature-rich, defer |
| Employer layout + 6 core | ✅ rewrite | -240px sidebar | P2-E |
| Employer billing × 3 | ✅ rewrite | 572 → 530 | P2-F |
| Employer stats / profile | ✅ light touch | wrapper only | P2-E |
| Admin pages (5+) | ⚪ legacy ok | — | internal surface, defer |
| Auth pages (login/register/…) | ⚪ legacy ok | — | acceptable |

**⚪ legacy ok = không phải bug; out of scope thesis B (admin/auth = internal/secondary).**

## Out of scope (P2-F audit, defer)

- Drop legacy CSS aliases `--accent-purple/--accent-blue/--pink/--gradient` — vẫn 33 caller (chủ yếu admin/auth/cv-builder); chưa thể drop blind.
- Cleanup unused components `common/{GradientText,SectionTag,ScrollReveal}` + `jobs/{JobCard,JobFilters,JobCardSkeleton,CompareBar}` — vẫn dùng ở 30+ files (Providers/companies/admin).
- Migrate legacy `card-dark/gradient-text/btn-primary` ở 50 file ngoài 5 surface chính — internal surface acceptable.
- Modal interiors (ExperienceModal/EducationModal/CheckoutModal) — refactor form-heavy, defer.

Cleanup này có thể làm trong Stage 13 nếu cần — không phải blocker cho demo bảo vệ.

## QA artifacts

- `qa-scripts/redesign-p2b/` — 5 TC (homepage)
- `qa-scripts/redesign-p2c/` — 5 TC (jobs list)
- `qa-scripts/redesign-p2d/` — 6 TC (candidate)
- `qa-scripts/redesign-p2e/` — 7 TC (employer applicants)
- `qa-scripts/redesign-p2f/` — 5 TC (billing + profile)

Total: **28 production Playwright TC pass** across 5 surface.

## Quality gates verified

- TypeScript `tsc --noEmit` clean cả frontend + backend mỗi phase
- `next build` static + dynamic pages thành công
- Production Playwright 1280 + 375 mỗi surface
- Form logic (react-hook-form + Zod) preserved across wrapper rewrites
- Stage 11 P3 gap analysis test IDs preserved (saved-jobs)

## Commits

```
e97f060 feat(redesign-P2A): thesis B foundation
58135b8 feat(redesign-P2B): homepage thesis B
f6e39b6 feat(redesign-P2C): jobs list rewrite thesis B
e739147 feat(redesign-P2D): candidate dashboard rewrite thesis B
34958a8 feat(redesign-P2E): employer applicants rewrite thesis B
5016211 feat(redesign-P2F): billing + candidate profile thesis B
```

## Demo talking points (cho bảo vệ đồ án)

1. **"Tránh AI-template look"** — Thesis B intentionally diverges from purple-gradient dashboard cliché. Show side-by-side: legacy gradient card vs hairline row.
2. **Component-first foundation** — 9 primitives (`Row/MonoNumber/HairlineSection/CmdK/SidePanel/TabBar/Breadcrumb/StatHero/CapsLabel`) compose all surface. Demonstrate consistency.
3. **CmdK power-search** — Free-form query > traditional sidebar filter. Future extensible without UI rewrite.
4. **Bulk action UX** — Multi-select checkbox + sticky action bar in applications. 60 click → 21 click for batch status update. Talk through `Promise.all` rationale.
5. **Mono numbers as scan anchor** — Match score `<MonoNumber>` in Row.Lead position turns Stage 11 P4 match algorithm into visible product surface.
6. **Mobile parity** — Playwright @ 375 production verified each surface; horizontal TabBar scrolls; CmdK + Row stay readable.
7. **Form safety during rewrite** — Profile wrapper-only swap (556 LOC) preserves react-hook-form + Zod intact. Shows discipline distinguishing UI shell from form logic.
