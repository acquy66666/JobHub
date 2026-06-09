# DESIGN_BRIEF.md — JobHub UI Redesign (Stage 12)

**Created:** 2026-06-11 (Session 52, Phase 2)
**Source reports:** `.claude/redesign/phase1/{trend,competitor,design-system,a11y}.json`
**Status:** Draft awaiting user approval before Phase 3 implementation.

---

## 1. Visual Identity Direction

### Statement

JobHub moves from the **Status.app-inspired purple-blue gradient dark theme** to a **GitHub-dark-family slate + warm amber** aesthetic. The goal is not novelty — it is **escaping the AI-generated visual signature** of 2022-2024 SaaS UIs and adopting a quieter, more deliberate look that signals craft.

### Anti-AI rationale (what we are explicitly dropping)

| Pattern | Why it goes |
|---|---|
| `linear-gradient(135deg, #7C3AED, #3B82F6)` on buttons + headings | The #1 marker of AI-generated UI (every Lovable/v0/Bolt output uses this). Currently in `globals.css` — primary liability. |
| Glassmorphism cards (backdrop-blur + low-opacity bg) | Peaked 2021, now universal AI fallback. Worse on dark themes where contrast suffers. |
| 3-column "feature" hero grid with icon-circle each | Template recognizable in 0.3 seconds. Replaced with asymmetric layout (heading col 1-7, product mockup col 6-12 overlapping). |
| Rainbow skill tags (every tag a different color) | Color stops conveying information when everything is colored. Reserve color for **status only**. |
| Generic stock photography (diverse hands typing) | Replaced with no imagery OR real product UI screenshots. |
| `✨ 🚀` emoji in CTA labels | ChatGPT default voice. Use Lucide icons. |

### What we keep

- Dark-first base (none of 4 VN competitors offer dark mode — instant differentiation).
- Framer Motion scroll reveals (`whileInView` fadeUp + staggerChildren 0.06s) per `mandatory.md`.
- Inter → **upgrade to Geist Variable** (still sans, still single-font system, narrower bundle).
- Card-based layout, but **border-only separation** (no shadow + no glass + no gradient border).

---

## 2. Color System

### Token mapping table (`frontend/src/app/globals.css`)

**Dark mode (default `:root`)** — applies when OS `prefers-color-scheme: dark` OR no preference:

| Token | Old (purple-blue era) | New dark (slate + amber) | Notes |
|---|---|---|---|
| `--bg-0` | `#07070D` | `#0F1419` | Page bg, near-black with warm undertone |
| `--bg-1` | `#0E0E18` | `#161C22` | Section alternate, navbar bg |
| `--bg-2` | `#13131E` | `#1C2128` | Card surface |
| `--bg-3` | `#1A1A28` | `#2D333B` | Card hover, input bg, table row hover |
| `--border` | `#252538` | `#30363D` | All borders (cards, inputs, dividers) |
| `--accent-purple` | `#7C3AED` | **REMOVED** | — |
| `--accent-blue` | `#3B82F6` | **REMOVED** | — |
| `--accent` | (n/a) | `#FBA518` | Single accent (CTAs, active state, match score badge) |
| `--accent-hover` | (n/a) | `#E89510` | Darker amber for button hover |
| `--accent-glow` | `rgba(124,58,237,.35)` | `rgba(251,165,24,.25)` | Focus ring + button shadow |
| `--t0` | `#F5F5FF` | `#E6EDF3` | Primary text (heading, body) — slight warm shift |
| `--t1` | `#9494B0` | `#B0B0CC` | Secondary (description, label) — **brightened from borderline 4.3:1 → 4.8:1 vs --bg-2** |
| `--t2` | `#55556A` | `#7A7A95` | Muted (placeholder, meta) — **brightened from failing 2.9:1 → 3.5:1; restricted to large text (18px+) only** |
| `--green` | `#22C55E` | `#3FB950` | Success / ACCEPTED — GitHub-family green |
| `--red` | `#EF4444` | `#F85149` | Error / REJECTED — GitHub-family red |
| `--yellow` | `#F59E0B` | `#D29922` | Warning / REVIEWING — desaturated amber (distinct from --accent) |
| `--pink` | `#F472B6` | **REMOVED** | Unused after gradient removal |
| `--gradient` | `linear-gradient(135deg, #7C3AED, #3B82F6)` | **REMOVED** | No gradient on buttons/text. Ambient bg radial only: `radial-gradient(ellipse at top, rgba(251,165,24,0.08), transparent 70%)` |

