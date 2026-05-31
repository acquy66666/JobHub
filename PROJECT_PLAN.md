# Project Plan: JobHub
Created: 2026-05-25
Last Updated: 2026-05-31 (session 3)
Current Stage: Stage 5 → Stage 6
Status: Stage 5 Nearly Done (TC4 pending Resend verify) | Stage 6 Nhóm 2 In Progress

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
- [x] TC6: Admin duyệt PENDING job — `/admin/jobs` → tab PENDING → Duyệt → job chuyển ACTIVE ✅ verified 2026-05-29
- [ ] TC7: Mobile responsive 375px — **Hoãn theo yêu cầu**, sẽ thực hiện sau Stage 6

#### Bugs phát hiện khi verify — cần fix trước khi bảo vệ
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

### 🔲 Stage 6: Feature Enhancement — PLANNED
> Dựa trên competitive analysis (TopCV, VietnamWorks, LinkedIn, Indeed, Glassdoor) — session 2026-05-29.
> Ưu tiên complexity thấp → cao. Mỗi nhóm là một sprint nhỏ.

#### Nhóm 1 — Low Complexity (Quick Wins, ~1–3 ngày/feature) ✅ DONE (2026-05-29)

- [x] **Employer Verification Badge** — Admin toggle `isVerified` (nút "Xác nhận"/"Bỏ XN") trên admin/users → badge "✓ Đã xác thực" trên company page. Backend: admin updateUser hỗ trợ `employerVerified` field.
- [x] **Profile Completeness Meter** — Enhanced: progress bar + danh sách trường còn thiếu với chip links (fullName, phone, headline, skills, cvUrl, experience, education).
- [x] **Job Analytics Columns** — `viewCount` + conversion rate (applications/views %) hiển thị trong employer/jobs list với icon đẹp.
- [x] **Job Post Templates** — `JobTemplate` model mới (schema + db push). Backend CRUD `/employer/templates`. Frontend: "Dùng mẫu" dropdown ở step 1 + "Lưu làm mẫu" ở step 3 review.

#### Nhóm 2 — Medium Complexity (~3–7 ngày/feature)

- [ ] **Job Match Score** — Hiển thị % overlap giữa skills của candidate với requirements của job. Backend: string matching (không cần ML), endpoint mới `GET /api/jobs/:id/match-score`. Frontend: badge trên JobCard và job detail page.
- [x] **Candidate Shortlist & Tags** — `ApplicationTag` enum (SHORTLISTED/ON_HOLD/POTENTIAL). `db push` Supabase. Endpoint `PATCH /employer/jobs/:jobId/applications/:appId/tag`. Tag badge màu sắc, dropdown auto-save, optimistic update, filter tab "⭐ Shortlist". Commit `3dc2769`.
- [ ] **Platform Analytics Charts v2** — Thêm time-series charts cho admin: new users/week, jobs posted/week, applications/week. Backend: `$queryRaw` GROUP BY week. Frontend: Recharts LineChart.
- [ ] **Candidate Database Search (Employer)** — Employer tìm kiếm candidate đã đăng ký theo skill, location, headline. New endpoint `GET /api/employers/candidates/search`. Kết quả ẩn email/phone cho đến khi unlock (prep cho credit system sau).
- [ ] **Content Moderation Queue** — Candidate/Employer có thể report job post hoặc profile vi phạm. Admin thấy queue. Cần model `Report` mới (targetType, targetId, reason, status).
- [ ] **Bulk Export Applications** — Employer export danh sách ứng viên của 1 job ra CSV. Backend: Node.js stream CSV, endpoint `GET /api/employer/jobs/:id/applications/export`.

#### Nhóm 3 — High Complexity (~1–2 tuần/feature)

- [ ] **Email Job Alerts** — Candidate opt-in nhận email khi có job mới khớp tiêu chí (industry, location, jobType). Cần model `JobAlert` + cron job (node-cron) chạy mỗi ngày lúc 8h sáng query jobs mới + gửi Nodemailer batch.
- [ ] **Activity / Audit Logs** — Mọi action của admin được ghi vào `AuditLog` table (adminId, action, targetType, targetId, timestamp). Admin có thể xem log trong dashboard.
- [ ] **Fraud / Spam Detection (Rule-based)** — Auto-flag: job post trùng tiêu đề + employer trong 24h, employer tạo > 10 jobs/ngày, user đổi role > 2 lần. Flag → admin review queue.

#### Nhóm 4 — v2+ (Deferred, High Complexity)

- [ ] **Kanban Application Board** — Drag-and-drop ứng viên qua stages. Dùng `dnd-kit`. Đẹp cho demo nhưng không ảnh hưởng chức năng core.
- [ ] **Salary Benchmark Display** — Hiển thị mức lương thị trường bên cạnh job listing. Cần dataset tĩnh VND per industry/role hoặc crowdsourced từ applications.
- [ ] **Interview Experience Reviews** — Candidate viết review quy trình phỏng vấn của công ty (Glassdoor-style). Cần model `CompanyReview` + moderation flow.
- [ ] **Zalo Notification Integration** — Gửi thông báo qua Zalo OA thay vì/thêm vào email. Rất phù hợp thị trường VN. Cần Zalo OA account + Zalo API.
- [ ] **Subscription / Credit System** — Employer mua credits để unlock featured post, candidate database search. Cần payment gateway (VNPay). Defer hoàn toàn.
- [ ] **CV Parsing / Auto-fill** — Parse PDF CV để pre-fill profile. Third-party API (Affinda, Eden AI). Heavy integration, không critical.

---

## Decisions & Notes

- **2026-05-25:** Stack: Next.js 14 + Express.js + Prisma + PostgreSQL (Supabase). Tối ưu cho AI codegen.
- **2026-05-25:** Monorepo đơn giản (`frontend/` + `backend/`), KHÔNG Turborepo.
- **2026-05-25:** accessToken → Zustand memory; refreshToken → httpOnly cookie.
- **2026-05-25:** 4 prototype HTML giữ trong `prototype/` làm design reference.
- **2026-05-25:** Deploy: Vercel + Render + Supabase (free tier).

---

## Blockers
- **TC4 email chưa verify:** Đã migrate sang Resend HTTP API (commit `3dc2769`, đã push lên GitHub). Render đang/sẽ redeploy. Cần user set `RESEND_API_KEY` trong Render dashboard → test `POST /api/health/test-email` → xác nhận nhận được email.

---

## Next Action (session tiếp theo)

**Ưu tiên 1 — Verify TC4 email (Resend):**
- Set `RESEND_API_KEY=re_xxx` trong Render dashboard → Save (auto-redeploy)
- Gọi `POST https://jobhub-700v.onrender.com/api/health/test-email` với body `{"to":"hunguu05@gmail.com"}`
- Nếu `{"ok":true}` → kiểm tra Gmail → TC4 ✅
- Nếu `{"ok":false}` → đọc message lỗi để debug tiếp
- Test luồng thực tế: đăng ký tài khoản mới bằng email thật → nhận OTP → xác thực thành công

**Ưu tiên 2 — Stage 6 Nhóm 2 tiếp theo:**
- Platform Analytics Charts v2 (~2–3h — time-series LineChart cho admin dashboard, `$queryRaw` GROUP BY week, không cần schema mới)
- Job Match Score (~4–5h — string matching skills candidate vs job requirements, endpoint `GET /api/jobs/:id/match-score`, badge trên JobCard + job detail)

**Demo accounts (password: `Demo@2026`):**
- Candidate → `candidate@jobhub.vn`
- Employer  → `employer@jobhub.vn`
- Admin     → `admin@jobhub.vn`
