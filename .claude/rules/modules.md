# Phân tích module chức năng

## 1. Module Auth (dùng chung)

- Đăng ký / Đăng nhập / Đăng xuất
- Xác thực email (OTP hoặc magic link)
- Quên mật khẩu / Reset password
- Refresh token tự động (rotation)
- OAuth Google (tùy chọn, ưu tiên nếu còn thời gian)

## 2. Module Ứng viên (Candidate)

- Tạo & chỉnh sửa hồ sơ cá nhân (thông tin, kỹ năng, kinh nghiệm, học vấn)
- Upload CV PDF lên Cloudinary
- Tìm kiếm việc làm (filter: ngành nghề, địa điểm, mức lương, hình thức)
- Xem chi tiết tin tuyển dụng
- Nộp đơn ứng tuyển (chọn CV đã upload + cover letter tùy chọn)
- Lưu tin tuyển dụng yêu thích
- Theo dõi trạng thái đơn: `PENDING` → `REVIEWING` → `ACCEPTED` / `REJECTED`
- Nhận thông báo email khi có cập nhật

## 3. Module Nhà tuyển dụng (Employer)

- Tạo & quản lý hồ sơ công ty (tên, logo, mô tả, website, ngành, quy mô)
- Đăng tin tuyển dụng (tiêu đề, mô tả, yêu cầu, phúc lợi, mức lương, deadline)
- Quản lý danh sách tin: `PENDING` / `ACTIVE` / `PAUSED` / `EXPIRED`
- Xem danh sách & hồ sơ ứng viên đã nộp đơn cho từng tin
- Cập nhật trạng thái ứng tuyển (trigger email tự động)
- Tìm kiếm & lọc ứng viên trong pool
- Dashboard thống kê: lượt xem tin, số đơn nhận được

## 4. Module Admin

- Dashboard tổng quan (user/job/application stats + biểu đồ Recharts)
- Quản lý người dùng: view, ban/unban, đổi role
- Quản lý tin tuyển dụng: duyệt (`PENDING`→`ACTIVE`), ẩn, xóa
- Quản lý danh mục: ngành nghề, tỉnh/thành phố, hình thức làm việc
- Xem log hoạt động hệ thống

## 5. Module Trang công khai (Public)

- Trang chủ: hero section, featured jobs, stats, CTA
- Danh sách việc làm với search + filter + pagination
- Chi tiết việc làm
- Trang hồ sơ công ty (public)
- Danh sách công ty
- Trang giới thiệu / Liên hệ