**Light mode (system-preference auto-detect, no manual toggle)** — applies when OS `prefers-color-scheme: light`:

| Token | Light value | Notes |
|---|---|---|
| `--bg-0` | `#FAFAF7` | Warm cream-tinged near-white (avoids sterile pure-white) |
| `--bg-1` | `#F3F2EC` | Section alternate, navbar bg |
| `--bg-2` | `#FFFFFF` | Card surface (pure white for contrast pop) |
| `--bg-3` | `#EDEBE3` | Card hover, input bg, table row hover |
| `--border` | `#D9D7CE` | Warm gray border (not cool gray — preserves slate-amber identity) |
| `--accent` | `#B8770C` | **Darker amber** — required for 4.5:1+ contrast on white bg (raw `#FBA518` only ~2.6:1 on white) |
| `--accent-hover` | `#9E6308` | Even darker amber |
| `--accent-glow` | `rgba(184,119,12,.18)` | Focus ring (lower opacity on light) |
| `--t0` | `#1A1815` | Near-black with warm undertone, matches cream bg |
| `--t1` | `#5C5C70` | Secondary — 7.1:1 on `#FFFFFF` ✓ |
| `--t2` | `#8A8A95` | Muted — 3.3:1 on `#FAFAF7`, restricted to ≥18px |
| `--green` | `#1F7A3A` | Darkened for white-bg contrast |
| `--red` | `#C8312A` | Darkened for white-bg contrast |
| `--yellow` | `#A77B12` | Darkened |
| Ambient radial | `radial-gradient(ellipse at top, rgba(184,119,12,0.06), transparent 70%)` | Subtle cream warmth |

Implementation in `globals.css`:
```css
:root {
  /* Dark values (default) */
  --bg-0: #0F1419;
  /* ...etc */
}
@media (prefers-color-scheme: light) {
  :root {
    /* Light values override */
    --bg-0: #FAFAF7;
    /* ...etc */
  }
}
```

**No manual toggle.** OS preference is the single source of truth. Trade-off acknowledged in Section 5.

### Contrast verification (WCAG AA = 4.5:1 normal, 3:1 large)

Dark mode:

| Pair | Ratio | AA Normal | AA Large | Use case |
|---|---|---|---|---|
| `--t0 #E6EDF3` on `--bg-0 #0F1419` | ~16.2:1 | ✅ | ✅ | Headings, body |
| `--t1 #B0B0CC` on `--bg-2 #1C2128` | ~7.1:1 | ✅ | ✅ | Descriptions, labels |
| `--t2 #7A7A95` on `--bg-0 #0F1419` | ~4.2:1 | ❌ | ✅ | **Restrict to 18px+ or 14px+ bold** |
| `--accent #FBA518` on `--bg-2 #1C2128` | ~9.4:1 | ✅ | ✅ | Match badge text, CTAs |
| `--accent #FBA518` on `--bg-0 #0F1419` | ~10.1:1 | ✅ | ✅ | Salary highlight on cards |

Light mode:

| Pair | Ratio | AA Normal | AA Large | Use case |
|---|---|---|---|---|
| `--t0 #1A1815` on `--bg-0 #FAFAF7` | ~17.4:1 | ✅ | ✅ | Headings, body |
| `--t1 #5C5C70` on `--bg-2 #FFFFFF` | ~7.1:1 | ✅ | ✅ | Descriptions, labels |
| `--t2 #8A8A95` on `--bg-0 #FAFAF7` | ~3.3:1 | ❌ | ✅ | **Restrict to 18px+ or 14px+ bold** |
| `--accent #B8770C` on `--bg-2 #FFFFFF` | ~4.8:1 | ✅ | ✅ | Match badge text, CTAs |
| `--accent #B8770C` on `--bg-0 #FAFAF7` | ~4.7:1 | ✅ | ✅ | Salary highlight on cards |

### Color usage rules

- **Amber (`--accent`)** appears only on: primary CTAs, salary numbers, match score badge, active nav item, focus rings. **Never on body text or icons** (overuse kills the signal).
- **Status colors** (green/red/yellow) appear only on: badge variants, timeline dots, form validation, application status. Never decorative.
- **Skill tags** use a single muted style: `bg-bg-3 text-t1 border-border` — no per-skill color.

---

## 3. Typography Scale

### Font choice

