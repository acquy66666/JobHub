# Session Log — JobHub

Long-form per-session log focused on rationale (why), not just diff (what). Newest entries on top.

---

## Session 27 — 2026-06-05

**Commits:** `23b4bc4` IMP-3 Recharts responsive mobile wrapper

**Done:**
- IMP-3 ✅ — Wrap 3 chart blocks (1 employer BarChart + 1 admin monthly BarChart + 1 admin weekly LineChart) trong `overflow-x-auto` wrapper với inner `minWidth` riêng. Admin dashboard container `p-8 → p-4 sm:p-8`. Admin weekly card legend chuyển `flex-col sm:flex-row + flex-wrap` để không tràn header trên mobile.

**Why / Rationale:**
- **Chọn `overflow-x-auto` + `minWidth` thay vì switch HorizontalBarChart < 768px**: HorizontalBarChart cần component thứ hai + `useMediaQuery` runtime → tăng code path, dễ hydration mismatch SSR. Wrapper scroll giữ nguyên logic biểu đồ, user vuốt ngang đọc — đã có precedent cùng repo (table chi tiết `employer/stats` dùng `overflow-x-auto` line 127).
- **`minWidth` khác nhau theo độ phức tạp chart**: 480 cho 6 cột đơn series (admin monthly), 560 cho 10 cột × 3 series (employer), 640 cho 8 cột × 3 series có dot Line (admin weekly). Không dùng 1 hằng số chung vì sẽ thừa hoặc thiếu.
- **Negative margin `-mx-2 px-2`**: scrollbar nếu sát border-radius card sẽ cắt góc tròn. Đẩy ra 2px rồi padding lại giữ visual gọn.
- **Skeleton loading không bọc wrapper**: skeleton `h-[240px]` đã 100% width đúng, bọc thêm sẽ tạo overflow thừa. Chỉ Real ResponsiveContainer cần `minWidth`.
- **Weekly legend `flex-wrap` thay vì ẩn ở mobile**: legend là key để đọc LineChart 3 series — không thể ẩn. Wrap xuống 2 dòng vẫn dùng được.
- **`p-8 → p-4 sm:p-8` cho admin dashboard**: đồng bộ pattern session 15 (Candidate pages cùng padding scheme). Tiết kiệm 32px viewport mỗi bên ở mobile.

**Verified:** tsc clean. **Chưa QA production** — user chọn "code thôi" thay vì "code + QA" do còn 91% context lúc bắt đầu IMP-3, ưu tiên giữ buffer cho session sau. Vercel auto-deploy đang chạy.

**Bugs phát hiện mới:** Không có.

**Next Action:** **QA IMP-3 production** trước rồi đến **IMP-4** — Keyboard accessibility pass cho `frontend/src/components/jobs/` + `frontend/src/components/employer/` + `frontend/src/components/layout/` (~8-10 component, focus-visible rings, tabindex check, ESC handler cho dropdown/modal). Hoặc nếu user muốn skip QA → vào IMP-4 luôn.

**Blocker:** Không có. Vercel auto-deploy commit `23b4bc4` đang xử lý — verify URL `https://job-hub-two.vercel.app/admin/dashboard` + `/employer/stats` mobile 375px sau khi deploy xong.

---

## Session 26 — 2026-06-05

**Commits:** `087dcf4` IMP-2 employer dashboard redesign — HERO + gradient stats + recent applications

**Done:**
- IMP-2 ✅ — Backend GET /employer/recent-applications?status=&limit= (route+controller+service). Frontend rewrite `(employer)/employer/dashboard/page.tsx`: HERO + 4 gradient stat cards + 2-col grid (Đơn mới gần đây + Hoàn thiện hồ sơ) + Tin tuyển dụng gần đây. Mirror layout của Candidate Dashboard.
- Session housekeeping: gom 23 file `qa_*.js` từ root vào `qa-scripts/{cv-builder,e3-notes,imp1,reverify}/` để workspace gọn. `package.json` + `package-lock.json` giữ root vì `node_modules` ở đó (Node resolve `playwright`).

**Why / Rationale:**
- **Completeness 6 field cho employer (logoUrl/website/industry/companySize/description/location)** thay vì 7 như candidate: companyName luôn set ở register flow → bỏ khỏi checklist tránh field "always 100%" gây nhiễu.
- **4 stat cards mới (totalJobs/activeJobs/totalApplications/totalViews)** dùng summary từ `/employer/job-stats` đã có sẵn từ QW-2 — không phải tạo endpoint mới cho stats. Bỏ "Đăng tin mới +" cũ (đã chuyển thành CTA trong HERO).
- **Endpoint mới `/employer/recent-applications` thay vì reuse `/employer/jobs/:id/applications`**: cũ chỉ trả app theo từng job, dashboard cần ngang qua tất cả jobs của employer. Query param `status` mặc định PENDING vì mục đích "đơn mới cần xử lý". `limit` clamp [1,20] tránh abuse.
- **Mirror layout Candidate Dashboard 1:1** (HERO + 4 stats + 2-col grid + section list): user feedback session 23 ghi nhận chênh lệch chất lượng UX rõ giữa 2 role → đồng bộ pattern là cách rẻ nhất để cân.
- **Quick actions trong HERO**: "Đăng tin mới" btn-primary + "Quản lý tin" + "Sửa hồ sơ công ty" ghost — phản ánh 3 nhu cầu chính của employer khi mở dashboard.
- **Không reset query cache khi đổi route**: TanStack Query handle bình thường, không cần `useEffect` clear.

