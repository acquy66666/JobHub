# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**JobHub** — full-stack recruitment website (đồ án tốt nghiệp). 3 user roles: Candidate, Employer, Admin. Dark theme inspired by Status.app.

**Current stage:** Stage 7 — Candidate Side Expansion (planned, 2026-06-03). Stage 6 ✅ COMPLETE (2026-06-02). Stage 5 ✅ COMPLETE (2026-06-02). Stages 0–4 complete (2026-05-25). Full-stack running: Next.js 14 App Router (`frontend/src/`), Express.js + Prisma (`backend/src/`), PostgreSQL via Docker Compose. HTML prototypes archived in `prototype/`.

**Stage 5 done (100%):** SEO, error boundaries, seed data, deploy (Render + Vercel), proxy architecture, auth login hoạt động. BUG-1 → BUG-9 đã fix. TC1 ✅, TC2a ✅, TC2b ✅, TC2c ✅, TC3 ✅, TC4 ✅, TC5 ✅, TC6 ✅. TC7 hoãn theo yêu cầu. Email: Brevo REST API (HTTPS port 443, không dùng SMTP). Env vars: `BREVO_API_KEY` + `BREVO_SENDER_EMAIL` trong Render.
**Stage 6 Nhóm 1 done:** Job Analytics Columns ✅, Employer Verification Badge ✅, Profile Completeness Meter (enhanced) ✅, Job Post Templates ✅. Commit `c1fd287`.
**Stage 6 Nhóm 2 done (100%):** Candidate Shortlist & Tags ✅, Platform Analytics Charts v2 ✅, Job Match Score ✅, Candidate Database Search ✅, Bulk Export Applications (CSV) ✅, Content Moderation Queue ✅. Commits `3dc2769`–`d170334`.
**Stage 6 Nhóm 3 done (100%):** Audit Logs ✅, Email Job Alerts ✅, Fraud Detection ✅. Commit `c8c4891`. Schema: `AuditLog` + `JobAlert` models, `isFlagged`/`flagReason` trên `Job` — đã migrate Supabase.
**Stage 6 COMPLETE.** Nhóm 4 (Kanban, Salary Benchmark, Reviews, Zalo, Payment) — deferred v2+.
**Production fix (2026-06-02):** BUG-10 fixed — Vercel build fail do ESLint unescaped `"` trong `admin/reports/page.tsx`. Seed data enhanced: +3 flagged jobs, +8 reports, +19 audit logs, +3 job alerts, +5 application tags inserted via Supabase MCP. Commit `8b20c98`.
**Production verify (2026-06-02, session 9):** Render auto-deploy webhook broken → 4 trang Stage 6 Nhóm 3 empty. Fix: Manual Deploy trên Render dashboard. Tất cả 4 trang verified: `/admin/logs` ✅, `/candidate/job-alerts` ✅, `/admin/jobs` flagged tab ✅, `/admin/reports` ✅.

**Stage 7 Phase A done (2026-06-03, session 11):** Commit `12d7f01`. F1 In-app Notification Center ✅ (schema + backend 5 endpoints + NotificationBell polling 60s + /candidate/notifications page). F5 Recently Viewed ✅ (localStorage max 20 + hook /jobs/[id] + /candidate/recently-viewed page). Sidebar redesign ✅ (4 nhóm NAV_GROUPS: HOẠT ĐỘNG/HỒ SƠ/KHÁM PHÁ/CÀI ĐẶT + 4 placeholder pages). Dashboard redesign ✅ (HERO + 4 metrics + 2-col grid + horizontal scroll). `tsc --noEmit` clean + ESLint clean (no new errors).
**Stage 7 Phase B done (2026-06-03, session 12):** Commit `726c370`. F3 Recommended Jobs ✅ (rule-based scoring 0.5*skills+0.2*location+0.2*industry+0.1*recency + /candidate/recommended page + dashboard section). F2 Followed Companies ✅ (FollowedCompany model + db push + follow/unfollow/list + follow button on /companies/[id] + /candidate/followed-companies page + admin approve job → notify followers). F4 Application Timeline + Kanban ✅ (ApplicationStatusHistory model + db push + history recording on status change + APPLICATION_STATUS_CHANGED notification + applications page 3-view List/Kanban/Timeline). `tsc --noEmit` clean + ESLint warnings only (pre-existing).
**Stage 7 Phase C (session 13, 2026-06-04):** F8 Multiple CVs ✅ (CandidateCV model + Supabase migration + 4 endpoints GET/POST /candidate/cvs + PATCH /cvs/:id/default + DELETE /cvs/:id + rewrite /candidate/cv page + ApplyModal tự query CVs nội bộ, bỏ props savedCvUrl/savedCvFileName). F6 Profile Public View ✅ (publicSlug + isPublicProfile trên Candidate + Supabase migration + GET /api/public/candidates/:slug no-auth + PATCH /candidate/profile/public-settings + /u/[slug] public page + /candidate/preview rewrite + profile page section). F7 Job Comparison 📋 pending. `tsc --noEmit` clean cả backend + frontend sau mỗi feature.