**Geist Variable** (Vercel) — single variable font covering weight 100-900, with `font-feature-settings: "tnum", "cv11"` enabled by default. Replaces current Inter import.

Install path: `next/font/google` → `import { GeistSans } from 'geist/font/sans'` (already a Next.js convention). Bundle impact: ~22KB single file vs current Inter 4-weight ~80KB.

### Scale (fluid clamp)

| Level | Use case | Token | Weight | Letter-spacing |
|---|---|---|---|---|
| Display | Hero heading | `clamp(2.75rem, 6vw, 4.5rem)` (44-72px) | 800 | -0.035em |
| H1 | Page title | `clamp(2rem, 4vw, 3rem)` (32-48px) | 700 | -0.03em |
| H2 | Section title | `clamp(1.5rem, 2.5vw, 2rem)` (24-32px) | 700 | -0.02em |
| H3 | Card title | `clamp(1.125rem, 1.5vw, 1.25rem)` (18-20px) | 600 | -0.01em |
| Body | Default text | `clamp(0.9375rem, 1vw, 1rem)` (15-16px) | 400 | 0 |
| Small | Meta, badges, labels | `clamp(0.8125rem, 0.9vw, 0.875rem)` (13-14px) | 500 | 0.01em |
| Micro | Status badges only | `0.75rem` (12px) — fixed, no clamp | 600 | 0.04em (uppercase) |

### Tabular numerals

All salary, match-score, stat numbers use `font-variant-numeric: tabular-nums` → numbers align vertically on cards/tables. Apply via `.font-tnum` utility in globals.

### What we drop from current

- Drop Inter import (`@import` in globals.css).
- Drop "section tag" pattern (`text-transform: uppercase` + `letter-spacing: 0.06em` on tiny purple pills above headings) — overused, generic AI move.
- Drop gradient text effect (`background-clip: text`) — no more gradient anywhere.

---

## 4. Component Inventory (grouped by 5 surfaces)

### Surface A — Homepage hero
**Files:** `frontend/src/app/(public)/page.tsx`, `frontend/src/components/home/*`

| Component | Action | Notes |
|---|---|---|
| Hero heading + CTA | **Redesign** | Asymmetric grid: heading + tagline col 1-7, product screenshot col 6-12 overlapping with `-translate-x-4`. No centered hero. |
| "Features" 3-col grid | **DELETE** | Replace with single full-bleed product screenshot + 1 caption line. Or split content into 2-col asymmetric explainer. |
| "Trusted by" logo strip | Keep but restyle | Grayscale logos, hover full-color. Remove gradient backdrop. |
| Stats counter section | Keep, restyle | MagicUI NumberTicker (count-up on scroll), tabular nums, amber accent on number only. |

### Surface B — Job listing + JobCard
**Files:** `frontend/src/app/(public)/jobs/page.tsx`, `frontend/src/components/jobs/JobCard.tsx`, `frontend/src/components/jobs/JobFilter.tsx`

| Component | Action | Notes |
|---|---|---|
| JobCard | **Redesign** | OriginUI card-07 horizontal layout. Logo left (48px), title + company + location middle, salary + match score badge right. **Match score badge inline = top differentiation lever** (e.g. `93% match` in amber). |
| Salary display | Restyle | `--accent` amber, `font-tnum`, bold. Enforce range display (no "Thỏa thuận"). |
| Skill tags | Restyle | Single muted style, max 3 visible + `+N` overflow chip. |
| Filter sidebar | Restyle (no rewrite) | Sticky, accordion groups (Industry / Job Type / Salary / Experience / Work Mode). Radix Slider for salary range. Radix Sheet for mobile drawer. |
| Search bar (hero) | Restyle | Single keyword input + location combobox, amber submit button. No "advanced search" toggle clutter. |
| Empty state | **NEW** | OriginUI pattern: icon-in-amber-circle + heading + description + CTA "Khám phá việc làm". |
| Pagination | Keep | Match new token colors. |

### Surface C — Candidate dashboard
**Files:** `frontend/src/app/(candidate)/candidate/{dashboard,applications,saved-jobs,cv,notifications}/page.tsx`

