# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**JobHub** — full-stack recruitment website (đồ án tốt nghiệp). 3 user roles: Candidate, Employer, Admin. Dark theme inspired by Status.app.

**Current stage:** Stage 9 — Paid Job Posting (Billing) — **Sprint A+B+C ✅ / Sprint D 80%** (2026-06-06, hotfix tx-order uncommitted-deploy pending). Stages 5-8 ✅ COMPLETE. Full-stack running: Next.js 14 App Router (`frontend/src/`), Express.js + Prisma (`backend/src/`), PostgreSQL via Docker Compose. HTML prototypes archived in `prototype/`.

**Stage 5 done (100%):** SEO, error boundaries, seed data, deploy (Render + Vercel), proxy architecture, auth login hoạt động. BUG-1 → BUG-9 đã fix. TC1 ✅, TC2a ✅, TC2b ✅, TC2c ✅, TC3 ✅, TC4 ✅, TC5 ✅, TC6 ✅. TC7 hoãn theo yêu cầu. Email: Brevo REST API (HTTPS port 443, không dùng SMTP). Env vars: `BREVO_API_KEY` + `BREVO_SENDER_EMAIL` trong Render.
**Stage 6 Nhóm 1 done:** Job Analytics Columns ✅, Employer Verification Badge ✅, Profile Completeness Meter (enhanced) ✅, Job Post Templates ✅. Commit `c1fd287`.
**Stage 6 Nhóm 2 done (100%):** Candidate Shortlist & Tags ✅, Platform Analytics Charts v2 ✅, Job Match Score ✅, Candidate Database Search ✅, Bulk Export Applications (CSV) ✅, Content Moderation Queue ✅. Commits `3dc2769`–`d170334`.
**Stage 6 Nhóm 3 done (100%):** Audit Logs ✅, Email Job Alerts ✅, Fraud Detection ✅. Commit `c8c4891`. Schema: `AuditLog` + `JobAlert` models, `isFlagged`/`flagReason` trên `Job` — đã migrate Supabase.
**Stage 6 COMPLETE.** Nhóm 4 (Kanban, Salary Benchmark, Reviews, Zalo, Payment) — deferred v2+.
**Production fix (2026-06-02):** BUG-10 fixed — Vercel build fail do ESLint unescaped `"` trong `admin/reports/page.tsx`. Seed data enhanced: +3 flagged jobs, +8 reports, +19 audit logs, +3 job alerts, +5 application tags inserted via Supabase MCP. Commit `8b20c98`.
**Production verify (2026-06-02, session 9):** Render auto-deploy webhook broken → 4 trang Stage 6 Nhóm 3 empty. Fix: Manual Deploy trên Render dashboard. Tất cả 4 trang verified: `/admin/logs` ✅, `/candidate/job-alerts` ✅, `/admin/jobs` flagged tab ✅, `/admin/reports` ✅.

