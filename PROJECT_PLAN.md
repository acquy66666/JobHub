# Project Plan: JobHub
Created: 2026-05-25
Last Updated: 2026-06-14 (session 55 — Stage 12 P2-D Candidate dashboard rewrite DONE; QA 6/6 pass)

Stage 12 — UI Redesign (Thesis B: terminal precision):
- [x] Phase 1 Research (2026-06-11, session 51) — 4 sub-agent reports in `.claude/redesign/phase1/`. Direction 3 (slate+amber) + Geist + 5-surface scope approved.
- [x] Phase 2 DESIGN_BRIEF.md (2026-06-11, `d90c659`) — source of truth: tokens, typography, component inventory, differentiation, a11y. Light auto-detect via prefers-color-scheme added.
- [x] Phase 3 P1 Design tokens & globals (2026-06-11, `3ef75d3`) — Direction 3 amber tokens applied, Inter→Geist, prefers-reduced-motion guard, ambient radial. Tailwind colors point to CSS vars. Legacy aliases gradual.
- [x] Phase 3 P2-A Foundation (2026-06-11, `e97f060`) — Thesis B pivot after user feedback "đổi màu chưa đủ". Add Geist Mono, grain texture replace radial, row tokens, 9 primitives (Row/MonoNumber/StatHero/CmdK+parser/SidePanel/TabBar/Breadcrumb/HairlineSection/CapsLabel) + @radix-ui/react-dialog. Build pass.
- [x] Phase 3 P2-B Homepage rewrite (2026-06-12, `58135b8`, QA 5/5 functional pass) — 4 new panels HeroPanel/HotJobsPanel/StatsHeroPanel/CTAPanel in `app/(public)/page.tsx` + `components/home/`. Drop 9 legacy sections (Hero/Features/HowItWorks/Vip/Featured/Employer/Stats/Companies/CTA). HotJobs fetch real `/api/jobs?limit=6` với fallback mock. CmdK onSubmit → `router.push('/jobs?q=...')`. Zero purple gradient on homepage.
- [x] Phase 3 P2-C Jobs list rewrite (2026-06-13, `f6e39b6`, QA 5/5 PASS) — `app/(public)/jobs/JobsContent.tsx` rewrite: sticky CmdK + HairlineSection Row list (20/page) + SidePanel slide-right Radix Dialog reuse ApplyModal. URL sync `?q=&page=&job=`. Mono hairline pagination. Drop filter sidebar + card grid + ScrollReveal. Deep-link `/jobs/[id]` route giữ nguyên.
- [x] Phase 3 P2-D Candidate dashboard rewrite (2026-06-14, `e739147`, QA 6/6 PASS) — Drop sidebar 240px (11 emoji items) → TabBar 7 tabs + Breadcrumb mono ở `(candidate)/layout.tsx`. Rewrite 6 core pages (dashboard 4-stat mono + 4 HairlineSection; applications Row accordion với CV/cover letter/interview/timeline inline; saved-jobs Row accordion preserving gap test IDs; notifications Row mono filter tabs; recommended Row + MonoNumber match score). Profile NOT touched (defer P2-F).
- [ ] Phase 3 P2-E Employer applicants — TabBar + applicants table + bulk action bar.
- [ ] Phase 3 P2-F Final QA + REDESIGN_SUMMARY.md — Playwright dark+light @ 1280/375, sweep legacy purple stragglers, a11y verification, drop legacy aliases, refactor profile/page.tsx 556 LOC (deferred from P2-D).

Stage 11 — Match Optimization ✅ COMPLETE:

Stage 11 — Match Optimization ✅ COMPLETE:
- [x] P1 Certificate Bank (2026-06-07, `fa16dbc`+`6e3dca1`+`08f7fcb`, QA 6/6 PASS) — 103 certs seeded, candidate upload+admin moderation, public profile show APPROVED only
- [x] P2 Experience Tier on Jobs (2026-06-07, `b4376c3`, QA 6/6 PASS) — Job.experienceTier 5 levels + auto-fill years preset + recommendation scoring + filter + UI badge/dropdown + candidate totalYears
- [x] P3 Gap Analysis on Saved Jobs (2026-06-09, `4fc2b28`, QA 6/6 PASS) — Job.requiredCertificateSlugs schema + GET /api/candidate/saved-jobs/:jobId/gap + JobForm cert picker + SavedJobsPage inline expand panel (skills/experience/certificates)
- [x] P4 Match Score v2 consolidated (2026-06-10, `5e08e92`, QA 5/5 PASS) — refactor recommendation.service.ts: skills 0.4 + certs 0.2 + exp 0.2 + prefs 0.2, mọi dim normalize [0,1]. Cert score dùng APPROVED certs vs job.requiredCertificateSlugs. Exp graded (null years → 0.7 neutral). Preferences = average sub-signals applicable.

UX/Bug backlog:
- [x] UX-1 Certificate section icon spacing (2026-06-08, `d5b3a16`) — tách emoji ra span gap-2 + tăng mt-1.5 subtitle
- [x] UX-2 /candidate/notifications layout (2026-06-08, `d5b3a16`) — wrap `p-4 sm:p-8 max-w-5xl` standard
- [x] BUG-14 /candidate/notifications load chậm — investigated (2026-06-08): Notification table 5 rows toàn DB, EXPLAIN ANALYZE 0.919ms, index `(userId, isRead, createdAt)` hoạt động. Root cause = Render free tier cold start (15-min spin-down). KHÔNG cần code fix ở scale hiện tại. Revisit khi >10k rows/user.

Stage 1-10 ✅ COMPLETE (đã wrap session 45)
Current Stage: Stage 10 — Skill Bank ✅ COMPLETE (P1-P7 + P9 ✅, P8 skipped — admin polish low value cho demo)
Status: Stage 1-11 ✅ COMPLETE | Stage 12 Phase 2 + P1 + P2-A + P2-B + P2-C + P2-D DONE (Thesis B); P2-E Employer applicants is Next Action

Next Action (session 56): **P2-E Employer applicants rewrite** — audit trước `frontend/src/app/(employer)/employer/*` (dashboard, jobs, jobs/[id]/applications, candidates, profile, billing, stats…), map component dùng card-dark/Sidebar/gradient cũ → drop/keep. Apply Thesis B: rewrite `(employer)/layout.tsx` Breadcrumb + TabBar (employer-specific tabs) tương tự P2-D layout shell. Trọng tâm `jobs/[id]/applications/page.tsx` — applicants table accordion compact row → expand inline (CV viewer + screening answers + status timeline + bulk action bar khi multi-select). Reuse primitives Row/MonoNumber/TabBar/Breadcrumb/HairlineSection. Plan chi tiết trước, đợi user duyệt mới code.

---

## Objective
Xây dựng website tuyển dụng full-stack (JobHub) với 3 nhóm người dùng (Candidate, Employer, Admin), đạt mức production-ready để demo trong đồ án tốt nghiệp, deploy có URL thật.

---

## Stages

### ✅ Stage 0: Design Prototype — COMPLETED
- [x] Tạo `index.html` — landing page dark theme (Status.app inspired)
- [x] Tạo `login.html` — split layout, form validation, password toggle
- [x] Tạo `register.html` — 2-step role picker (Candidate / Employer)
- [x] Tạo `forgot-password.html` — centered card, success state
- [x] Screenshot so sánh với `status.app__ref=godly.png`
- [x] Setup `.claude/` — rules, agents (researcher, review, qa), skills (ui-check, progress)

---

### ✅ Stage 1: Foundation Setup — COMPLETED (2026-05-25)
**Mục tiêu:** Monorepo chạy được, frontend gọi được backend, DB kết nối.

- [x] Init Next.js 14 App Router + TypeScript vào `frontend/`
- [x] Init Express.js + Node.js vào `backend/`
- [x] Setup Prisma schema đầy đủ + `prisma migrate dev` (10 models, Prisma 7.8.0)
- [x] Kết nối PostgreSQL local qua Docker Compose (`jobhub_postgres`)
- [x] Tạo `GET /api/health` endpoint → `{ ok: true }`
- [x] Setup Axios instance (`frontend/lib/api.ts`) với `withCredentials: true`
- [x] Convert prototype HTML → Next.js pages (Tailwind + Framer Motion scroll animations)
- [x] Map CSS variables vào `tailwind.config.ts` (bg-0/1/2/3, t0/1/2, brand-gradient)
- [x] Tạo `.env.example` cho cả frontend và backend

