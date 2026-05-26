# Lộ trình phát triển — 3–4 tháng

## Giai đoạn 1 — Nền tảng (Tuần 1–3)

**Mục tiêu**: Setup xong, auth hoạt động, có thể đăng nhập

- [ ] Khởi tạo monorepo, cài đặt dependencies
- [ ] Thiết kế Prisma schema, migrate database
- [ ] API: Đăng ký, đăng nhập, refresh token, xác thực email
- [ ] Frontend: Layout cơ bản, dark theme với Tailwind + shadcn/ui
- [ ] Trang chủ (hero section tĩnh, prototype từ `index.html`)
- [ ] Form đăng ký / đăng nhập

## Giai đoạn 2 — Core Features (Tuần 4–7)

**Mục tiêu**: Luồng chính của ứng viên và nhà tuyển dụng hoạt động end-to-end

- [ ] API: CRUD Job (tạo, sửa, xóa, danh sách + filter + pagination)
- [ ] API: Hồ sơ ứng viên + upload CV (Cloudinary)
- [ ] API: Hồ sơ công ty + upload logo
- [ ] Frontend: Trang danh sách việc làm (filter + search)
- [ ] Frontend: Trang chi tiết việc làm
- [ ] Frontend: Dashboard ứng viên (hồ sơ, CV, đơn ứng tuyển)
- [ ] Frontend: Dashboard NTD (đăng tin, quản lý tin, xem ứng viên)
- [ ] Luồng nộp đơn ứng tuyển end-to-end

## Giai đoạn 3 — Enhanced Features (Tuần 8–11)

**Mục tiêu**: Admin panel, email notifications, tính năng nâng cao

- [ ] Admin panel: quản lý user, duyệt tin, thống kê (biểu đồ Recharts)
- [ ] Email notification (Nodemailer): đơn mới, thay đổi trạng thái
- [ ] Tính năng lưu tin yêu thích
- [ ] Trang hồ sơ công ty công khai
- [ ] Phân trang (pagination) server-side cho tất cả danh sách
- [ ] Tối ưu UI/UX — so sánh với `status.app__ref=godly.png`

## Giai đoạn 4 — Polish & Deploy (Tuần 12–16)

**Mục tiêu**: Deploy production, hoàn thiện báo cáo đồ án

- [ ] Responsive hoàn chỉnh (mobile-first)
- [ ] SEO cơ bản (Next.js Metadata API, og:image)
- [ ] Deploy frontend lên Vercel
- [ ] Deploy backend lên Render hoặc Railway
- [ ] Setup PostgreSQL production (Supabase)
- [ ] Chuẩn bị 3 account test: 1 Admin, 1 Employer, 1 Candidate
- [ ] Viết báo cáo đồ án
- [ ] Chuẩn bị slide thuyết trình
- [ ] Test toàn bộ luồng, fix bug trước bảo vệ