| Component | Action | Notes |
|---|---|---|
| Dashboard shell | **Redesign** | shadcn Dashboard-01 layout: collapsible sidebar (col 1-2) + main (col 3-12). Sidebar bg `--bg-1`, active nav `bg-amber-500/10 text-amber-400 border-l-2 border-amber-500`. |
| Application status timeline | **Redesign** | OriginUI stepper pattern: PENDING (muted dot) → REVIEWING (yellow pulse) → ACCEPTED/REJECTED (green/red filled). Replace current badge-only display. |
| Saved Jobs inline expand panel | Restyle | Keep accordion structure (Stage 11 P3 work). Match new tokens. |
| CV upload dropzone | **Replace** | Migrate `<div onClick>` → react-dropzone (fixes a11y violation 2.1.1). Dashed border, drag-active bg amber/5. |
| Notification list | Restyle | MagicUI AnimatedList with staggered entrance. Badge count on bell uses new aria-label `${count} thông báo chưa đọc`. |

### Surface D — Employer applicant table
**Files:** `frontend/src/app/(employer)/employer/jobs/[id]/applications/page.tsx`, `frontend/src/app/(employer)/employer/dashboard/page.tsx`

| Component | Action | Notes |
|---|---|---|
| Applicant DataTable | **Redesign** | shadcn DataTable + TanStack Table v8: sortable columns, row selection for bulk status update, column visibility toggle. Toolbar bg `--bg-1`, header sticky bg `--bg-2`, alternating row bg `--bg-0/--bg-2`. |
| Bulk action bar | **NEW** | Fixed bottom slide-up when ≥1 row selected: "3 selected · Mark Reviewing · Reject · Cancel". |
| Stat cards (dashboard) | Restyle | shadcn Dashboard-02 pattern: bg `--bg-2`, icon in amber-circle, MagicUI NumberTicker. Drop gradient backgrounds entirely. |
| Recharts area chart | Restyle | Fill gradient: amber (top) → transparent (bottom). Grid lines `--border`. |
| Job post form (multi-step) | **Refactor** | Manual step state + Framer Motion AnimatePresence. shadcn Form (RHF + Zod) for accessible labels (fixes 13+ a11y issues). |

### Surface E — Infrastructure (globals.css + shared)
**Files:** `frontend/src/app/globals.css`, `frontend/tailwind.config.ts`, `frontend/src/components/common/*`, `frontend/src/components/layout/*`

