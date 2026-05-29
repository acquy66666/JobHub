# Project Plan: JobHub
Created: 2026-05-25
Last Updated: 2026-05-29
Current Stage: Stage 5 — Polish & Deploy
Status: Stage 5 In Progress

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
- [ ] TC4: Email notification — employer đổi trạng thái đơn → candidate nhận email tại `hunguu05@gmail.com`
- [x] TC5: Upload CV PDF ✅ Cloudinary public_id trả về, file mở được
- [ ] TC6: Admin duyệt PENDING job — `/admin/jobs` → tab PENDING → Duyệt → job chuyển ACTIVE (chưa verify do BUG-6 gián đoạn, BUG-6 đã fix)
- [ ] TC7: Mobile responsive 375px — Navbar hamburger không overflow (fix đã commit, cần verify sau deploy)

#### Bugs phát hiện khi verify — cần fix trước khi bảo vệ
- [x] **BUG-1: Navbar trống sau khi đăng nhập** — Root cause: Zustand memory-only, user=null on page reload. Fix: `AuthProvider` calls `/auth/refresh` on mount to rehydrate; refresh endpoint now returns user profile data. Commit: `d9c5517`.
- [x] **BUG-2: Không có nút đăng xuất** — Logout button đã có trong Navbar dropdown (ẩn do BUG-1). Fixed together with BUG-1.
- [x] **BUG-3: /jobs và /companies thiếu link về trang chủ** — Thêm breadcrumb "← Trang chủ" vào cả hai trang. Commit: `d9c5517`.
- [x] **BUG-4: Dashboard layouts không responsive trên mobile 375px** — Sidebar cứng 240px, main content bị squeeze. Fix: ẩn sidebar trên mobile, thêm hamburger + overlay slide-in. Áp dụng cho cả 3 layouts (candidate/employer/admin). Commit: `9c1994a`.
- [x] **BUG-5: Navbar không hiển thị trên dashboard pages** — Root cause: `(candidate)`, `(employer)`, `(admin)` layouts thiếu `<Navbar />` hoàn toàn (chỉ có `pt-16` placeholder). Nên header trống và không có nút logout. Fix: thêm `<Navbar />` vào return của cả 3 layouts.
- [x] **BUG-6: Reload trang dashboard bị văng ra login** — Root cause: Race condition giữa `AuthProvider` (POST /auth/refresh) và TanStack Query 401 interceptor. Cả hai cùng gọi refresh → token rotation xoá token cũ → refresh lần 2 thất bại → `window.location.href = "/login"`. Fix: `AuthProvider` block rendering bằng `ready` state cho đến khi refresh hoàn tất. Commit: `32e4101`.
- [ ] **BUG-7: Không có toast notification sau các action quan trọng** — Toast system đã build (toastStore + Toast.tsx + ToastContainer). Admin/jobs đã wire (approve/reject). Còn 5 page chưa wire: admin/users, employer/jobs, employer/applications, candidate apply, candidate save/unsave.

#### Đã hoàn thành trong Stage 5
- [x] SEO: `robots.ts`, `sitemap.ts`, `opengraph-image.tsx`
- [x] Error boundaries: `error.tsx` tất cả route groups + `not-found.tsx`
- [x] Seed data: 9 users, 5 companies, 28 jobs, 20 applications, 6 saved jobs

**Demo accounts (password: `Demo@2026`):**
- Admin    → `admin@jobhub.vn`
- Employer → `employer@jobhub.vn` (TechCorp Vietnam)
- Candidate → `candidate@jobhub.vn` (Lê Minh Hùng)

---

## Decisions & Notes

- **2026-05-25:** Stack: Next.js 14 + Express.js + Prisma + PostgreSQL (Supabase). Tối ưu cho AI codegen.
- **2026-05-25:** Monorepo đơn giản (`frontend/` + `backend/`), KHÔNG Turborepo.
- **2026-05-25:** accessToken → Zustand memory; refreshToken → httpOnly cookie.
- **2026-05-25:** 4 prototype HTML giữ trong `prototype/` làm design reference.
- **2026-05-25:** Deploy: Vercel + Render + Supabase (free tier).

---

## Blockers
- Không có blocker kỹ thuật hiện tại. TC2b–TC7 cần verify thực tế trên deployed site.

---

## Next Action (session tiếp theo)
**Ưu tiên 1 — Push + wire toast cho 5 page còn lại (BUG-7):**
- `(admin)/admin/users/page.tsx` — ban/unban user
- `(employer)/employer/jobs/page.tsx` — pause/resume/delete job
- `(employer)/employer/jobs/[id]/applications/page.tsx` — đổi trạng thái đơn
- `components/jobs/ApplyModal.tsx` — nộp đơn thành công
- `components/jobs/JobCard.tsx` — lưu/bỏ lưu job

**Ưu tiên 2 — Verify các TC còn lại:**
- TC6: Admin duyệt PENDING job `/admin/jobs` (BUG-6 đã fix, cần retest)
- TC7: Mobile 375px — Navbar hamburger + sidebar slide-in (test Chrome DevTools 375px)
- TC4: Email notification (employer đổi trạng thái đơn → `hunguu05@gmail.com` nhận email)

**Demo accounts (password: `Demo@2026`):**
- Candidate → `candidate@jobhub.vn`
- Employer  → `employer@jobhub.vn`
- Admin     → `admin@jobhub.vn`