**Verified:** Production QA Playwright PASS — `qa-scripts/imp2/qa_imp2.js` trên `job-hub-two.vercel.app`. Desktop 1440: HERO "TechCorp Vietnam" + completeness 100% + 4 stat cards (13/12/13/1168) + 3 PENDING apps + 6 checklist field + 5 jobs. Mobile 375: stack đẹp, 2-col stats, không vỡ. Screenshots: `screenshots/qa_imp2_{01_desktop,02_mobile}.png`.

**Bugs phát hiện mới:** Không có.

**Next Action:** IMP-3 — Recharts responsive mobile cho `/employer/stats` + `/admin/dashboard`. Wrapper `overflow-x-auto` với inner `minWidth: 600px`, hoặc switch `<HorizontalBarChart>` khi viewport < 768px. Cần đọc 2 file: [(employer)/employer/stats/page.tsx](frontend/src/app/(employer)/employer/stats/page.tsx) + [(admin)/admin/dashboard/page.tsx](frontend/src/app/(admin)/admin/dashboard/page.tsx).

**Blocker:** Không có. Render auto-deploy lần này hoạt động (user confirm "render và vercel đã deploy thành công" — không cần Manual Deploy).

---

## Session 25 — 2026-06-04

**Commits:** `8f321e5` IMP-1 collapsible accordion for employer applications list

**Done:**
- IMP-1 ✅ — refactor `frontend/src/app/(employer)/employer/jobs/[id]/applications/page.tsx`: list view giờ là accordion (compact button row → expand panel) thay vì stack đầy đủ thông tin/control mỗi card.

**Why / Rationale:**
- **Accordion thay vì modal**: giảm cognitive load khi employer xử lý nhiều ứng viên (mỗi card cũ cao 600-800px → giờ ~64px khi collapsed). Modal phá luồng list, accordion giữ context list xung quanh.
- **Single-expand (`expandedId: string | null`) thay vì multi-expand**: hai ứng viên cùng mở song song không có giá trị thực dụng + dễ bị mất chỗ scroll. Single-expand giống pattern mailbox.
- **Auto-reset expandedId khi đổi filter/page/pagination**: id của expanded có thể không còn nằm trong filtered set → giữ lại sẽ confusing. Reset là cleaner.
- **CV button `stopPropagation`**: CV là action quan trọng nhất, không buộc user expand mới xem được. Cho nó tồn tại ở compact row.
- **Framer Motion `<AnimatePresence>` height auto**: đã có dep, smooth transition cần thiết cho accordion (snap toggle gây jarring trên list dài).
- **Không đụng Kanban view**: scope clear, IMP-1 chỉ list view. Kanban đã đủ compact.
- **NotesAccordion + InterviewAccordion vẫn lazy-load**: nested accordion + outer accordion → 0 query thừa vì `enabled: open` của chúng chỉ kích hoạt khi outer expand + user click vào sub.

**Verified:** Production QA Playwright PASS — `qa_imp1.js` chạy trên `job-hub-two.vercel.app`. Collapsed ✅, expanded panel hiện đủ 7 element ✅, filter reset (sau khi đổi sang "Chờ duyệt", expanded count = 0) ✅, mobile 375 screenshot ✅. Single-expand không test được nhiều card vì seed chỉ có 1 ứng viên trên job tìm thấy.

**Bugs phát hiện mới:** Không có bug app. **Constraint dev local mới phát hiện**: backend `COOKIE_OPTS.sameSite='none'` + `secure=process.env.NODE_ENV==='production'` → browser hiện đại reject cookie ở local dev (sameSite=none yêu cầu secure). Login flow không chạy được qua Playwright local. → Phải verify trực tiếp production sau Vercel deploy.

**Next Action:** IMP-2 — Employer Dashboard redesign cho ngang Candidate Dashboard. HERO block (company name + logo + completeness % cho employer) + 4 stat cards gradient + section "Đơn mới gần đây" (PENDING apps tất cả jobs). File: `frontend/src/app/(employer)/employer/dashboard/page.tsx`. Lý do ưu tiên: Employer Dashboard hiện chỉ là 4 stat cards cơ bản, kém visual weight so với Candidate Dashboard (HERO + 4 metrics + 2-col grid).

**Blocker:** Không có. Render auto-deploy vẫn cần Manual Deploy nếu webhook broken (rule cũ).

---