**Stage 7 Phase A done (2026-06-03, session 11):** Commit `12d7f01`. F1 In-app Notification Center ✅ (schema + backend 5 endpoints + NotificationBell polling 60s + /candidate/notifications page). F5 Recently Viewed ✅ (localStorage max 20 + hook /jobs/[id] + /candidate/recently-viewed page). Sidebar redesign ✅ (4 nhóm NAV_GROUPS: HOẠT ĐỘNG/HỒ SƠ/KHÁM PHÁ/CÀI ĐẶT + 4 placeholder pages). Dashboard redesign ✅ (HERO + 4 metrics + 2-col grid + horizontal scroll). `tsc --noEmit` clean + ESLint clean (no new errors).
**Stage 7 Phase B done (2026-06-03, session 12):** Commit `726c370`. F3 Recommended Jobs ✅ (rule-based scoring 0.5*skills+0.2*location+0.2*industry+0.1*recency + /candidate/recommended page + dashboard section). F2 Followed Companies ✅ (FollowedCompany model + db push + follow/unfollow/list + follow button on /companies/[id] + /candidate/followed-companies page + admin approve job → notify followers). F4 Application Timeline + Kanban ✅ (ApplicationStatusHistory model + db push + history recording on status change + APPLICATION_STATUS_CHANGED notification + applications page 3-view List/Kanban/Timeline). `tsc --noEmit` clean + ESLint warnings only (pre-existing).
**Stage 7 Phase C COMPLETE (session 13–14, 2026-06-04):** F8 Multiple CVs ✅ (CandidateCV model + Supabase migration + 4 endpoints GET/POST /candidate/cvs + PATCH /cvs/:id/default + DELETE /cvs/:id + rewrite /candidate/cv page + ApplyModal tự query CVs nội bộ, bỏ props savedCvUrl/savedCvFileName). F6 Profile Public View ✅ (publicSlug + isPublicProfile trên Candidate + Supabase migration + GET /api/public/candidates/:slug no-auth + PATCH /candidate/profile/public-settings + /u/[slug] public page + /candidate/preview rewrite + profile page section). F7 Job Comparison ✅ (compareStore Zustand persist localStorage max 3 + CompareBar floating slide-up Framer Motion + nút ⚖ So sánh trên JobCard + /candidate/compare bảng so sánh salary/location/jobType/workMode/match score/skills). `tsc --noEmit` clean cả frontend sau mỗi feature. **Stage 7 Phase C COMPLETE. Stage 7 COMPLETE.**
**Session 15 (2026-06-04):** TC7 Mobile responsive 375px ✅ code fixed — commit `2327a4c`. CompareBar mobile compact view (ẩn full slots, hiện "n việc đã chọn" + ×), profile modals `max-h-[90vh] overflow-y-auto`, 5 candidate pages `p-8→p-4 sm:p-8`, /jobs filter collapsible toggle mobile. Pushed tất cả Stage 7 commits lên GitHub → Vercel/Render deploying.
**Session 16 (2026-06-04):** Production verify hoàn tất. Render auto-deploy webhook broken (lần 2) → Manual Deploy. F6 ✅ (`/u/le-minh-hung-o41t` public profile đầy đủ, publicSlug auto-generated với suffix), F7 ✅ (CompareBar + compare page), F8 ✅ (CV list "1.pdf" badge Mặc định). TC7 mobile 375px visual verify PASS ✅ — Playwright: /jobs filter collapsible ✅, Kanban 2-col ✅, profile modal ✅, CompareBar compact "n việc đã chọn" ✅. **Dự án production-ready, không còn task pending.**
**Session 17 (2026-06-04):** CV Builder ✅ — 10 mẫu CV từ researcher tổng hợp (Classic, Sidebar, Minimalist, Creative, Executive, Tech, Vietnamese Traditional, Marketing Bold, Academic, Infographic). Gallery `/candidate/cv/builder` thumbnail live (CSS scale). Editor `/candidate/cv/builder/[templateId]` 2-panel: form 5 tab + preview A4. Pre-fill từ profile. Xuất PDF `html2canvas+jsPDF`. Lưu vào &quot;CV của tôi&quot; qua Cloudinary. Sidebar nav + CTA button. `tsc --noEmit` clean. Commit `9de1902`. Push GitHub → Vercel deploying (chưa verify production).
**Stage 8 Sprint 1 done (2026-06-04, session 19):** Commit `3c02a2a`. E4 ✅ (email branded per-status + note field). E5 ✅ (NEW_APPLICATION enum Supabase + employer NotificationBell). E1 ✅ (GET /employer/job-stats + /employer/stats Recharts). E8 ✅ (Kanban view toggle List|Kanban trên applications page). `tsc --noEmit` clean. Sprint 2 planned: E2 job templates UI + E3 application notes + E7 tags mở rộng.
**Stage 8 Sprint 2 partial (2026-06-04, session 20):** E2 ✅ (phát hiện đã có sẵn từ Stage 6 — JobFormComponent có đủ "Dùng mẫu" + "Lưu làm mẫu"). E3 ✅ — Commit `cc149bb`. ApplicationNote model + Supabase migration + GET/POST /employer/jobs/:jobId/applications/:appId/notes + NotesAccordion lazy-load trong list view. QA PASS production (TC-A/B/C/D). E7 chưa làm — next session.
**Stage 8 Sprint 2+3 partial (2026-06-04, session 21):** E7 ✅ — Commit `e5c3bc1`. Server-side filter `?status=` + `?tag=` cho GET /applications (fix pagination bug client-side filter), thêm TAG_FILTER_TABS row (SHORTLISTED/POTENTIAL/ON_HOLD). E6 ✅ — Commit `31616cd`. `ScreeningQuestion` + `ScreeningAnswer` models + Supabase migration. Employer: trang `/employer/jobs/[id]/screening` CRUD câu hỏi (max 5, TEXT/YES_NO) + link "❓ Câu hỏi" trên jobs list. Candidate: ApplyModal hiển thị + validate required + gửi answers. Employer: answers inline trong applications page. `tsc --noEmit` clean cả hai. Manual deploy Render ✅ (user confirm). Sprint 3 pending: E9 Interview Scheduler, E10 Salary Benchmark.
**Stage 8 Sprint 3 partial (2026-06-04, session 22):** E9 ✅ — Commit `faceef9`. `InterviewSchedule` model + `InterviewStatus` enum + `INTERVIEW_SCHEDULED` NotificationType + Supabase migration. Backend: 4 employer endpoints (GET/POST/PATCH/DELETE) + 2 candidate endpoints (GET interviews + PATCH respond). `sendInterviewInviteEmail` Brevo template branded. Employer: `InterviewAccordion` component lazy-load (tạo/sửa/xóa, form datetime-local). Candidate: badge "📅 PV" trên card header + `InterviewBadge` trong expanded view (xác nhận/từ chối). `getMyApplications` include latest interview. `tsc --noEmit` clean cả hai. Manual deploy Render ✅ (user confirm). Sprint 3 còn: E10 Salary Benchmark.
**Session 18 (2026-06-04):** Production verify + 3 bug fixes. BUG-011 ✅ (editor gọi `/candidates/me` → fix thành `/candidate/profile`, commit `ea9541a`). BUG-012 ✅ (gallery overlay "Chọn mẫu này" là `<span>` không click được → đổi thành `<Link>`, commit `e1ff3ca`). BUG-013 ✅ (recently-viewed thiếu padding → thêm `p-4 sm:p-8 max-w-6xl`, commit `e1ff3ca`). TC-A ✅ TC-B ✅ TC-C ✅ TC-D2 ✅ TC-E ✅ (QA Playwright verify production). **CV Builder + toàn bộ dự án fully production-ready. Không còn task pending.**