**Definition of done:** ✅ `frontend` gọi `GET /api/health` → nhận `{ ok: true }` (verified via Next.js rewrite proxy)

---

### ✅ Stage 2: Auth Complete — COMPLETED (2026-05-25)
**Mục tiêu:** Đăng ký → verify email → đăng nhập → refresh → đăng xuất end-to-end.

- [x] `POST /auth/register` — Zod validate, bcrypt hash (rounds=12), Prisma tx User + profile
- [x] `POST /auth/login` — accessToken (15m JWT) + refreshToken (7d JWT, httpOnly cookie)
- [x] `POST /auth/refresh` — rotation pattern (delete old, create new)
- [x] `POST /auth/logout` — revoke refreshToken from DB, clear cookie
- [x] `POST /auth/verify-email` — OTP 6 chữ số, hashed sha256, 15 phút
- [x] `POST /auth/forgot-password` — OTP reset (safe enumeration)
- [x] `POST /auth/reset-password` — verify OTP, hash new pw, revoke all refresh tokens
- [x] `POST /auth/resend-verification` — gửi lại OTP
- [x] Frontend: Zod forms đã wired vào real API (login, register, forgot-password)
- [x] Frontend: Axios interceptor auto-refresh khi 401 + retry queue
- [x] Frontend: Zustand auth store (accessToken in memory, setAccessToken for refresh)
- [x] Frontend: middleware.ts route guard (refreshToken cookie as indicator)
- [x] Frontend: verify-email page (6 ô OTP, paste support)
- [x] Frontend: reset-password page
- [x] Rate limiting auth routes (10 req/15min per IP) via express-rate-limit
- [x] Error handler handles ZodError (v4 `.issues`) + custom status errors
- [x] Prisma adapter-pg for Prisma 7 driver

**Verified:** register→403(unverified)→isVerified=true→login JWT→refresh rotation all pass.

---

### ✅ Stage 3: Core Features — COMPLETED (2026-05-25)
**Backend:**
- [x] Cloudinary upload helper + multer middleware (image + PDF, 5MB limit)
- [x] Email: sendApplicationEmail, sendApplicationStatusEmail
- [x] Employer: CRUD Job, toggle ACTIVE/PAUSED, list applications, update application status
- [x] Public Jobs: GET /api/jobs (filters, pagination), GET /api/jobs/:id (viewCount++)
- [x] Candidate: profile, avatar upload, CV upload (PDF→Cloudinary), experience/education CRUD, apply job, saved jobs
- [x] All routes type-check clean (tsc --noEmit)

**Frontend:**
- [x] Navbar: auth-aware (anonymous / CANDIDATE / EMPLOYER dropdown)
- [x] lib/queryKeys.ts, lib/formatters.ts (salary, jobType, workMode, status, timeAgo)
- [x] JobCard, JobFilters, JobCardSkeleton, ApplyModal, Pagination components
- [x] /jobs page (filter sidebar + card grid + pagination + Suspense)
- [x] /jobs/:id page (full detail + apply modal)
- [x] /companies page (employer grid)
- [x] Candidate dashboard: layout, dashboard, profile (skills tags, experience/education modals), CV upload (drag-drop + progress), applications (accordion), saved-jobs
- [x] Employer dashboard: layout, dashboard, profile (logo upload), new job (3-step form), manage jobs (pause/resume/delete), edit job, manage applications (status change → email)
- [x] All pages TypeScript clean

---

### ✅ Stage 4: Enhanced Features — COMPLETED (2026-05-25)
**Backend:**
- [x] Admin endpoints: GET /stats, GET /jobs, PATCH /jobs/:id/status, GET /users, PATCH /users/:id
- [x] Admin service với Prisma aggregation (stats + monthly chart data via $queryRaw)
- [x] GET /employer/companies/:id — company detail public
- [x] GET /api/jobs?employerId filter support

**Frontend:**
- [x] Admin layout + sidebar (Dashboard, Duyệt tin, Quản lý users)
- [x] Admin dashboard: 4 stat cards + Recharts BarChart (jobs per month)
- [x] Admin jobs page: filter tabs, approve/reject PENDING jobs
- [x] Admin users page: search + role filter, ban/unban toggle
- [x] /companies/[id] — company detail page (header, about, active jobs grid)
- [x] /companies page cards → link to /companies/:id
- [x] Optimistic UI: save/unsave job, employer job pause/resume, employer application status
- [x] recharts installed + dark theme chart
- [x] tsc --noEmit clean (both frontend + backend)

---

### 🔄 Stage 5: Polish & Deploy — IN PROGRESS

#### Bước 1 — Code fixes (Claude làm, 7 files) ✅ DONE
- [x] `backend/prisma/schema.prisma` — thêm `url = env("DATABASE_URL")` vào datasource (CRITICAL: thiếu thì Prisma không connect được)
- [x] `backend/src/index.ts` — thêm `'0.0.0.0'` vào `app.listen(...)` (CRITICAL: Render cần bind 0.0.0.0)
- [x] `backend/.gitignore` — thêm `dist/` và `*.log`
- [x] `frontend/next.config.mjs` — migrate deprecated `images.domains` → `images.remotePatterns`
- [x] `frontend/src/app/layout.tsx` — thêm `export const viewport` (mobile meta)
- [x] `.gitignore` (root) — tạo mới, cover cả hai app
- [x] `frontend/.env.example` — thêm `NEXT_PUBLIC_SITE_URL`

#### Bước 2 — Setup services (bạn tự làm, ~20 phút)
- [ ] **Supabase** — tạo project → lấy `DATABASE_URL` (URI mode, Singapore region)
- [ ] **Cloudinary** — đăng ký → lấy Cloud Name, API Key, API Secret
- [ ] **Gmail App Password** — bật 2FA → tạo App Password 16 ký tự
- [ ] **GitHub** — tạo repo, push code (`git init` → `git push`)

#### Bước 3 — Deploy (Claude hỗ trợ config)
- [ ] Deploy backend → **Render** (root dir: `backend`, start: `npx prisma migrate deploy && node dist/index.js`)
- [ ] Deploy frontend → **Vercel** (root dir: `frontend`, set `NEXT_PUBLIC_API_URL` = Render URL)
- [ ] Chạy seed 1 lần qua Render Shell: `npx prisma db seed`
- [ ] Cập nhật `CLIENT_URL` trên Render = Vercel URL → redeploy backend

#### Bước 4 — Verify (test cases)
- [x] TC1: GET `/api/health` → `{ ok: true }` ✅
- [x] TC1: GET `/api/health` → `{ ok: true }` ✅
- [x] TC2a: Login candidate `candidate@jobhub.vn` / `Demo@2026` → `/candidate/dashboard` ✅
- [x] TC2b: Login employer `employer@jobhub.vn` / `Demo@2026` → `/employer/dashboard` ✅ Navbar + sidebar TechCorp Vietnam hiển thị đúng
- [x] TC2c: Login admin `admin@jobhub.vn` / `Demo@2026` → `/admin/dashboard` ✅ Navbar + sidebar Admin Panel hiển thị đúng
- [x] TC3: Luồng apply job end-to-end ✅ Đơn xuất hiện trong /candidate/applications
- [x] TC4: Email notification ✅ verified 2026-06-02 — Brevo REST API, gửi được đến bất kỳ Gmail nào
- [x] TC5: Upload CV PDF ✅ Cloudinary public_id trả về, file mở được
- [x] TC6: Admin duyệt PENDING job — `/admin/jobs` → tab PENDING → Duyệt → job chuyển ACTIVE ✅ verified 2026-05-29
- [x] TC7: Mobile responsive 375px ✅ verified Playwright 375px (session 16) — /jobs filter collapsible ✅, Kanban 2-col ✅, profile modal scroll ✅, CompareBar compact "n việc đã chọn" ✅. Commit `2327a4c`.