**Deployed URLs:**
- Frontend: `https://job-hub-two.vercel.app`
- Backend: `https://jobhub-700v.onrender.com`

Track progress in [`PROJECT_PLAN.md`](PROJECT_PLAN.md).

## Repo layout

```
frontend/src/
  app/
    (public)/      # Landing, /jobs, /companies — no auth required
    (auth)/        # /login, /register, /verify-email, /reset-password
    (candidate)/   # /candidate/dashboard, profile, cv, applications, saved-jobs
    (employer)/    # /employer/dashboard, profile, jobs (CRUD), applications
    (admin)/       # /admin/dashboard, jobs (approve), users (ban/unban)
  components/
    layout/        # Navbar, Footer
    common/        # ScrollReveal, Pagination, GradientText, SectionTag
    home/          # HeroSection, FeaturesSection, StatsSection, etc.
    jobs/          # JobCard, JobFilters, JobCardSkeleton, ApplyModal
    employer/      # JobForm
  lib/             # api.ts (Axios), queryKeys.ts, formatters.ts, store (Zustand)
backend/src/
  routes/          # auth, jobs, candidate, employer, admin, health
  controllers/     # auth, job, candidate, employer, admin
  services/        # auth, job, candidate, employer, admin
  middlewares/     # authGuard, roleGuard, upload (multer), errorHandler
  utils/           # jwt, email (Brevo REST API — HTTPS, không dùng SMTP)
  lib/             # prisma.ts, cloudinary.ts
  config/          # env.ts (Zod-validated)
backend/prisma/
  schema.prisma    # 10 models, all migrations applied
  seed.ts          # 28 jobs, 5 companies, 9 users, 20 applications
screenshots/       # UI screenshots for design comparison
prototype/         # Original HTML prototypes (design reference)
```

Simple monorepo — no Turborepo. Each app has its own `package.json`.

## Dev commands

Once initialized, run from each subdirectory:

```bash
# Frontend (frontend/)
npm run dev          # Next.js dev server → http://localhost:3000
npm run build
npm run lint

# Backend (backend/)
npm run dev          # ts-node-dev, nodemon → http://localhost:8080
npm run build
npx prisma migrate dev   # apply schema changes
npx prisma studio        # browse DB in browser
npx prisma db seed       # seed demo data

# E2E tests (root)
npx playwright test
npx playwright test --ui
```

## Architecture decisions

- **Auth tokens:** `accessToken` (15m) stored in Zustand memory only; `refreshToken` (7d) in httpOnly cookie. Frontend uses Axios interceptor to auto-refresh on 401.
- **File uploads:** `multipart/form-data` → multer → Cloudinary → save URL to DB. Validate type (PDF/image) + size (≤5 MB) before upload.
- **Pagination:** Always server-side. Never load full lists to client.
- **Transactions:** Use Prisma transactions for multi-step writes (e.g., `User` + `Candidate` created atomically on register).

## Key constraints

- Never return `passwordHash` in any API response — filter at service layer.
- Every page section must have scroll-reveal animation (Framer Motion `whileInView` + `viewport={{ once: true }}`). No static sections.
- After any significant UI change: take a screenshot into `screenshots/` and compare against `screenshots/status.app__ref=godly.png`.
- Rate-limit auth routes: 10 requests / 15 min per IP.

## Design tokens

CSS variables defined in `index.html` (to be ported to `tailwind.config.ts`):

| Token | Value | Use |
|---|---|---|
| `--bg-0` | `#07070D` | Main background |
| `--bg-2` | `#13131E` | Card surface |
| `--border` | `#252538` | All borders |
| `--accent-purple` | `#7C3AED` | Primary accent |
| `--accent-blue` | `#3B82F6` | Secondary accent |
| `--t0` | `#F5F5FF` | Primary text |
| `--t1` | `#9494B0` | Secondary text |

Gradient: `linear-gradient(135deg, #7C3AED, #3B82F6)` — used for buttons, logo, gradient text.

## Detailed references

| Topic | File |
|---|---|
| Mandatory rules (screenshot, animation, security) | [`.claude/rules/mandatory.md`](.claude/rules/mandatory.md) |
| Full Prisma schema + DB indexes | [`.claude/rules/database.md`](.claude/rules/database.md) |
| All API endpoints + .env variables | [`.claude/rules/api.md`](.claude/rules/api.md) |
| UI components, typography, badge patterns | [`.claude/rules/ui-design.md`](.claude/rules/ui-design.md) |
| Module breakdown by user role | [`.claude/rules/modules.md`](.claude/rules/modules.md) |
| Tech stack choices + rationale | [`.claude/rules/tech-stack.md`](.claude/rules/tech-stack.md) |
| Dev principles + thesis defence scoring tips | [`.claude/rules/dev-guidelines.md`](.claude/rules/dev-guidelines.md) |