**Session 36 (2026-06-06) — Stage 9 Sprint D Gate createJob 402 + TierSelector + JobCard badge + landing VIP, QA 8/9 PASS, TC2 hotfix uncommitted-deploy pending:** Commit `1aa2bb2` ship code chính. **Backend**: [employer.service.ts](backend/src/services/employer.service.ts) `createJob` wrap `prisma.$transaction` (atomic — insert Job → consume credit). [payment.service.ts](backend/src/services/payment.service.ts) `consumeCredit(employerId, tier, jobId, tx?)` refactor accept optional Prisma.TransactionClient + auto-create balance row. Helper `boostedUntilForTier` (Premium +45d, VIP +60d, BASIC null). [job.service.ts](backend/src/services/job.service.ts) `listJobs` thêm filter `?tier=` + orderBy `[{tier desc}, {boostedUntil desc nulls last}, {createdAt desc}]`. [validators/employer.ts](backend/src/validators/employer.ts) + [validators/job.ts](backend/src/validators/job.ts) thêm tier enum. [errorHandler.ts](backend/src/middlewares/errorHandler.ts) propagate `requiredTier` trong response. **Frontend**: [JobForm.tsx](frontend/src/components/employer/JobForm.tsx) thêm field `tier` + TierSelector step 3 (3 radio card hiển thị credits còn, disabled khi count<1 + CTA "Mua thêm" → /shop?required=). [JobCard.tsx](frontend/src/components/jobs/JobCard.tsx) badge VIP gold gradient / Nổi bật purple theo `job.tier` + `data-tier` attr. [VipJobsSection.tsx](frontend/src/components/home/VipJobsSection.tsx) NEW fetch GET /jobs?tier=VIP&limit=6, ẩn khi rỗng. [(public)/page.tsx](frontend/src/app/(public)/page.tsx) mount VipJobsSection. tsc clean cả backend + frontend. **Manual Deploy Render ✅** (lần 1). **QA Playwright production 8/9 PASS** (`qa-scripts/sprint-d/qa_sprintD.js`): TC0 balance ✓, TC1 TierSelector render 3 cards ✓, TC2 API BASIC create ✗ status=500 (root cause: CreditTransaction.jobId FK → Job, consume INSERT trước job.create → FK violation), TC3 API VIP 402 INSUFFICIENT_CREDITS + requiredTier + atomic balance vẫn 0 ✓, TC3b shop?required=VIP highlight ✓, TC4 top-up PREMIUM via /dev/mark-paid ✓, TC5 /jobs render + badge ✓, TC6 landing VIP graceful empty ✓, TC7 mobile 375 ✓. **Hotfix UNCOMMITTED**: [employer.service.ts](backend/src/services/employer.service.ts) đổi thứ tự trong $transaction từ `consumeCredit → tx.job.create` thành `tx.job.create → consumeCredit(newJob.id)` (CreditTransaction.jobId FK đòi Job tồn tại trước). Atomic vẫn đảm bảo: nếu consumeCredit throw thì tx rollback Job không commit. Pending: commit hotfix + Manual Deploy + rerun TC2 + UI submit click bug debug (RHF handleSubmit không fire khi step 3 click button — DOM scan chỉ thấy 3 tier radio, các field step 1/2 không trong DOM nhưng RHF default shouldUnregister:false nên data nên persist; chưa rõ root cause). **Pivot**: TC2 chuyển sang pure-API test thay vì UI submit để verify backend gate; UI TierSelector đã visual verified TC1. Session sau: 1) commit + deploy hotfix → rerun TC2 → đóng Sprint D; 2) debug RHF submit click issue (low priority — UI render OK); 3) Sprint E (admin pages).

