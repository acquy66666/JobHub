# Tech Stack

## Frontend

| Công nghệ | Mục đích |
|---|---|
| Next.js 14 (App Router) + TypeScript | Framework chính |
| Tailwind CSS + shadcn/ui | Styling, dark theme nhanh |
| Zustand | Global state |
| TanStack Query | Server state, caching, optimistic UI |
| React Hook Form + Zod | Form & validation |
| Framer Motion | Scroll animations |
| Lucide React | Icons |

## Backend

| Công nghệ | Mục đích |
|---|---|
| Node.js + Express.js | REST API |
| Prisma | ORM |
| JWT (access 15m + refresh 7d) + bcrypt | Auth |
| Cloudinary | Upload CV PDF, avatar, logo |
| Nodemailer + Gmail SMTP | Email transactional |
| express-rate-limit | Rate limiting endpoint auth |

## Database

- **PostgreSQL** — Supabase free tier hoặc Railway

## DevOps / Deploy

| Thành phần | Nền tảng |
|---|---|
| Frontend | Vercel (free, 1-click) |
| Backend | Render hoặc Railway (free tier) |
| Database | Supabase hoặc Railway PostgreSQL |
| Repo | GitHub monorepo hoặc 2 repo riêng |

> Lý do chọn stack: tài liệu phong phú, cộng đồng lớn, dễ trình bày với hội đồng, Vercel deploy 1-click.
