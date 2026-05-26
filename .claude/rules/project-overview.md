# Tổng quan dự án — JobHub

## Mô tả

**JobHub** là website tuyển dụng nhân lực full-stack, đồ án tốt nghiệp dành cho nhóm 1–2 sinh viên, hoàn thành trong 3–4 tháng.

3 nhóm người dùng:
- **Ứng viên (Candidate)** — tìm việc, nộp CV, theo dõi đơn
- **Nhà tuyển dụng (Employer)** — đăng tin, quản lý ứng viên
- **Admin** — quản trị toàn hệ thống

## Mục tiêu kỹ thuật

Đủ chiều sâu để đánh giá cao khi bảo vệ đồ án:
- Full-stack với auth hoàn chỉnh (JWT + refresh token rotation)
- RBAC 3 role rõ ràng
- File upload pipeline (CV PDF, avatar, logo)
- Email transactional tự động
- Deploy production có URL thật để demo

## Design

Lấy cảm hứng từ **Status.app** (`status.app__ref=godly.png`):
- Dark theme, near-black background
- Bold typography, large headings
- Purple–blue gradient accent
- Card-based layout với subtle borders
- Smooth scroll animations