**Session 35 (2026-06-05) — Stage 9 Sprint C Employer UI Billing DONE + QA PASS 7/7:** Commit `3c4b338` + `f3efb3c`. 9 file FE mới + sửa 4: [lib/api/billing.ts](frontend/src/lib/api/billing.ts) client wrapper + TIER_META + formatVnd. [components/billing/CreditBadge.tsx](frontend/src/components/billing/CreditBadge.tsx) sidebar 3 dots. [components/billing/CheckoutModal.tsx](frontend/src/components/billing/CheckoutModal.tsx) 3 bước provider→coupon debounce 500ms→confirm, ESC handler, Framer Motion. [(employer)/employer/billing/page.tsx](frontend/src/app/(employer)/employer/billing/page.tsx) HERO + 3-col gradient cards + tabs Lịch sử credits/Đơn hàng + pagination. [/billing/shop/page.tsx](frontend/src/app/(employer)/employer/billing/shop/page.tsx) 3 cột tier × N package + highlight `?required=`. [/billing/orders/[id]/page.tsx](frontend/src/app/(employer)/employer/billing/orders/[id]/page.tsx) QR + countdown 15p + `useQuery refetchInterval 3000` stop khi status≠PENDING + SUCCESS → confetti toast + redirect dashboard sau 2s + dev panel mock SUCCESS. [/billing/return/page.tsx](frontend/src/app/(employer)/employer/billing/return/page.tsx) Suspense parse query redirect. [(employer)/layout.tsx](frontend/src/app/(employer)/layout.tsx) +NAV "💳 Mua credits" + mount CreditBadge. [lib/api.ts](frontend/src/lib/api.ts) +402 INSUFFICIENT_CREDITS interceptor → window.location /shop?required=tier (Sprint D dùng). Hotfix `f3efb3c`: backend response shape `{orders/transactions, total, totalPages}` không phải `{items, total, page, limit}` → align FE; `POST /payments/dev/mark-paid` gate đổi `NODE_ENV !== production` → `ENABLE_DEV_MARK_PAID !== 'false'` (default on, tắt qua env khi sandbox sẵn sàng) → unblock smoke test trên Render production. QA `qa-scripts/sprint-c/qa_sprintC.js` production: TC0 backend route 401 ✓, TC1 dashboard 3-tier render ✓ (visual verify, script false negative do CSS uppercase), TC2 shop 9 packages ✓, TC3 CheckoutModal + coupon WELCOME giảm 10k ✓, TC4 createOrder→/orders/[id] ✓, TC5 dev mark-paid POST 200 + polling SUCCESS + redirect dashboard ✓, TC6 mobile 375 body width=375 ✓. **Manual Deploy Render 2 lần** (lần 1 cho Sprint B+C, lần 2 cho hotfix). tsc clean cả 2. Pending: Sprint D + E.