#### Bugs phát hiện khi verify — cần fix trước khi bảo vệ
- [x] **BUG-10: Vercel build fail → /admin/logs và /candidate/job-alerts không tồn tại trên production** — Root cause: `admin/reports/page.tsx:144` dùng ký tự `"` chưa escape trong JSX → ESLint `react/no-unescaped-entities` error → Next.js build fail hoàn toàn → các trang mới của Stage 6 Nhóm 3 không được deploy. Fix: đổi `"..."` thành `&quot;...&quot;`. Commit `8b20c98`.
- [x] **BUG-1: Navbar trống sau khi đăng nhập** — Root cause: Zustand memory-only, user=null on page reload. Fix: `AuthProvider` calls `/auth/refresh` on mount to rehydrate; refresh endpoint now returns user profile data. Commit: `d9c5517`.
- [x] **BUG-2: Không có nút đăng xuất** — Logout button đã có trong Navbar dropdown (ẩn do BUG-1). Fixed together with BUG-1.
- [x] **BUG-3: /jobs và /companies thiếu link về trang chủ** — Thêm breadcrumb "← Trang chủ" vào cả hai trang. Commit: `d9c5517`.
- [x] **BUG-4: Dashboard layouts không responsive trên mobile 375px** — Sidebar cứng 240px, main content bị squeeze. Fix: ẩn sidebar trên mobile, thêm hamburger + overlay slide-in. Áp dụng cho cả 3 layouts (candidate/employer/admin). Commit: `9c1994a`.
- [x] **BUG-5: Navbar không hiển thị trên dashboard pages** — Root cause: `(candidate)`, `(employer)`, `(admin)` layouts thiếu `<Navbar />` hoàn toàn (chỉ có `pt-16` placeholder). Nên header trống và không có nút logout. Fix: thêm `<Navbar />` vào return của cả 3 layouts.
- [x] **BUG-6: Reload trang dashboard bị văng ra login** — Root cause: Race condition giữa `AuthProvider` (POST /auth/refresh) và TanStack Query 401 interceptor. Cả hai cùng gọi refresh → token rotation xoá token cũ → refresh lần 2 thất bại → `window.location.href = "/login"`. Fix: `AuthProvider` block rendering bằng `ready` state cho đến khi refresh hoàn tất. Commit: `32e4101`.
- [x] **BUG-7: Không có toast notification sau các action quan trọng** — Toast system đã build (toastStore + Toast.tsx + ToastContainer). Tất cả 6 page đã wire: admin/jobs, admin/users, employer/jobs, employer/applications, ApplyModal, JobCard. Commit: `59c1e30`.
- [x] **BUG-8: Admin duyệt job không cập nhật UI ngay (queryKey mismatch)** — Root cause: `queryKeys.adminJobs()` trả về `['admin','jobs',undefined]` không prefix-match với `['admin','jobs',{params}]`. Fix: (1) tất cả optional-param keys trong queryKeys.ts không append `undefined`; (2) optimistic update cho approveMutation + rejectMutation. Commit: `7bfd7a5`.
- [x] **BUG-9: Register và forgot-password bị treo (tắc nghẽn)** — Root cause: `auth.service.ts` dùng `await sendVerificationEmail(...)` — nếu GMAIL SMTP sai/timeout thì block cả HTTP request 60s+. Fix: (1) đổi tất cả 3 chỗ email trong auth service thành fire-and-forget `.catch(console.error)`; (2) thêm SMTP timeouts (5s) vào Nodemailer; (3) auto-seed on startup trong `index.ts` (không cần Render Shell). Commit: `bffd5fd`.