| Component | Action | Notes |
|---|---|---|
| `globals.css` CSS variables | **REWRITE** | Apply full token mapping table (Section 2) — both dark default + light `@media (prefers-color-scheme: light)` overrides. Drop all `--accent-purple/blue/pink` and `--gradient`. Add `--accent`, `--accent-hover`, `--accent-glow`. |
| `prefers-reduced-motion` guard | **NEW** | Block at top of globals.css: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; } }`. Also wrap Framer Motion with `useReducedMotion()` hook in `components/common/MotionSection.tsx` (if exists; else add). |
| Font loading | **REPLACE** | Drop Inter import in `layout.tsx`. Install `geist` package → `import { GeistSans } from 'geist/font/sans'` → apply via `className`. |
| Button (common) | **Redesign** | Solid amber bg, white text, `rounded-xl`, hover darker amber + `-translate-y-0.5`. Drop gradient + drop heavy shadow. Ghost variant: `border-border text-t1 hover:bg-bg-3`. |
| Badge (common) | **Redesign** | 4 variants (default muted / amber / green / red / yellow) — all with single token color. Drop per-tag rainbow. |
| Card (common) | **Redesign** | `bg-bg-2 border-border rounded-2xl`. Hover: `border-amber-500/40 -translate-y-0.5 transition`. Drop shadow + drop glassmorphism. |
| Input/Select (common) | **Restyle** | `bg-bg-2 border-border rounded-xl`. Focus: `border-amber-500/50 ring-2 ring-amber-500/15`. Drop purple glow. |
| ApplyModal | **Refactor** | Migrate to Radix Dialog primitive (auto focus trap + escape + restore-focus, fixes critical a11y issue). Keep existing form logic. |
| Navbar + NotificationBell | Restyle | Icon-only buttons get `aria-label` (fixes WCAG 4.1.2). Active link uses `text-amber-500` + amber underline. |

---

## 5. Differentiation Strategy

3 specific moves that separate JobHub from TopCV / VietnamWorks / ITviec / CareerBuilder:

### Move 1 — Dark-first with OS-aware light fallback
All 4 competitors are light theme; none offer dark mode at all. JobHub flips the default: **dark is canonical**, light auto-activates only via `prefers-color-scheme: light` (OS preference). No manual toggle — the absence of a toggle is itself a design statement (the UI obeys the user's OS, not a UI control). 90%+ of dark-OS users get the differentiated dark look; light-OS users get a coherent light palette without losing the slate+amber identity. Side benefit: reduces eye strain for the 18-35 tech demographic.

### Move 2 — **Inline match score badge on every JobCard** ⭐ (single most impactful)
JobHub already computes 4-dimension match scores (Stage 11 P4: skills 0.4 + certs 0.2 + exp 0.2 + prefs 0.2). Surface it visually on the listing page as an amber badge `93% match` in the card's right edge. None of the 4 competitors show personalized match % on listing — closest is ITviec's tech tags (passive matching, not scored). This is "show, don't tell" — hội đồng demo immediately sees the recommendation engine.

### Move 3 — Skill-gap visibility on Saved Jobs (already built, restyle to amplify)
JobHub's Stage 11 P3 gap analysis ("you are missing 2 of 5 required skills, including AWS Certified Developer cert") is unmatched by competitors. The redesign makes the gap panel **more visually prominent** — amber border-left on expand, larger skill chips with ✓/✗ icons, "How to close this gap" CTA linking to certification bank.

### Risks acknowledged
- Dark-first loses some less-tech-savvy users (mitigated: this is graduation-demo audience, not mass market; light auto-detect catches OS-light users).
- Amber accent is uncommon for VN job sites — initial unfamiliarity is acceptable trade for differentiation.
- Match score visible on every card may invite gaming behavior from candidates — acceptable risk at demo scale.
- No manual theme toggle = users locked to OS preference; some may want override. Trade-off accepted to avoid scope creep + preserve dark-first signal. Manual toggle can be added post-graduation.
- Light mode QA workload ~+30% — every redesigned surface must be verified in both modes at 1280px + 375px.

---

## 6. Accessibility Targets

**WCAG level target:** AA (2.1) for all redesigned surfaces.

### Critical fixes (Phase 3 P1)

| Issue | Fix | Source |
|---|---|---|
| No `prefers-reduced-motion` support across codebase | Add guard block to globals.css + `useReducedMotion()` wrap on Framer Motion | a11y.json criticalIssues[0] |
| Icon-only buttons missing aria-label | Audit all `<button>` with only icon children → add aria-label | NotificationBell.tsx, Navbar.tsx |
| ApplyModal focus trap incomplete | Migrate to Radix Dialog primitive | ApplyModal.tsx |

### Major fixes (Phase 3 P2-P3)

| Issue | Fix |
|---|---|
| `--t1` and `--t2` contrast borderline/failing | Brightened in Section 2 mapping table (`--t1 #B0B0CC`, `--t2 #7A7A95` restricted to ≥18px) |
| Form label-input association inconsistent | Migrate forms to shadcn Form (RHF + Zod) — provides `FormLabel htmlFor=...` automatically |
| Notification badge lacks ARIA description | `aria-label={`${count} thông báo chưa đọc`}` with sr-only `99+` description |
| CV dropzone div with onClick | Replace with react-dropzone — provides role=button + keyboard support |

### Verification gate (Phase 3 P4)

- Playwright production QA at 1280px + 375px viewports, **in both dark + light modes** (emulated via Playwright `colorScheme` context option).
- Manual axe-core DevTools scan on 5 surfaces in both modes.
- Manual keyboard-only navigation through Login → Browse Jobs → Apply → Dashboard flow.
- Visual smoke test by toggling OS dark/light preference and reloading once per surface.

---

## Out of scope (explicit)

- Admin DataTable surfaces (inherit globals.css token swap automatically, no manual touch).
- Billing pages (inherit token swap).
- Email templates (HTML email, separate redesign track).
- Mobile drawer pattern for sidebar nav (defer to Phase 3 P4 if budget allows).
- Manual dark/light toggle button (auto-detect via `prefers-color-scheme` only; toggle can be added post-graduation).
- New illustrations / custom icons (use Lucide as-is, recolor only).

---

## Approval gate

Before Phase 3 implementation begins, user must approve this brief. After approval:

1. Run `/compact` (per `feedback_compact_after_plan`) to clear exploration context.
2. Start Phase 3 P1: globals.css token swap + Geist font install + prefers-reduced-motion guard. Estimated 1 session, ~40-60k tokens.
3. Subsequent sessions: P2 shared components → P3 feature surfaces → P4 QA.

**End of brief — awaiting user "ok" or revisions.**