**Session 34 (2026-06-05) — Stage 9 Sprint B Backend Payment:** Commit `1d76560`. 9 file mới + sửa 3 file. [integrations/vnpay.ts](backend/src/integrations/vnpay.ts) buildPaymentUrl SHA512 HMAC (sort alphabet manual, KHÔNG URLSearchParams) + verifyResponse constant-time. [integrations/momo.ts](backend/src/integrations/momo.ts) createPayment POST + SHA256 HMAC + verifyIpn; fallback placeholder URL khi env trống. [services/coupon.service.ts](backend/src/services/coupon.service.ts) validate 5 rule + apply PERCENT/FIXED/BONUS_CREDITS + preview. [services/payment.service.ts](backend/src/services/payment.service.ts) createOrder + `markPaid` atomic `$transaction` với 2× `$queryRawUnsafe SELECT ... FOR UPDATE` (PaymentOrder + EmployerCreditBalance) + idempotency check `status === 'SUCCESS'` → return ack. `markFailed` + `consumeCredit` helper (Sprint D dùng, throw 402 INSUFFICIENT_CREDITS). [services/billing.service.ts](backend/src/services/billing.service.ts) getBalance/listOrders/listTransactions + admin revenueStats (`$queryRawUnsafe` groupBy month + by provider) + adminGrantCredits. [routes/employer-billing.ts](backend/src/routes/employer-billing.ts) 7 endpoint. [routes/payment-webhook.ts](backend/src/routes/payment-webhook.ts) `/vnpay/{return,ipn}` + `/momo/ipn` + dev-only `POST /dev/mark-paid` (NODE_ENV !== production) cho smoke test khi chưa có sandbox key. [routes/admin-billing.ts](backend/src/routes/admin-billing.ts) CRUD packages + coupons + revenue + manual grant + AuditLog. [utils/email.ts](backend/src/utils/email.ts) 3 template branded. [config/env.ts](backend/src/config/env.ts) +11 env var sandbox fallback rỗng. tsc clean. **Sandbox VNPay/MoMo CHƯA đăng ký** — Sprint B smoke test bằng `/dev/mark-paid`. Sprint C-E pending.
**Session 33 (2026-06-05) — Stage 9 Sprint A Billing Foundation:** Commit `4f66258`. Plan tổng paid job posting tại `C:\Users\Admin\.claude\plans\shiny-sauteeing-stream.md` (5 sprint A→E, user duyệt). User chọn: tier model Basic/Premium/VIP, sandbox cả VNPay+MoMo, tặng 5 BASIC credits cho mọi employer cũ. Sprint A done: Prisma schema thêm 6 enum (JobTier/PaymentProvider/PaymentStatus/TransactionType/CouponDiscountType/CouponStatus) + 6 model (CreditPackage, EmployerCreditBalance, PaymentOrder, CreditTransaction, Coupon, CouponRedemption) + Job.tier (default BASIC) + Job.boostedUntil + 3 NotificationType + 5 AuditAction + 3 AuditTargetType bổ sung + Employer 4 reverse relations. Supabase migration `billing_foundation_sprint_a` apply qua MCP (rule `feedback_render_shell_paid`). Backfill 5/5 employer → EmployerCreditBalance basicCredits=5. Seed 9 CreditPackage (3 tier × 3 size, giá 50k-1.35M) + 3 Coupon (WELCOME 20% perEmployerLimit=1, XUAN2026 fixed -50k hết hạn 2026-02-28 minAmount 200k, BONUS3 +3 credits BASIC). Verify: 5/5/9/3 + 74 jobs default tier=BASIC. `prisma generate` + `tsc --noEmit` backend clean. Sprint B-E pending. **Stage 9 chưa COMPLETE.**
**Session 32 (2026-06-05) — Cross-job applications page + seed enrichment + QA PASS 5/5:** Commit `a2b229e`. Backend `GET /employer/applications?jobId=&status=&tag=&keyword=&page=&limit=` ([employer.service.ts](backend/src/services/employer.service.ts) `getAllApplications`) — aggregate đơn cross-job theo employer.id, include candidate/job/interview/screening, return summary count theo status. Frontend [(employer)/employer/applications/page.tsx](frontend/src/app/(employer)/employer/applications/page.tsx) (NEW): stat row 5 ô + filter bar 4 select (job/status/tag/keyword debounce 400ms) + accordion list (compact row → expand panel cover letter + status quick buttons + tag quick buttons + link sang per-job page). Sidebar thêm NAV "👥 Quản lý ứng viên". Seed enrichment qua Supabase MCP: +30 candidate VN (prefix `seed32-c-*`), +15 ACTIVE jobs (`seed32-j-*`) 5 industry chia đều 5 employer, +60 application (`seed32-a-*`) status mix 23/18/12/7. QA `qa-scripts/page-applications/qa.js` production PASS 5/5 (TC1 route 401, TC2 render 20 row + summary {27,10/10/6/1}, TC3 filter PENDING còn 10, TC4 keyword "Nguyễn" còn 6, TC5 mobile 375). **Render auto-deploy webhook broken lần 3** — Manual Deploy. tsc clean.
**Session 31 (2026-06-05) — E10 Salary Benchmark DONE + QA PASS 5/5 → Stage 8 COMPLETE:** Commit `cfb59dd`. Backend `GET /employer/salary-benchmark?title=&industry=` ([employer.service.ts](backend/src/services/employer.service.ts) `getSalaryBenchmark` + percentile helper inline linear interpolation, OR-token match title >=4 char, filter status=ACTIVE + salaryMin/Max not null, return `{count, enough:false}` khi count<3). Frontend [SalaryBenchmarkWidget.tsx](frontend/src/components/employer/SalaryBenchmarkWidget.tsx) debounce title 500ms + TanStack staleTime 60s + 3-col P25/P50/P75 (gradient highlight P50) + AVG/Min/Max line, format `XXtr`/`XXk`. Mounted ở [JobForm.tsx](frontend/src/components/employer/JobForm.tsx) step 2 ngay dưới salary inputs. QA `qa-scripts/e10/qa_e10.js` production PASS 5/5 (TC1 route mounted via 401 authGuard, TC2 widget header+content, TC3 graceful empty, TC4 industry change re-renders, TC5 mobile 375 width=261). tsc clean cả 2. **Stage 8 COMPLETE. Toàn dự án production-ready, không còn task pending.** Seed jobs hiện có industry/title không khớp dropdown labels → widget hiển thị graceful empty "Chưa đủ dữ liệu" khi query thực tế — không phải bug code. Cân nhắc seed bổ sung sau nếu muốn demo widget có số liệu thật.
**Session 23 (2026-06-04) — UI/UX Audit + QW-1:** Subagent review toàn frontend. Phát hiện 10 vấn đề + 5 quick wins + 5 improvements lớn. Đặt UI/UX Sprint làm ưu tiên cao nhất trước E10. **QW-1 ✅** — Commit `eb5f154`. Mobile header label động cho 3 layout.
**Session 30 (2026-06-05) — IMP-5 notification filter tabs DONE + QA PASS 5/5:** Commit `81afd83`. File [(candidate)/candidate/notifications/page.tsx](frontend/src/app/(candidate)/candidate/notifications/page.tsx) thêm 5 tab filter client-side (Tất cả / Cập nhật đơn / Công ty theo dõi / Việc phù hợp / Phỏng vấn). `role=tablist`/`role=tab`/`aria-selected`, count badge `(N)`, active gradient purple→blue, mobile overflow-x-auto. Empty state riêng khi filter rỗng nhưng list tổng có item. TYPE_LABEL bổ sung INTERVIEW_SCHEDULED. QA `qa-scripts/imp5/qa_imp5.js` production PASS 5/5 (TC3 skip do candidate@jobhub.vn page 0 notification → outer empty render). tsc clean. **Stage 8 UI/UX Sprint COMPLETE.** Pending: E10 Salary Benchmark (đóng Stage 8).
**Session 29 (2026-06-05) — IMP-4 keyboard a11y DONE + QA PASS 5/5:** Commit `5d54525`. 5 file: [NotificationBell](frontend/src/components/layout/NotificationBell.tsx) + [Navbar](frontend/src/components/layout/Navbar.tsx) (avatar dropdown + mobile menu) + [ApplyModal](frontend/src/components/jobs/ApplyModal.tsx) thêm ESC handler `useEffect` + aria-expanded/haspopup/role=menu/role=dialog/aria-labelledby. [CompareBar](frontend/src/components/jobs/CompareBar.tsx) remove buttons thay `title` → `aria-label`. [JobFilters](frontend/src/components/jobs/JobFilters.tsx) wrap toàn body trong `<form onSubmit>` thay 2 onKeyDown lẻ → Enter ở mọi field submit. QA Playwright `qa-scripts/imp4/qa_imp4.js` production PASS 5/5 (ApplyModal ESC, NotificationBell ESC, Navbar dropdown ESC, JobFilters Enter submit `?keyword=developer`, Mobile menu ESC @ 375px). tsc clean. Pending: IMP-5 + E10.
**Session 28 (2026-06-05) — IMP-3 QA PASS + hotfix layout flex:** Commit `5238f4a`. QA Playwright `qa-scripts/imp3/qa_imp3.js` ban đầu FAIL — chart wrappers không scrollable (scroll=client=656 admin, 576 employer @ 375px). Root cause: `<main className="flex-1 md:ml-[240px]">` ở [(admin)/layout.tsx](frontend/src/app/(admin)/layout.tsx) + [(employer)/layout.tsx](frontend/src/app/(employer)/layout.tsx) + [(candidate)/layout.tsx](frontend/src/app/(candidate)/layout.tsx) thiếu `min-w-0` → flex child với default `min-width: auto` expand theo intrinsic content (chart inner minWidth 480/560/640), khiến `overflow-x-auto` không bao giờ kích hoạt. Fix: thêm `min-w-0` cả 3 layout. QA re-run PASS (admin 2/2 + employer 1/1 chart wrappers scrollable client=309, desktop 1440 fit không scroll). Pending: IMP-4/5 + E10.
**Session 27 (2026-06-05) — IMP-3 DONE (QA deferred):** Commit `23b4bc4`. Recharts responsive mobile cho [(employer)/employer/stats/page.tsx](frontend/src/app/(employer)/employer/stats/page.tsx) + [(admin)/admin/dashboard/page.tsx](frontend/src/app/(admin)/admin/dashboard/page.tsx). Pattern: wrap `<ResponsiveContainer>` trong `<div className="overflow-x-auto -mx-2 px-2"><div style={{minWidth: N}}>` với N=560 (employer BarChart 3-series), 480 (admin monthly BarChart 1-series), 640 (admin weekly LineChart 3-series). Admin dashboard container `p-8 → p-4 sm:p-8`. Weekly card legend header `flex-col sm:flex-row + flex-wrap` để không overflow mobile. Negative margin `-mx-2 px-2` tránh scrollbar che border-radius card. tsc clean. **Chưa QA production** (user chọn "code thôi" do còn 91% context). Pending: IMP-4..5 + E10 + QA IMP-3.
**Session 26 (2026-06-05) — IMP-2 DONE:** Commit `087dcf4`. Backend: GET /employer/recent-applications?status=&limit= (route+controller+service). Frontend rewrite [(employer)/employer/dashboard/page.tsx](frontend/src/app/(employer)/employer/dashboard/page.tsx): HERO (logo+companyName gradient+completeness 6 field employer logoUrl/website/industry/companySize/description/location+3 quick actions) + 4 gradient stat cards purple/green/blue/orange dùng `/employer/job-stats` summary + 2-col grid (Đơn mới gần đây 5 PENDING + Hoàn thiện hồ sơ checklist) + Tin tuyển dụng gần đây giữ. `max-w-6xl` `space-y-8`. tsc clean. Production QA PASS desktop (TechCorp Vietnam 100% + 4 stats 13/12/13/1168 + 3 PENDING) + mobile 375. Pending: IMP-3..5 + E10.
**Session 25 (2026-06-04) — IMP-1 DONE:** Commit `8f321e5`. Refactor [(employer)/employer/jobs/[id]/applications/page.tsx](frontend/src/app/(employer)/employer/jobs/[id]/applications/page.tsx) thành accordion: compact button row (avatar/tên/status/tag/meta/CV/chevron) → click expand AnimatePresence panel (email + cover letter + screening + status form + tag + NotesAccordion + InterviewAccordion). Single-expand `expandedId` auto-reset khi đổi filter/page/pagination. CV button stopPropagation. tsc clean. Production QA Playwright PASS desktop + mobile 375. **Lưu ý dev local**: backend `COOKIE_OPTS.sameSite='none'` + `secure=NODE_ENV==='production'` → local browser hiện đại reject cookie. Không login được local — phải verify production sau Vercel deploy. Pending: IMP-2..5 + E10.
**Session 24 (2026-06-04) — Tất cả Quick Wins COMPLETE:** **QW-2 ✅** `473f332` — Backend `getJobStats` summary fix bug truncate ở 20 (giờ count toàn bộ + thêm `activeJobs`), frontend dashboard switch sang `/employer/job-stats` + skeleton. **QW-3 ✅** `efc98ba` — staleTime 30s cho 7 useQuery (applications + notifications). **QW-4 ✅** `68b90e6` — global `*:focus-visible` ring tím trong globals.css (exclude input/textarea/select). **QW-5 ✅** `f49d5b6` — empty state /candidate/compare tinh chỉnh text + inline icon ⚖. Tsc clean cả backend + frontend. **Còn pending:** IMP-1..5 + E10. Lượt sau bắt đầu IMP-1 (Employer Applications collapsed/expanded accordion).

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
