# Thiết kế Database — Prisma Schema

## Quan hệ chính

- `User` 1–1 `Candidate` hoặc `Employer` (theo role)
- `Employer` 1–N `Job`
- `Job` 1–N `Application`
- `Candidate` 1–N `Application`
- `Candidate` N–N `Job` qua `SavedJob`

## Index PostgreSQL cần thiết

```sql
-- Thêm vào schema.prisma
@@index([status, expiresAt])   -- trên Job
@@index([jobId, candidateId])  -- trên Application
@@index([email])               -- trên User (đã có @unique)
```

## Prisma Schema

```prisma
model User {
  id            String       @id @default(cuid())
  email         String       @unique
  passwordHash  String
  role          Role         @default(CANDIDATE)
  isVerified    Boolean      @default(false)
  isActive      Boolean      @default(true)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  candidate     Candidate?
  employer      Employer?
  refreshTokens RefreshToken[]
}

enum Role { CANDIDATE  EMPLOYER  ADMIN }

model Candidate {
  id           String        @id @default(cuid())
  userId       String        @unique
  user         User          @relation(fields: [userId], references: [id])
  fullName     String
  phone        String?
  avatarUrl    String?
  headline     String?
  summary      String?
  location     String?
  skills       String[]
  cvUrl        String?
  cvFileName   String?
  applications Application[]
  savedJobs    SavedJob[]
  experiences  Experience[]
  educations   Education[]
}

model Experience {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  company     String
  position    String
  startDate   DateTime
  endDate     DateTime?
  isCurrent   Boolean   @default(false)
  description String?
}

model Education {
  id          String    @id @default(cuid())
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  school      String
  degree      String
  major       String?
  startYear   Int
  endYear     Int?
}

model Employer {
  id          String  @id @default(cuid())
  userId      String  @unique
  user        User    @relation(fields: [userId], references: [id])
  companyName String
  logoUrl     String?
  website     String?
  industry    String?
  companySize String?
  description String?
  location    String?
  isVerified  Boolean @default(false)
  jobs        Job[]
}

model Job {
  id             String      @id @default(cuid())
  employerId     String
  employer       Employer    @relation(fields: [employerId], references: [id])
  title          String
  description    String
  requirements   String
  benefits       String?
  location       String
  jobType        JobType     @default(FULL_TIME)
  workMode       WorkMode    @default(ON_SITE)
  salaryMin      Int?
  salaryMax      Int?
  salaryCurrency String      @default("VND")
  experience     String?
  industry       String
  status         JobStatus   @default(PENDING)
  expiresAt      DateTime
  viewCount      Int         @default(0)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  applications   Application[]
  savedBy        SavedJob[]
  @@index([status, expiresAt])
}

enum JobType    { FULL_TIME  PART_TIME  CONTRACT  INTERNSHIP  FREELANCE }
enum WorkMode   { ON_SITE  REMOTE  HYBRID }
enum JobStatus  { PENDING  ACTIVE  PAUSED  EXPIRED  REJECTED }

model Application {
  id          String            @id @default(cuid())
  jobId       String
  job         Job               @relation(fields: [jobId], references: [id])
  candidateId String
  candidate   Candidate         @relation(fields: [candidateId], references: [id])
  cvUrl       String
  coverLetter String?
  status      ApplicationStatus @default(PENDING)
  note        String?
  appliedAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  @@unique([jobId, candidateId])
  @@index([jobId, candidateId])
}

enum ApplicationStatus { PENDING  REVIEWING  ACCEPTED  REJECTED }

model SavedJob {
  id          String    @id @default(cuid())
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id])
  candidateId String
  candidate   Candidate @relation(fields: [candidateId], references: [id])
  savedAt     DateTime  @default(now())
  @@unique([jobId, candidateId])
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```
