# Dev Guidelines & Điểm cộng kỹ thuật

## Nguyên tắc phát triển

- Validate input ở **cả hai đầu**: frontend (Zod schema) và backend (Zod hoặc express-validator)
- Dùng **Prisma transactions** cho thao tác multi-step (vd: tạo `User` + `Candidate` cùng lúc)
- **Rate limiting** cho endpoint auth — `express-rate-limit`: max 10 request/15 phút per IP
- Không bao giờ trả `passwordHash` trong API response (lọc ở tầng service)
- Pagination server-side cho mọi danh sách — không load all data về client
- Đặt **PostgreSQL index** đúng chỗ: `Job(status, expiresAt)`, `Application(jobId, candidateId)`

## File Upload Pipeline

```
Client chọn file → validate type (PDF/image) + size (≤5MB)
→ POST multipart/form-data → multer middleware
→ upload Cloudinary → nhận URL
→ lưu URL vào DB → trả response
```

## Email Trigger

| Sự kiện | Người nhận | Nội dung |
|---|---|---|
| Ứng viên nộp đơn | Employer | Thông báo có đơn mới |
| NTD đổi trạng thái | Candidate | Cập nhật trạng thái đơn |
| Đăng ký tài khoản | User mới | OTP xác thực email |
| Quên mật khẩu | User | Link reset password |

## Điểm cộng kỹ thuật khi bảo vệ đồ án

1. **JWT refresh token rotation** — access token ngắn (15m) + refresh token dài (7d), rotation mỗi lần dùng
2. **RBAC 3 role** — middleware `authGuard` + `roleGuard('EMPLOYER')` rõ ràng, dễ trình bày
3. **Optimistic UI** — TanStack Query mutation với rollback khi thất bại
4. **File upload pipeline** — validate → Cloudinary → DB, có xử lý lỗi từng bước
5. **Email transactional** — trigger tự động, không manual
6. **Server-side pagination + filtering** — không load dư data
7. **Database indexing** — chủ động thêm index, giải thích được lý do
8. **Responsive design** — mobile + desktop, test thực tế
9. **Deploy production** — có URL thật để demo trực tiếp với hội đồng

## Chuẩn bị demo

- Có sẵn 3 account test: `admin@jobhub.vn`, `employer@jobhub.vn`, `candidate@jobhub.vn`
- Seed sẵn 20+ job, 5+ công ty, 10+ đơn ứng tuyển ở các trạng thái khác nhau
- Test toàn bộ luồng trước ngày bảo vệ ít nhất 3 ngày
