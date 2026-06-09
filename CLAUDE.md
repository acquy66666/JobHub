# CLAUDE.md

Guidance for Claude Code working in this repo. Keep this file under ~150 lines — đặt lịch sử dài vào [`.claude/SESSION_LOG.md`](.claude/SESSION_LOG.md).

## Project

**JobHub** — full-stack recruitment website (đồ án tốt nghiệp). 3 roles: Candidate, Employer, Admin. Dark theme inspired by Status.app.

**Stack:** Next.js 14 App Router (`frontend/src/`), Express + Prisma 7 (`backend/src/`), PostgreSQL via Supabase. Deployed: Frontend Vercel (`https://job-hub-two.vercel.app`), Backend Render (`https://jobhub-700v.onrender.com`).

## Current state

**Stage 12 — UI Redesign** (anti-AI aesthetic) — Phase 1 Research DONE session 51. Stage 1-11 ✅ COMPLETE.

**Last 3 sessions** — chi tiết rationale ở [`.claude/SESSION_LOG.md`](.claude/SESSION_LOG.md):
- **Session 51 (2026-06-11)** — Stage 12 Phase 1 UI Redesign Research DONE. 4 sub-agent reports saved to `.claude/redesign/phase1/` (trend, competitor, design-system, a11y). User approved **Direction 3 Deep slate + amber** (`#0F1419` base + `#FBA518` accent, drop purple-blue gradient) + Geist Variable single-font + 5-surface scope. Next: Phase 2 synthesize DESIGN_BRIEF.md.
- **Session 50 (2026-06-10)** — Stage 11 P4 Match Score v2 consolidated DONE QA 5/5 (`5e08e92`). Refactor recommendation.service.ts: skills 0.4 + certs 0.2 + exp 0.2 + prefs 0.2, mọi dimension normalize [0,1].
- **Session 49 (2026-06-09)** — Stage 11 P3 Gap Analysis on Saved Jobs DONE QA 6/6 (`4fc2b28`). Schema `Job.requiredCertificateSlugs` + endpoint + JobForm cert multi-select + inline expand panel.

**Active backlog:** Stage 12 Phase 2 (DESIGN_BRIEF.md synthesis) → Phase 3 implement 5 surfaces.

## Repo layout

```
frontend/src/
  app/(public|auth|candidate|employer|admin)/   # route groups by role
  components/{layout,common,home,jobs,employer,skills,certificates,billing}/
  lib/{api,store,formatters,queryKeys}.ts
backend/src/
  routes/        # express routers
  controllers/   # thin (parse req, call service)
  services/      # business logic (most complexity here)
  middlewares/   # authGuard, roleGuard, upload (multer), errorHandler
  utils/         # jwt, email (Brevo REST), cloudinary
backend/prisma/schema.prisma   # source of truth, migrations via Supabase MCP apply_migration
qa-scripts/     # Playwright production QA per feature (untracked)
.claude/rules/  # detailed conventions (lazy-read, NOT auto-loaded by default rule)
```

## Dev commands

```bash
# Frontend
cd frontend && npm run dev          # http://localhost:3000
npm run build && npm run lint
# Backend
cd backend && npm run dev           # http://localhost:8080
npx prisma generate                 # after schema.prisma change
# QA
node qa-scripts/<feature>/qa.js     # production Playwright
```

## Key conventions

- **Auth:** `accessToken` (15m) in Zustand memory; `refreshToken` (7d) httpOnly cookie. Axios interceptor auto-refreshes on 401. `req.user.userId` (NOT `req.userId`) from `authGuard` — copy-paste pattern hay sai.
- **Schema changes:** dùng Supabase MCP `apply_migration` (Render Shell mất phí — xem `feedback_render_shell_paid`).
- **Deploy:** Vercel auto. Render auto-deploy webhook hay broken → Manual Deploy cho backend change.
- **QA:** Production only — local dev login fail vì cookie sameSite=none + secure=false (xem `reference_local_dev_login_broken`).
- **Mobile QA:** Playwright @ 375px mandatory cùng session (xem `feedback_no_defer_mobile_qa`).
- **Plan trước code:** Mọi task chính phải xuất plan chi tiết → đợi "ok" → mới code (xem `feedback_plan_before_main_task`).

## Security (tuyệt đối)

- Không trả `passwordHash` trong response — filter ở service.
- Không log token/password ra console.
- Validate input ở cả frontend (Zod) và backend (Zod).

## Design tokens (Status.app inspired dark theme)

| Token | Value |
|---|---|
| `--bg-0` / `--bg-2` | `#07070D` / `#13131E` |
| `--border` | `#252538` |
| `--accent-purple` / `--accent-blue` | `#7C3AED` / `#3B82F6` |
| `--t0` / `--t1` | `#F5F5FF` / `#9494B0` |

Gradient: `linear-gradient(135deg, #7C3AED, #3B82F6)`.

## Detailed docs (lazy-read khi cần)

| Topic | File |
|---|---|
| Long-form session rationale | [`.claude/SESSION_LOG.md`](.claude/SESSION_LOG.md) |
| Stage checklist + tasks | [`PROJECT_PLAN.md`](PROJECT_PLAN.md) |
| All API endpoints | [`.claude/rules/api.md`](.claude/rules/api.md) |
| Prisma schema reference | [`.claude/rules/database.md`](.claude/rules/database.md) |
| UI components + tokens | [`.claude/rules/ui-design.md`](.claude/rules/ui-design.md) |
| Module per role | [`.claude/rules/modules.md`](.claude/rules/modules.md) |
| Mandatory rules (screenshot/animation) | [`.claude/rules/mandatory.md`](.claude/rules/mandatory.md) |
| Tech stack + rationale | [`.claude/rules/tech-stack.md`](.claude/rules/tech-stack.md) |
