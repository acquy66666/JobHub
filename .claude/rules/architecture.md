# Kiến trúc hệ thống & Cấu trúc thư mục

## Sơ đồ kiến trúc

```
┌─────────────────────────────────────────────────────┐
│                   CLIENT (Browser)                  │
│         Next.js 14 App Router + Tailwind CSS        │
│   [Trang công khai] [Ứng viên] [NTD] [Admin]        │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST API
┌──────────────────────▼──────────────────────────────┐
│                  API LAYER                          │
│            Express.js REST API (Node.js)            │
│  /api/auth  /api/jobs  /api/applications  /api/...  │
│                                                     │
│  Middleware: JWT Auth │ Role Guard │ Rate Limit      │
└────┬──────────────────┬──────────────────┬──────────┘
     │                  │                  │
┌────▼────┐      ┌──────▼──────┐   ┌──────▼──────┐
│Postgres │      │ Cloudinary  │   │  Nodemailer │
│(Prisma) │      │(File Store) │   │   (Email)   │
└─────────┘      └─────────────┘   └─────────────┘
```

## Cấu trúc thư mục

```
recruitment-website/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/
│   │   │   ├── (public)/       # Layout không cần auth
│   │   │   │   ├── page.tsx    # Trang chủ
│   │   │   │   ├── jobs/       # Tìm kiếm & chi tiết job
│   │   │   │   └── companies/  # Danh sách công ty
│   │   │   ├── (auth)/         # Login, register
│   │   │   ├── candidate/      # Dashboard ứng viên
│   │   │   ├── employer/       # Dashboard NTD
│   │   │   └── admin/          # Dashboard Admin
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── layout/         # Navbar, Footer, Sidebar
│   │   │   ├── job/            # JobCard, JobList, JobFilter
│   │   │   ├── candidate/      # ProfileForm, CVUpload
│   │   │   └── employer/       # JobForm, ApplicationList
│   │   └── lib/
│   │       ├── api.ts           # Axios instance
│   │       ├── auth.ts          # Auth helpers
│   │       └── validators/      # Zod schemas
│   └── api/                    # Express.js backend
│       ├── src/
│       │   ├── routes/          # auth, jobs, applications, users
│       │   ├── controllers/
│       │   ├── middlewares/     # authGuard, roleGuard, upload
│       │   ├── services/        # Business logic
│       │   └── utils/           # email, cloudinary, jwt
│       └── prisma/
│           └── schema.prisma
└── package.json                # Root workspace
```
