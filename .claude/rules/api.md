# API Reference & Environment Variables

## Base URL

```
Development: http://localhost:8080/api
Production:  https://jobhub-api.onrender.com/api
```

## Auth Endpoints

```
POST  /api/auth/register        Đăng ký tài khoản mới
POST  /api/auth/login           Đăng nhập, trả về access + refresh token
POST  /api/auth/refresh         Làm mới access token bằng refresh token
POST  /api/auth/logout          Thu hồi refresh token
POST  /api/auth/verify-email    Xác thực email (OTP hoặc token)
POST  /api/auth/forgot-password Yêu cầu reset password
POST  /api/auth/reset-password  Đặt lại mật khẩu mới
```

## Job Endpoints

```
GET    /api/jobs                 Danh sách job (public)
                                 Query: ?page&limit&location&industry&jobType&workMode&keyword&salaryMin&salaryMax
POST   /api/jobs                 Tạo tin mới [Employer]
GET    /api/jobs/:id             Chi tiết job (public, tăng viewCount)
PUT    /api/jobs/:id             Sửa tin [Employer - owner]
DELETE /api/jobs/:id             Xóa tin [Employer owner | Admin]
PATCH  /api/jobs/:id/status      Duyệt / ẩn tin [Admin]
```

## Application Endpoints

```
POST   /api/jobs/:id/apply              Nộp đơn [Candidate]
GET    /api/applications                Danh sách đơn
                                        [Candidate → của mình | Employer → job của mình]
GET    /api/applications/:id            Chi tiết đơn
PATCH  /api/applications/:id/status    Cập nhật trạng thái [Employer]
```

## Candidate Endpoints

```
GET   /api/candidates/me        Hồ sơ ứng viên hiện tại [Candidate]
PUT   /api/candidates/me        Cập nhật hồ sơ [Candidate]
POST  /api/candidates/cv        Upload CV PDF — multipart/form-data [Candidate]
POST  /api/candidates/avatar    Upload avatar [Candidate]
GET   /api/candidates/saved     Danh sách job đã lưu [Candidate]
POST  /api/candidates/saved/:jobId    Lưu job [Candidate]
DELETE /api/candidates/saved/:jobId  Bỏ lưu job [Candidate]
```

## Employer Endpoints

```
GET   /api/employers/me         Hồ sơ công ty [Employer]
PUT   /api/employers/me         Cập nhật hồ sơ công ty [Employer]
POST  /api/employers/logo       Upload logo công ty [Employer]
GET   /api/employers/:id        Trang công ty public
GET   /api/employers            Danh sách công ty (public)
```

## Admin Endpoints

```
GET   /api/admin/stats          Thống kê tổng quan
GET   /api/admin/users          Danh sách users
PATCH /api/admin/users/:id      Cập nhật user (ban/unban, đổi role)
GET   /api/admin/jobs           Danh sách jobs (kể cả PENDING)
PATCH /api/admin/jobs/:id/status  Duyệt / từ chối tin
```

## Environment Variables

### Backend (`.env`)

```env
DATABASE_URL="postgresql://user:pass@host:5432/jobhub"

JWT_ACCESS_SECRET="your-access-secret-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars"
JWT_ACCESS_EXPIRES="15m"
JWT_REFRESH_EXPIRES="7d"

CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

GMAIL_USER="your-email@gmail.com"
GMAIL_APP_PASSWORD="your-16-char-app-password"

CLIENT_URL="http://localhost:3000"
PORT=8080
NODE_ENV="development"
```

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:8080/api"
NEXT_PUBLIC_APP_NAME="JobHub"
```