#### Đã hoàn thành trong Stage 5
- [x] SEO: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`
- [x] Error boundaries: `error.tsx` tất cả route groups + `not-found.tsx`
- [x] Seed data: 9 users, 5 companies, 28 jobs, 20 applications, 6 saved jobs

**Demo accounts (password: `Demo@2026`):**
- Admin    → `admin@jobhub.vn`
- Employer → `employer@jobhub.vn` (TechCorp Vietnam)
- Candidate → `candidate@jobhub.vn` (Lê Minh Hùng)

---

---

### 🔄 Stage 6: Feature Enhancement — IN PROGRESS
> Dựa trên competitive analysis (TopCV, VietnamWorks, LinkedIn, Indeed, Glassdoor) — session 2026-05-29.
> Ưu tiên complexity thấp → cao. Mỗi nhóm là một sprint nhỏ.

#### Nhóm 1 — Low Complexity (Quick Wins, ~1–3 ngày/feature) ✅ DONE (2026-05-29)

- [x] **Employer Verification Badge** — Admin toggle `isVerified` (nút "Xác nhận"/"Bỏ XN") trên admin/users → badge "✓ Đã xác thực" trên company page. Backend: admin updateUser hỗ trợ `employerVerified` field.
- [x] **Profile Completeness Meter** — Enhanced: progress bar + danh sách trường còn thiếu với chip links (fullName, phone, headline, skills, cvUrl, experience, education).
- [x] **Job Analytics Columns** — `viewCount` + conversion rate (applications/views %) hiển thị trong employer/jobs list với icon đẹp.
- [x] **Job Post Templates** — `JobTemplate` model mới (schema + db push). Backend CRUD `/employer/templates`. Frontend: "Dùng mẫu" dropdown ở step 1 + "Lưu làm mẫu" ở step 3 review.

#### Nhóm 2 — Medium Complexity (~3–7 ngày/feature)

- [x] **Job Match Score** — Client-side substring match (no ML, no extra endpoint). `computeMatchScore()` utility trong `lib/matchScore.ts`. Badge màu (green/yellow/red) trên JobCard, breakdown matched/unmatched skill tags trong sidebar job detail. Commit `d6c1ba7`.
- [x] **Candidate Shortlist & Tags** — `ApplicationTag` enum (SHORTLISTED/ON_HOLD/POTENTIAL). `db push` Supabase. Endpoint `PATCH /employer/jobs/:jobId/applications/:appId/tag`. Tag badge màu sắc, dropdown auto-save, optimistic update, filter tab "⭐ Shortlist". Commit `3dc2769`.
- [x] **Platform Analytics Charts v2** — `weeklyData` (users/jobs/applications per week, 8 tuần) trong `/admin/stats`. Frontend: Recharts LineChart 3 series + custom legend + empty state. Commit `0ac262c`.
- [x] **Candidate Database Search (Employer)** — `GET /employer/candidates/search` (Employer auth). Skill filter dùng `$queryRawUnsafe` + `unnest()` (case-insensitive), location dùng Prisma ORM. Response ẩn email/phone/cvUrl. Frontend: search form + 3-col card grid + skeleton + empty states + pagination. Sidebar nav item "Tìm ứng viên". Commit `81c9a24`.
- [x] **Content Moderation Queue** — model `Report` (targetType JOB, reason enum, status PENDING/REVIEWED/DISMISSED). Migration applied Supabase. `POST /api/reports` (any auth user), `GET /admin/reports`, `PATCH /admin/reports/:id`. Frontend: nút "Báo cáo vi phạm" + modal trên /jobs/[id], trang `/admin/reports` với filter tabs + review/dismiss actions + adminNote. Commits `d170334`.
- [x] **Bulk Export Applications** — `GET /employer/jobs/:jobId/applications/export` → CSV UTF-8 (BOM), 9 cột (STT, họ tên, email, tiêu đề, trạng thái, tag, ghi chú, ngày nộp, link CV). Frontend: nút "Xuất CSV" + spinner + Blob download. Commit `adfc3ce`.

#### Nhóm 3 — High Complexity ✅ DONE (2026-06-02)

- [x] **Activity / Audit Logs** — `AuditLog` model (adminId, action enum, targetType, targetId, metadata JSON). `logAdminAction()` helper fire-and-forget. Ghi log tại: approve/reject job, ban/unban user, verify employer, review/dismiss report. `GET /admin/logs` + trang `/admin/logs` bảng phân trang + filter theo action. Commit `c8c4891`.
- [x] **Email Job Alerts** — `JobAlert` model (candidateId, industries[], locations[], jobTypes[], frequency DAILY/WEEKLY). CRUD `/candidate/job-alerts`. `node-cron` 8h sáng ICT (01:00 UTC) query jobs mới 24h → batch gửi Brevo. Trang `/candidate/job-alerts` form tạo alert + toggle + delete. Commit `c8c4891`.
- [x] **Fraud / Spam Detection (Rule-based)** — Rule engine trong `createJob`: flag nếu trùng tiêu đề trong 24h hoặc >10 jobs/ngày cùng employer. `isFlagged Boolean` + `flagReason String?` trên `Job`. Badge ⚠ + tooltip lý do trên admin/jobs. Filter tab "Gắn cờ" với `?flagged=true`. Commit `c8c4891`.

#### Nhóm 4 — v2+ (Deferred, High Complexity)

- [ ] **Kanban Application Board** — Drag-and-drop ứng viên qua stages. Dùng `dnd-kit`. Đẹp cho demo nhưng không ảnh hưởng chức năng core.
- [ ] **Salary Benchmark Display** — Hiển thị mức lương thị trường bên cạnh job listing. Cần dataset tĩnh VND per industry/role hoặc crowdsourced từ applications.
- [ ] **Interview Experience Reviews** — Candidate viết review quy trình phỏng vấn của công ty (Glassdoor-style). Cần model `CompanyReview` + moderation flow.
- [ ] **Zalo Notification Integration** — Gửi thông báo qua Zalo OA thay vì/thêm vào email. Rất phù hợp thị trường VN. Cần Zalo OA account + Zalo API.
- [ ] **Subscription / Credit System** — Employer mua credits để unlock featured post, candidate database search. Cần payment gateway (VNPay). Defer hoàn toàn.
- [ ] **CV Parsing / Auto-fill** — Parse PDF CV để pre-fill profile. Third-party API (Affinda, Eden AI). Heavy integration, không critical.

---

### ✅ Stage 7: Candidate Side Expansion — COMPLETE (2026-06-03 → 2026-06-04)
> Sessions 11–14. Phase A ✅ (commit `12d7f01`), Phase B ✅ (commit `726c370`), Phase C ✅ (commits `e14e631` + session 14).

#### 8 Features

- [x] **F1 — In-app Notification Center** — `Notification` model + enum → Supabase `db push`. Backend 5 endpoints. `NotificationBell.tsx` polling 60s. `/candidate/notifications` page. Commit `12d7f01`. Chưa có trigger thực tế (Phase B sẽ hook vào status change / follow / admin approve).
- [x] **F2 — Followed Companies** — Model `FollowedCompany` + db push. Nút "Theo dõi" trên `/companies/[id]`. Trang `/candidate/followed-companies`. Trigger noti `NEW_JOB_FROM_FOLLOWED_COMPANY` khi admin approve job mới. Commit `726c370`. ✅
- [x] **F3 — Recommended Jobs** — `recommendation.service.ts` rule-based (0.5*skills + 0.2*location + 0.2*industry + 0.1*recency). `GET /candidate/recommended-jobs?limit=10`. Page `/candidate/recommended` + section "Đề xuất cho bạn" trên dashboard. Commit `726c370`. ✅
- [x] **F4 — Application Timeline + Kanban** — Model `ApplicationStatusHistory` + db push. Hook `employer.service.updateApplicationStatus` (history + `APPLICATION_STATUS_CHANGED` notification). `GET /candidate/applications/:appId/timeline`. Applications page 3-view toggle List/Kanban/Timeline. Commit `726c370`. ✅
- [x] **F5 — Recently Viewed Jobs** — `lib/recentlyViewed.ts` localStorage max 20. Hook trong `/jobs/[id]`. Page `/candidate/recently-viewed`. Dashboard horizontal scroll. Commit `12d7f01`. ✅
- [x] **F6 — Profile Public View** — `publicSlug` + `isPublicProfile` trên `Candidate`. Supabase migration. `GET /api/public/candidates/:slug` (no auth). `PATCH /candidate/profile/public-settings`. `/u/[slug]` public page (avatar + headline + skills + exp + edu + CTA). `/candidate/preview` rewrite (toggle + copy link + slug edit + preview card). Section trong `/candidate/profile`. Session 13. ✅
- [x] **F7 — Job Comparison** — `store/compareStore.ts` Zustand persist localStorage max 3. `CompareBar.tsx` floating slide-up (Framer Motion), 3 slots, mount global trong Providers. Nút ⚖ trên `JobCard.tsx` (toggle add/remove, disable khi max 3). `/candidate/compare` bảng so sánh: salary/location/jobType/workMode/industry/experience + match score % + skill tags xanh/mờ + nút Nộp đơn. `tsc --noEmit` clean. Session 14. ✅
- [x] **F8 — Multiple CVs** — Model `CandidateCV` + Supabase migration. 4 endpoints: `GET/POST /candidate/cvs`, `PATCH /candidate/cvs/:id/default`, `DELETE /candidate/cvs/:id`. Backfill lazy (getCvs auto-create từ cvUrl cũ). Rewrite `/candidate/cv` page (list + upload + set default + delete). `ApplyModal` tự query CVs nội bộ, bỏ `savedCvUrl`/`savedCvFileName` props. Session 13. ✅
- [x] **F9 — CV Builder (10 mẫu)** — 10 template components React (Classic/Sidebar/Minimalist/Creative/Executive/Tech/Vietnamese/Marketing/Academic/Infographic). `lib/cvTypes.ts` + `lib/exportPdf.ts` (html2canvas+jsPDF). Gallery `/candidate/cv/builder` (thumbnail live CSS scale). Editor `/candidate/cv/builder/[templateId]` 2-panel (form 5 tab + preview A4). Pre-fill từ candidate profile. Xuất PDF + lưu vào "CV của tôi" qua Cloudinary. Sidebar nav item + CTA button trên trang CV. `tsc --noEmit` clean. Commit `9de1902`. Session 17. Production verified session 18 ✅ (BUG-011/012/013 fixed — commits `ea9541a` + `e1ff3ca`)

#### Redesign Layout

- [x] **Sidebar 4 nhóm** — HOẠT ĐỘNG / HỒ SƠ / KHÁM PHÁ / CÀI ĐẶT. `NAV_GROUPS` trong `(candidate)/layout.tsx`. Commit `12d7f01`. ✅
- [x] **Dashboard mới** — HERO + profile strength bar + 4 metrics + 2-col grid (activity feed / completion checklist) + horizontal scroll recently viewed. Commit `12d7f01`. ✅
- [x] **Navbar Bell** — `NotificationBell.tsx` trước avatar. Badge + dropdown. Commit `12d7f01`. ✅

#### Roadmap 3 Phase

- [x] **Phase A — Nền tảng + Redesign** ✅ DONE — F1 + F5 + Sidebar redesign + Dashboard redesign. Commit `12d7f01`.
- [x] **Phase B — Features cốt lõi** ✅ DONE — F3 (Recommended Jobs) + F2 (Followed Companies + trigger noti) + F4 (Timeline + Kanban view). Commit `726c370`.
- [x] **Phase C — Features bổ sung** ✅ COMPLETE — F8 (Multiple CVs) ✅ + F6 (Profile Public View) ✅ + F7 (Job Comparison) ✅. Sessions 13–14.

#### Quality gates per phase
- `tsc --noEmit` clean cả frontend + backend
- ESLint clean (tránh BUG-10 unescaped entities)
- `prisma migrate dev` apply sạch local + `prisma migrate deploy` thử trước khi production
- Screenshot dashboard mới vào `screenshots/` sau mỗi phase

#### Lưu ý kỹ thuật Stage 7
- **Migration drift risk**: Repo chỉ có 2 migration history (init + add_otp_fields) nhưng schema có nhiều bảng Stage 6 — đã thêm qua `db push`. Trước Phase A cần `prisma migrate status` + có thể baseline `prisma migrate resolve` hoặc tạo 1 migration drift tổng hợp.
- **Polling vs WebSocket**: NotificationBell dùng TanStack Query `refetchInterval: 60000` — KHÔNG dùng WebSocket vì Render free tier không phù hợp.
- **Email Brevo REST API**: Nếu cần email cho noti job match, vẫn dùng Brevo REST (không SMTP).
- **Backward compat CV**: Application.cvUrl giữ nullable không drop ở Stage 7 — drop ở Stage 8+.

---

## Decisions & Notes

- **2026-05-25:** Stack: Next.js 14 + Express.js + Prisma + PostgreSQL (Supabase). Tối ưu cho AI codegen.
- **2026-05-25:** Monorepo đơn giản (`frontend/` + `backend/`), KHÔNG Turborepo.
- **2026-05-25:** accessToken → Zustand memory; refreshToken → httpOnly cookie.
- **2026-05-25:** 4 prototype HTML giữ trong `prototype/` làm design reference.
- **2026-05-25:** Deploy: Vercel + Render + Supabase (free tier).

---

## Blockers
- Không còn blocker. Tất cả TC đã verify ✅. Production fully operational.

---

---

### 🔄 Stage 8: Employer Side Expansion — PLANNED

> Nghiên cứu từ LinkedIn, Indeed, Glassdoor, VietnamWorks, TopCV, ITviec (2026-06-04).
> 10 tính năng employer thực dụng nhất, sắp xếp từ DỄ → KHÓ.

| # | Tính năng | Độ phức tạp | API endpoints mới | Schema change |
|---|---|---|---|---|
| E4 | Auto email khi đổi trạng thái ứng viên | Thấp | 0 (hook vào PATCH /applications/:id/status) | Không | ✅ commit `3c02a2a` |
| E5 | Notification real-time khi có đơn mới | Thấp | 0 (hook vào POST /jobs/:id/apply) | Không | ✅ commit `3c02a2a` |
| E1 | Dashboard thống kê hiệu quả từng tin đăng | Thấp | 1 (GET /employer/job-stats) | Không | ✅ commit `3c02a2a` |
| E8 | Pipeline Kanban ứng viên theo giai đoạn | Trung bình | 0 (view mới dùng data/status đã có) | Không | ✅ commit `3c02a2a` |
| E2 | Tái sử dụng mẫu tin tuyển dụng (Job Templates) | Thấp | 3 (GET/POST/DELETE /employer/job-templates) | Có — `JobTemplate` |
| E3 | Ghi chú nội bộ trên từng ứng viên | Thấp-Trung | 2 (GET/POST /applications/:id/notes) | Có — `ApplicationNote` |
| E7 | Gắn tag/nhãn tùy chỉnh cho ứng viên | Trung bình | 3 (GET/POST/DELETE /applications/:id/tags) | Có — mở rộng `ApplicationTag` |
| E6 | Câu hỏi sàng lọc khi ứng tuyển (Screening Questions) | Trung bình | 4 (CRUD /jobs/:id/screening-questions) | Có — `ScreeningQuestion` + `ScreeningAnswer` |
| E9 | Lập lịch phỏng vấn + email mời | Trung-Cao | 4 (CRUD /applications/:id/interview) | Có — `InterviewSchedule` |
| E10 | Salary Benchmark theo vị trí/ngành | Cao | 1 (GET /jobs/salary-benchmark) | Không (aggregate từ Job.salaryMin/Max) |

#### Chi tiết từng feature

- [x] **E4 — Auto email khi đổi trạng thái** — 4 template HTML branded per status (🔍/🎉/📋/⏳), dark theme, truyền `note` của employer vào email. Commit `3c02a2a`.
- [x] **E5 — Notification khi có đơn mới** — `NEW_APPLICATION` thêm vào NotificationType (schema + Supabase ALTER TYPE). `createNotification` gọi trong `applyJob` cho employer userId. NotificationBell hiện badge trên Navbar. Commit `3c02a2a`.
- [x] **E1 — Thống kê hiệu quả tin đăng** — `GET /employer/job-stats` aggregate viewCount + apps + accepted + conversion rate. `/employer/stats` page: 4 summary cards + Recharts BarChart 3 series + bảng chi tiết màu theo conversion rate. Commit `3c02a2a`.
- [x] **E8 — Pipeline Kanban** — Toggle List | Kanban trên trang applications. 4 cột màu theo status, fetch riêng limit 200. Card compact: avatar, tên, time, tag, CV link, inline status select. Commit `3c02a2a`.
- [x] **E2 — Job Templates** — Đã có từ Stage 6: `JobFormComponent` có đầy đủ "Dùng mẫu" dropdown (step 1) + "Lưu làm mẫu" (step 3 review) + backend CRUD `/employer/templates`. Phát hiện lại session 20.
- [x] **E3 — Ghi chú nội bộ** — Model `ApplicationNote` (applicationId, authorId, content, createdAt). Supabase migration applied. GET/POST `/employer/jobs/:jobId/applications/:appId/notes`. `NotesAccordion` component lazy-load trong list view. QA PASS trên production. Commit `cc149bb`.
- [x] **E7 — Tag ứng viên** — Server-side filter `?status=` + `?tag=` cho GET /applications. Fix pagination bug (client-side filter chỉ trong 1 page). Thêm TAG_FILTER_TABS row (SHORTLISTED/POTENTIAL/ON_HOLD). Commit `e5c3bc1`.
- [x] **E6 — Screening Questions** — `ScreeningQuestion` + `ScreeningAnswer` models + Supabase migration. Employer: `/employer/jobs/[id]/screening` CRUD (max 5, TEXT/YES_NO) + link trên jobs list. Candidate: ApplyModal hiển thị + validate required + gửi answers. Employer: answers inline trong applications page. Commit `31616cd`. Production deployed ✅.
- [x] **E9 — Lập lịch phỏng vấn** — `InterviewSchedule` model + `InterviewStatus` enum + Supabase migration. Employer: `InterviewAccordion` lazy-load (tạo/sửa/xóa lịch, form datetime-local/location/meetingLink). Candidate: badge "📅 PV" header + `InterviewBadge` expanded (xác nhận/từ chối). Email invite Brevo branded. In-app notification `INTERVIEW_SCHEDULED`. `tsc` clean cả hai. Commit `faceef9`. Production deployed ✅.
- [ ] **E10 — Salary Benchmark** — Aggregate MIN/MAX/AVG từ `Job.salaryMin/salaryMax` group by title pattern + industry + location. Hiển thị widget bên cạnh form đăng tin. Cần đủ seed data đa dạng salary để có ý nghĩa.

#### Gợi ý thứ tự implement trong session

**Sprint 1 (nhanh, không cần schema):** E4 → E5 → E1 → E8
**Sprint 2 (schema nhỏ, pattern quen):** E2 → E3 → E7
**Sprint 3 (phức tạp hơn):** E6 → E9 → E10

---

## Next Action (session tiếp theo)

**Session 24 (2026-06-04) — Tất cả Quick Wins ✅ COMPLETE. Lượt sau bắt đầu IMP-1.**

### 🎨 UI/UX Optimization Sprint (PRIORITY #1 — trước E10)

> Subagent review session 23 phát hiện chênh lệch chất lượng UX rõ giữa Candidate (rất tốt) và Employer (trung bình), thiếu accessibility cơ bản, một vài trang thiếu empty/loading state. Fix trước demo bảo vệ.

**Quick Wins (1-2h mỗi cái, làm trước):**
- [x] **QW-1 — Mobile header label động** — Commit `eb5f154`. 3 layout (candidate/employer/admin): exact match + startsWith fallback (candidate sort by length cho sub-route động). Tsc clean.
- [x] **QW-2 — Employer Dashboard skeleton + fix limit bug** — Commit `473f332`. Backend `getJobStats` summary dùng prisma.count + aggregate trên TOÀN BỘ jobs (trước đó truncate ở 20), thêm field `activeJobs`. Frontend dashboard switch sang `/employer/job-stats` + skeleton `animate-pulse` cho 4 stat cards và 4 row recent jobs.
- [x] **QW-3 — staleTime cho query thường refetch** — Commit `efc98ba`. `staleTime: 30_000` cho 7 useQuery: candidateApplications (2 chỗ), notifications (3 chỗ: dashboard/NotificationBell/notifications page), employerJobApplications (list + kanban). Giảm flicker skeleton khi switch tab.
- [x] **QW-4 — focus-visible ring global** — Commit `68b90e6`. Rule global trong [globals.css](frontend/src/app/globals.css): `*:focus-visible { outline: 2px solid rgba(124,58,237,.55); outline-offset: 2px }`. Exclude input/textarea/select (đã có focus border riêng).
- [x] **QW-5 — Empty state `/candidate/compare`** — Commit `f49d5b6`. Empty state đã có sẵn từ Phase C, tinh chỉnh text + inline icon ⚖ visual + inline link "Tìm việc làm" để rõ ràng hơn.

**Improvements lớn hơn (nửa ngày trở lên, sau QW):**
- [x] **IMP-1 — Employer Applications collapsed/expanded mode** ✅ Commit `8f321e5`. Refactor list view: compact button row (avatar + tên + status badge + tag badge + meta + CV + chevron) → click expand AnimatePresence panel (email + cover letter + screening + status/note form + tag + NotesAccordion + InterviewAccordion). Single-expand `expandedId`, auto-reset khi đổi filter/page. CV button `stopPropagation`. tsc clean. Production QA Playwright PASS (collapsed ✅, expanded ✅, filter reset ✅, mobile 375 ✅).
- [x] **IMP-2 — Employer Dashboard redesign ngang Candidate** ✅ Commit `087dcf4`. Backend: GET /employer/recent-applications?status=&limit= endpoint (route+controller+service). Frontend: HERO (logo + companyName gradient + completeness 6-field + 3 quick actions) + 4 stat gradient cards (purple/green/blue/orange dùng /employer/job-stats summary) + 2-col grid (Đơn mới gần đây 5 PENDING + Hoàn thiện hồ sơ checklist 6 field) + Tin tuyển dụng gần đây giữ. `max-w-6xl` + `space-y-8`. tsc clean cả backend + frontend. Production QA Playwright PASS desktop 1440 (TechCorp Vietnam 100% + 4 stats 13/12/13/1168 + 3 PENDING apps) + mobile 375.
- [x] **IMP-3 — Recharts responsive mobile** ✅ Commit `23b4bc4` + fix `5238f4a`. Wrapper `overflow-x-auto -mx-2 px-2` + inner `minWidth`: 560/480/640. Admin dashboard container `p-8 → p-4 sm:p-8`. **Hotfix session 28**: thêm `min-w-0` cho `<main className="flex-1 ...">` ở cả 3 layout (admin/employer/candidate) — không có nó flex child expand theo intrinsic content khiến `overflow-x-auto` không kích hoạt. **QA production PASS** (admin 2/2 + employer 1/1 chart scrollable @ 375px, desktop 1440 fit không scroll).
- [x] **IMP-4 — Keyboard accessibility full pass** — Commit `5d54525`. 5 file: NotificationBell + Navbar (avatar dropdown + mobile menu) + ApplyModal (dialog + aria-labelledby) thêm ESC handler + aria-expanded/haspopup/role=menu. CompareBar buttons thêm aria-label. JobFilters wrap `<form onSubmit>` thay onKeyDown trên 2 input → Enter ở mọi field submit. QA Playwright `qa-scripts/imp4/qa_imp4.js` production PASS 5/5 (ApplyModal ESC, NotificationBell ESC, Navbar dropdown ESC, JobFilters Enter, Mobile menu ESC @ 375px).
- [x] **IMP-5 — `/candidate/notifications` filter theo loại** ✅ (`81afd83`) — 5 tab (Tất cả / Cập nhật đơn / Công ty theo dõi / Việc phù hợp / Phỏng vấn) client-side filter, role=tablist/tab + aria-selected, count badge, mobile scroll. QA production PASS 5/5.

**Khác (bonus):**
- [ ] CV Builder thumbnail hover-only overlay không accessible cho keyboard/touch — thêm tap state mobile hoặc luôn hiện badge "Sử dụng" góc thumbnail. [(candidate)/candidate/cv/builder/page.tsx](frontend/src/app/(candidate)/candidate/cv/builder/page.tsx).

### Sau UI/UX Sprint mới đến E10
- [x] **E10 — Salary Benchmark** ✅ (`cfb59dd`) — Backend `GET /employer/salary-benchmark?title=&industry=` aggregate AVG/MIN/MAX/P25/P50/P75 từ Job.salaryMin+salaryMax mids, OR-token match title (>=4 char), filter status=ACTIVE, return `enough:false` khi count<3. Frontend SalaryBenchmarkWidget debounce title 500ms + TanStack staleTime 60s + 3-col P25/P50/P75 + AVG/Min/Max line, mounted ở JobForm step 2. QA production PASS 5/5.
- [x] **Stage 8 COMPLETE** ✅ — UI/UX Sprint (IMP-1..5) + Sprint 3 (E6/E9/E10) tất cả done.

### Bonus session 32 (2026-06-05)
- [x] **Cross-job applications page** ✅ (`a2b229e`) — `/employer/applications` tổng hợp đơn từ MỌI job của employer. Backend `GET /employer/applications?jobId=&status=&tag=&keyword=&page=&limit=` với summary count (PENDING/REVIEWING/ACCEPTED/REJECTED). Frontend stat row 5 ô + filter bar 4 select + accordion list (quick action đổi status/tag). Sidebar nav thêm "Quản lý ứng viên". QA production PASS 5/5.
- [x] **Seed enrichment** ✅ (Supabase MCP) — +30 candidate VN (IT/Marketing/Sales/Finance/Design/HR), +15 ACTIVE jobs (5 industry) chia đều 5 employer, +60 application mix status (23/18/12/7). ID prefix `seed32-*` để dễ rollback.

### Stage 9: Paid Job Posting (Billing) — IN PROGRESS

Plan tổng: `C:\Users\Admin\.claude\plans\shiny-sauteeing-stream.md` (5 sprint A→E).

**Sprint A — Foundation (✅ session 33, 2026-06-05, `4f66258`):**
- [x] Prisma schema: 6 enum mới (JobTier/PaymentProvider/PaymentStatus/TransactionType/CouponDiscountType/CouponStatus), 6 model mới (CreditPackage, EmployerCreditBalance, PaymentOrder, CreditTransaction, Coupon, CouponRedemption), Job.tier + Job.boostedUntil, 3 NotificationType + 5 AuditAction + 3 AuditTargetType bổ sung
- [x] Supabase migration `billing_foundation_sprint_a` apply qua MCP
- [x] Backfill 5 BASIC credits cho 5 employer hiện có → 5 EmployerCreditBalance row
- [x] Seed 9 CreditPackage (Basic/Premium/VIP × 1/5/10) + 3 Coupon (WELCOME 20% perEmployerLimit=1, XUAN2026 fixed -50k hết hạn 28/2, BONUS3 tặng 3 credits BASIC)
- [x] `prisma generate` + `tsc --noEmit` backend clean

**Sprint B — Backend payment + integration (✅ session 34, 2026-06-05, `1d76560`):**
- [x] `vnpay.ts` + `momo.ts` integration: buildPaymentUrl/createPayment + verify signature (SHA512 / SHA256 HMAC, manual sort không URLSearchParams, constant-time compare)
- [x] `payment.service.ts`: createOrder + markPaid atomic `$transaction` với 2× `SELECT FOR UPDATE` (PaymentOrder + EmployerCreditBalance) + idempotency check status SUCCESS
- [x] `coupon.service.ts`: validate 5 rules + apply PERCENT/FIXED/BONUS_CREDITS + preview cho frontend
- [x] `billing.service.ts`: getBalance, listOrders, listTransactions + admin listAllOrders, revenueStats (groupBy month + by provider), adminGrantCredits
- [x] Routes: `/api/employer/billing/*` (7 endpoint) + `/api/payments/{vnpay,momo}/*` (webhook public, verify signature) + `/api/admin/billing/*` + `/api/admin/coupons/*` (CRUD + audit log)
- [x] Env vars 11 placeholder trong config/env.ts (sandbox chưa đăng ký — fallback rỗng, momo trả URL placeholder)
- [x] Email templates: sendPaymentSuccessEmail / sendPaymentFailedEmail / sendCreditLowEmail (branded gradient)
- [x] Dev-only `POST /api/payments/dev/mark-paid` (NODE_ENV !== production) cho smoke test khi chưa có sandbox key
- [x] `consumeCredit(employerId, tier, jobId)` helper sẵn cho Sprint D (atomic FOR UPDATE + 402 INSUFFICIENT_CREDITS)
- [x] `tsc --noEmit` backend clean

**Sprint C — Employer UI (✅ session 35, 2026-06-05, `3c4b338` + `f3efb3c`):**
- [x] `/employer/billing` dashboard 3-col credits + history transactions/orders tabs
- [x] `/billing/shop` catalog 3 tier × 3 size (9 packages) + `?required=<tier>` highlight
- [x] `/billing/orders/[id]` QR + countdown 15p + polling 3s + dev mock SUCCESS button
- [x] `/billing/return` landing parse query → redirect /orders/[id]
- [x] `CheckoutModal` 3 bước: provider radio (VNPay/MoMo) → coupon debounce 500ms → confirm
- [x] `CreditBadge` sidebar (3 dots Basic/Premium/VIP)
- [x] Sidebar nav item "💳 Mua credits"
- [x] `lib/api.ts` 402 INSUFFICIENT_CREDITS interceptor → auto-redirect /shop?required=<tier> (Sprint D dùng)
- [x] Backend dev `/payments/dev/mark-paid` gate đổi `NODE_ENV !== production` → `ENABLE_DEV_MARK_PAID !== 'false'` (default on, tắt khi sandbox sẵn sàng)
- [x] QA Playwright production 7/7 PASS (TC1 visual verify do CSS uppercase đánh lừa innerText)

**Sprint D — Gate createJob + Job UI (✅ session 36, `1aa2bb2`+`4c8dccf`):**
- [x] `TierSelector` trong `JobForm` step 3 (3 radio card hiển thị credits còn, disabled khi count<1 + CTA Mua thêm)
- [x] Backend `createJob` wrap `prisma.$transaction` atomic — Job insert TRƯỚC consumeCredit (FK Job→CreditTransaction.jobId)
- [x] `JobCard` badge VIP gold gradient / Nổi bật purple + sort BE `[tier desc, boostedUntil desc nulls last, createdAt desc]`
- [x] Trang chủ `VipJobsSection` fetch `/jobs?tier=VIP&limit=6`, ẩn graceful khi rỗng
- [x] QA 9/9 PASS (TC2 hotfix verified session 37)

**Sprint E — Admin Billing (✅ session 37, `908ed9e`+`7db7292`):**
- [x] `/admin/billing` 3 tab: Tổng quan (preset range 7d/30d/12m/5y/custom + BarChart granularity day|week|month|year + PieChart by provider VNPay/MoMo) / Đơn hàng (filter status+provider+EmployerPicker + pagination) / Cấp credit thủ công (form 4 field + audit log)
- [x] `/admin/packages` CRUD table + modal (name/tier/creditAmount/priceVnd/bonusCredits/sortOrder/isActive) + soft delete (PATCH isActive=false)
- [x] `/admin/coupons` CRUD table + modal 13 field + cột "Đã dùng" (N/maxRedemptions)
- [x] `EmployerPicker` dropdown search local (fetch /admin/users?role=EMPLOYER&limit=50, filter client-side companyName+email)
- [x] Sidebar +3 NAV (💳 Doanh thu / 📦 Gói credit / 🎟️ Mã giảm giá)
- [x] Backend `revenueStats` refactor accept `granularity+from+to`, return summary {totalRevenue, successOrders, pendingOrders, avgOrderValue}, series buckets parameterized `date_trunc($1, ...)`
- [x] Backend `/admin/coupons` GET thêm `_count.redemptions`
- [x] Hotfix `7db7292`: `/admin/users` response include `employer.id` (EmployerPicker FE phụ thuộc, không có id → grant flow undefined)
- [x] Email templates (đã có từ Sprint B): sendPaymentSuccessEmail / sendPaymentFailedEmail / sendCreditLowEmail wired trong markPaid + consumeCredit low-warning
- [x] QA Playwright production 9/9 PASS (`qa-scripts/sprint-e/qa_sprintE.js`): TC0 401 + TC1 3-tab + TC2 granularity=day URL param + TC3 orders API + TC4 grant +2 BASIC + TC5 packages 9 rows + TC6 coupon create + TC7 _count.redemptions + TC8 mobile 375 cả 3 page

**Lưu ý kỹ thuật Sprint 3:**
- `InterviewSchedule` + `InterviewStatus` + `INTERVIEW_SCHEDULED` NotificationType đã có trong DB (Supabase migration applied session 22).
- `createNotification` nhận 1 object duy nhất có field `userId` — không phải 2 tham số riêng.
- `getMyApplications` giờ include `interviews` (take 1, latest) để hiện badge mà không cần query riêng.
- `backend/src/generated/prisma/` trong .gitignore — `prisma generate` tự chạy khi Render build. Sau mỗi schema change: chạy `npx prisma generate` locally để tsc pass, nhưng KHÔNG commit generated files.

**Lưu ý production:**
- publicSlug của `candidate@jobhub.vn` là `le-minh-hung-o41t` (auto-generated với suffix)
- Render auto-deploy webhook vẫn unreliable — nếu push code mới, vào Render dashboard → Manual Deploy

**Bảo vệ đồ án**: hoãn lại đến sau khi Stage 7 hoàn tất.

**Đã hoàn thành session 9 (production verify):**
- ✅ `/admin/logs` — 19 bản ghi hiển thị, filter hoạt động
- ✅ `/candidate/job-alerts` — alerts hiển thị đúng
- ✅ `/admin/jobs` tab "⚠ Gắn cờ" — flagged jobs hiển thị
- ✅ `/admin/reports` — 8 báo cáo hiển thị, review/dismiss hoạt động

**Lưu ý kỹ thuật quan trọng:**
- Email dùng Brevo REST API (HTTPS port 443) — KHÔNG dùng SMTP (bị block trên Render)
- Env vars trong Render: `BREVO_API_KEY` + `BREVO_SENDER_EMAIL`
- Cron job `node-cron` không persist khi Render free tier ngủ (spin down sau 15 phút idle) → cron có thể không chạy đúng 8h; chấp nhận được cho đồ án
- Auto-seed chỉ chạy khi DB empty — để thêm data mới vào production dùng Supabase MCP `execute_sql`
- Seed.ts đã có guard `count === 0` cho từng section mới → không tạo duplicate khi re-seed
- **Render auto-deploy webhook** có thể bị broken sau nhiều push liên tiếp — nếu production không cập nhật, vào Render dashboard → "Manual Deploy" → "Deploy latest commit"

**Demo accounts (password: `Demo@2026`):**
- Candidate → `candidate@jobhub.vn`
- Employer  → `employer@jobhub.vn`
- Admin     → `admin@jobhub.vn`

---

### Stage 10: Skill Bank — IN PROGRESS

**Concept:** Ngân hàng kỹ năng chuẩn hoá, candidate chỉ được chọn slug có sẵn (strict), employer cũng dùng cùng bank để chuẩn hoá 2 chiều. Skill thiếu → đề xuất → admin duyệt.

**Roadmap:**

- **P1 — Foundation (✅ session 38, 2026-06-06, `c0ec2f6`)**
  - [x] Prisma `Skill` model + `SkillCategory` enum 10 nhóm (IT/KY_THUAT/KINH_TE/MARKETING/Y_TE/SU_PHAM/THIET_KE/NGON_NGU/KY_NANG_MEM/KHAC)
  - [x] Supabase migration `skill_bank_p1` — bảng Skill + extension `pg_trgm` + index `(category, jobCount)` + GIN trên nameVi + aliases
  - [x] Seed 166 skill từ researcher subagent (IT 41 / KY_THUAT 19 / KINH_TE 17 / MARKETING 17 / Y_TE 12 / SU_PHAM 12 / THIET_KE 12 / NGON_NGU 12 / KY_NANG_MEM 12 / KHAC 12). File `backend/prisma/data/skills-seed.json`
  - [x] Backend `skillService` + `GET /api/skills/search?q=&category=&limit=` + `GET /api/skills/by-category` (public, no auth)
  - [x] Strict server-side validate `PUT /candidate/profile`: slug không có trong bank → 422 `INVALID_SKILLS` + list `invalidSkills`
  - [x] Frontend `lib/api/skills.ts` wrapper + types + 10 category label/order
  - [x] Frontend `components/skills/SkillCombobox.tsx` Headless dropdown group-by-category + fuzzy match (nameVi/nameEn/aliases/slug + normalize VN dấu) + selected chips + jobCount badge
  - [x] Tích hợp vào `frontend/src/app/(candidate)/candidate/profile/page.tsx` thay free-text input
  - [x] QA Playwright production 7/7 PASS (`qa-scripts/skill-p1/qa.js`): TC0 search public + TC1 by-category 10 groups 166 total + TC2 combobox render + TC3 fuzzy "rea" → React selectable + TC4 save+reload 3 slug persist + TC5 fake slug 422 + TC6 mobile 375

- **P2 — Demand & Trending (✅ session 40, 2026-06-06, `035cd53` + `0fbe562`)**
  - [x] `skill.service.recomputeJobCounts`: Unicode-aware word-boundary regex (`(?<!\p{L})...(?!\p{L})/iu`) match `nameVi/nameEn/aliases` trong `Job.title + requirements + description`, scan ACTIVE jobs, batch CASE WHEN raw UPDATE
  - [x] `skill.service.triggerRecompute`: fire-and-forget `setImmediate`, fail-soft (catch + console.error)
  - [x] Hook recompute sau `createJob/updateJob/deleteJob/toggleJobStatus` (employer.service) + `updateJobStatus` (admin.service approve/reject)
  - [x] `GET /api/skills/trending?limit=&category=` public — top skill theo jobCount desc, filter > 0
  - [x] `POST /api/skills/recompute` manual trigger (backfill + QA)
  - [x] Frontend `SkillCombobox` staleTime 60min → 5min (jobCount cập nhật gần real-time)
  - [x] Backfill production: 59/166 skill có jobCount > 0, 69 ACTIVE jobs scanned. Top: Xây dựng 20, Python/React 11, Tiếng Anh 10, JavaScript 8
  - [x] QA Playwright production 6/6 PASS (`qa-scripts/skill-p2/qa.js`): TC1 by-category sum>0 + TC2 trending sorted desc all>0 + TC3 filter category=IT + TC4 combobox badge "N tin" thật + TC5 recompute stats + TC6 mobile 375

- **P3 — Onboarding & Dashboard ⭐ (✅ session 42, 2026-06-06, `b5535c0`)**
  - [x] `/candidate/onboarding` 2-step page: pick 1/10 category → trending chips (`GET /skills/trending?category=X&limit=10`) toggle select → `PUT /candidate/profile { skills }` lưu + redirect dashboard. Bỏ qua được mọi step.
  - [x] Dashboard auto-redirect → onboarding khi `profile.skills` empty + `localStorage.onboarding_skipped !== '1'` (one-shot, không vô hạn loop)
  - [x] Dashboard section mới "🔥 Top kỹ năng đang tuyển" — `/skills/trending?limit=8` → 8 chip Link `/jobs?keyword={nameVi}` (chưa có `?skillSlug` filter — defer P6/P7); empty hide
  - [x] Subtitle "Snapshot theo nhu cầu hiện tại" — label trung lập do `/skills/trending` là top-by-jobCount snapshot, không phải window 30d thật
  - [x] QA Playwright production 5/5 PASS (`qa-scripts/skill-p3/qa.js`): TC1 10 categories + TC2 IT → 10 chips + TC3 skip → dashboard + flag set + TC4 dashboard trending header + 8 chips + TC5 mobile 375 onboard=375 dash=399

- **P4 — Employer & Match ⭐ (✅ session 41, 2026-06-06, `b02c28a`)**
  - [x] Prisma `Job.skillSlugs String[] @default([])` + Supabase migration `job_skill_slugs_p4` (GIN index)
  - [x] Backend: validator + `employer.service.createJob/updateJob` validate slugs via `skillService.validateSlugs` → 422 `INVALID_SKILLS` + `invalidSkills[]` nếu có slug ngoài bank
  - [x] `skill.service.recomputeJobCounts` dual-path: exact-match O(1) khi `job.skillSlugs.length > 0`, regex fallback cho legacy job
  - [x] `recommendation.service` Match Score: `|candidate ∩ job| / |job|` slug intersection thay text substring (legacy fallback giữ)
  - [x] Frontend: `JobForm.tsx` mount SkillCombobox bước 2 + RHF `skillSlugs` array + `proposeBasePath=/employer/skills/propose`; edit page prefill `skillSlugs` từ Job
  - [x] QA Playwright production 6/6 PASS (`qa-scripts/skill-p4/qa.js`): TC1 create job slugs=['react','typescript'] 201 + TC2 edit chips render + TC3 recompute react.jobCount=11/ts=5 + TC4 fake slug → 422 INVALID_SKILLS + TC5 recommended-jobs 200 matchScore field + TC6 mobile 375

- **P5 — Skill Proposal System ⭐ (✅ session 39, 2026-06-06, `9e47d2e`)**
  - [x] Prisma `SkillProposal` model + `SkillProposalStatus` enum (PENDING/APPROVED/REJECTED) + 2 NotificationType `SKILL_PROPOSAL_APPROVED/REJECTED` + Supabase migration `skill_proposal_p5`
  - [x] Backend `skill-proposal.service.ts`: create (validate unique vs Skill + dup PENDING) / listMine / listForAdmin (with proposer join) / approve (atomic tx: create Skill + update proposal + notify) / reject (require adminNote)
  - [x] Routes `/api/skill-proposals` (POST + /mine candidate/employer) + `/admin` (GET + PATCH approve/reject admin)
  - [x] Frontend shared `SkillProposeForm.tsx` (prefill `?q=X` + status badges PENDING/APPROVED/REJECTED + admin note display) + 3 pages: `/candidate/skills/propose`, `/employer/skills/propose`, `/admin/skills/proposals`
  - [x] SkillCombobox empty-state CTA "💡 Đề xuất kỹ năng mới →" link `proposeBasePath?q=`
  - [x] Sidebar nav "💡 Đề xuất kỹ năng" cả 3 role layout
  - [x] QA Playwright production 8/8 PASS (`qa-scripts/skill-p5/qa.js`): TC1 POST 201 + TC2 dup PENDING 409 + TC3 SKILL_EXISTS 409 + TC4 /mine + TC5 page render + prefill + TC6 admin list + TC7 approve → Skill in bank + TC8 mobile 375

- **P6 — Similar Suggestion** ✅ DONE (session 43, commit `8cd7e4a`)
  - [x] `GET /skills/similar?q=X&limit=3` dùng `pg_trgm` `GREATEST(similarity(nameVi,$1), similarity(nameEn,$1)) > 0.3` ORDER BY DESC
  - [x] Combobox empty-state "Có phải bạn muốn 'X'?" 1-3 button + N% similarity badge; click → toggle slug + clear query; CTA "Đề xuất" giữ
  - [x] Debounce query 300ms, useQuery enabled khi `debouncedQuery.length>=2 && totalFiltered===0`
  - [x] QA Playwright production 6/6 PASS (`qa-scripts/skill-p6/qa.js`): TC0 reactt→react sim=0.625 + TC4 javascrip→javascript sim=0.75 + TC1 UI suggestion box render + TC2 click → chip add + query clear + TC3 nonsense → CTA only + TC5 mobile 375 bodyW=375

- **P7 — Legacy Migration** ✅ DONE (session 44, commit `0a3814b`)
  - [x] Prisma `Candidate.legacySkills String[] @default([])` + Supabase migration `candidate_legacy_skills_p7`
  - [x] Backend service + validator accept `legacySkills` array (no slug validation; text tự do)
  - [x] Script `backend/scripts/migrate-candidate-skills.ts` (dry-run default, `--apply` to commit) — exact-match nameVi/nameEn/aliases/slug case-insensitive → pg_trgm GREATEST similarity > 0.5 → push unmatched to legacySkills
  - [x] Frontend amber banner trên `/candidate/profile` khi `legacySkills.length > 0` với chip × để xoá sau khi user re-pick từ bank
  - [x] Applied production: 33 candidates, 66 exact + 2 trigram matches, 95 unmapped (tools không có trong bank — banner prompts re-pick/propose)
  - [x] QA Playwright production 6/6 PASS (`qa-scripts/skill-p7/qa.js`): TC0 PUT accept + TC1 banner render + TC2 click × remove + TC3 GET profile field + TC4 regression /skills/similar + TC5 mobile 375

- **P8 — Polish** ⏭ SKIPPED (session 45): admin merge duplicates + voting là admin-tooling, low value cho demo đồ án. Có thể re-open nếu cần.

- **P9 — Candidate Preferences** ✅ DONE (session 45, commit `062082b`)
  - [x] Prisma `Candidate` thêm 7 field preferences + Supabase migration `candidate_preferences_p9`
  - [x] Backend validator `updateProfileSchema` accept preferences; `updateProfile` spread pass-through (không cần thay đổi service logic)
  - [x] Frontend `/candidate/profile` section "🎯 Sở thích công việc" (toggle openToWork, chip multi-select jobType 5/workMode 3/industry 10, free-text location chips Enter to add, salary min/max inputs)
  - [x] `recommendation.service.ts` bonus +0.15 jobType + +0.15 workMode + +0.10 location match (gated by candidate có pref); hard filter excludes job nếu `salaryMax < preferredSalaryMin` (null salaryMax giữ visible); clamp score ≤ 1.0
  - [x] `/jobs` nút "🎯 Lọc theo sở thích của tôi" cho candidate đã login + có pref; click → URL params `byPrefs=1&jobType=&workMode=&location=&industry=&salaryMin=` + clear state button
  - [x] QA Playwright production 6/6 PASS (`qa-scripts/skill-p9/qa.js`): TC1 PUT 200 + TC2 GET persist + TC3 salaryMin=999M excludes lower jobs + TC4 UI render full (5+3+10 chip groups + save btn) + TC5 /jobs apply prefs → URL params + clear btn + TC6 mobile 375 bodyW=375

---

### Bonus session 38 (2026-06-06) — Seed PaymentOrder cho /admin/billing demo
- [x] 40 PaymentOrder (35 SUCCESS / 3 PENDING / 2 FAILED) prefix `seed-po-*` rải đều 12 tháng (06/2025 → 06/2026), 9 package đều có đơn, VNPAY 19 / MOMO 16, total revenue ~20.19M VND. Insert qua Supabase MCP. Rollback dễ: `DELETE FROM "PaymentOrder" WHERE id LIKE 'seed-po-%'`.
