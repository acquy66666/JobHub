import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

const DEMO_PASSWORD = 'Demo@2026';
const HASH_ROUNDS = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function futureDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function pastDate(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding JobHub demo data...\n');

  const hash = await bcrypt.hash(DEMO_PASSWORD, HASH_ROUNDS);

  // ── 1. Users ────────────────────────────────────────────────────────────────

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@jobhub.vn' },
    update: {},
    create: {
      email: 'admin@jobhub.vn',
      passwordHash: hash,
      role: 'ADMIN',
      isVerified: true,
    },
  });

  const employerUser = await prisma.user.upsert({
    where: { email: 'employer@jobhub.vn' },
    update: {},
    create: {
      email: 'employer@jobhub.vn',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const fptUser = await prisma.user.upsert({
    where: { email: 'fpt@jobhub.vn' },
    update: {},
    create: {
      email: 'fpt@jobhub.vn',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const viettelUser = await prisma.user.upsert({
    where: { email: 'viettel@jobhub.vn' },
    update: {},
    create: {
      email: 'viettel@jobhub.vn',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const momoUser = await prisma.user.upsert({
    where: { email: 'momo@jobhub.vn' },
    update: {},
    create: {
      email: 'momo@jobhub.vn',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const vinaiUser = await prisma.user.upsert({
    where: { email: 'vinai@jobhub.vn' },
    update: {},
    create: {
      email: 'vinai@jobhub.vn',
      passwordHash: hash,
      role: 'EMPLOYER',
      isVerified: true,
    },
  });

  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@jobhub.vn' },
    update: {},
    create: {
      email: 'candidate@jobhub.vn',
      passwordHash: hash,
      role: 'CANDIDATE',
      isVerified: true,
    },
  });

  const candidateUser2 = await prisma.user.upsert({
    where: { email: 'nguyen.van.a@gmail.com' },
    update: {},
    create: {
      email: 'nguyen.van.a@gmail.com',
      passwordHash: hash,
      role: 'CANDIDATE',
      isVerified: true,
    },
  });

  const candidateUser3 = await prisma.user.upsert({
    where: { email: 'tran.thi.b@gmail.com' },
    update: {},
    create: {
      email: 'tran.thi.b@gmail.com',
      passwordHash: hash,
      role: 'CANDIDATE',
      isVerified: true,
    },
  });

  console.log('✅ Users created (9)');

  // ── 2. Employer Profiles ────────────────────────────────────────────────────

  const techcorp = await prisma.employer.upsert({
    where: { userId: employerUser.id },
    update: {},
    create: {
      userId: employerUser.id,
      companyName: 'TechCorp Vietnam',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/logo.png',
      website: 'https://techcorp.vn',
      industry: 'Công nghệ thông tin',
      companySize: '200-500',
      location: 'Hà Nội',
      isVerified: true,
      description:
        'TechCorp Vietnam là công ty phần mềm hàng đầu, chuyên phát triển các giải pháp chuyển đổi số cho doanh nghiệp. Chúng tôi luôn tìm kiếm những tài năng công nghệ để cùng kiến tạo tương lai số.',
    },
  });

  const fpt = await prisma.employer.upsert({
    where: { userId: fptUser.id },
    update: {},
    create: {
      userId: fptUser.id,
      companyName: 'FPT Software',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/logo.png',
      website: 'https://fpt-software.com',
      industry: 'Công nghệ thông tin',
      companySize: '10000+',
      location: 'Hà Nội',
      isVerified: true,
      description:
        'FPT Software là đơn vị thành viên của Tập đoàn FPT, cung cấp dịch vụ và giải pháp công nghệ cho khách hàng toàn cầu. Với hơn 30.000 nhân viên, chúng tôi là một trong những công ty IT lớn nhất Việt Nam.',
    },
  });

  const viettel = await prisma.employer.upsert({
    where: { userId: viettelUser.id },
    update: {},
    create: {
      userId: viettelUser.id,
      companyName: 'Viettel Digital',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/logo.png',
      website: 'https://digital.viettel.vn',
      industry: 'Viễn thông',
      companySize: '1000-5000',
      location: 'Hà Nội',
      isVerified: true,
      description:
        'Viettel Digital là đơn vị chủ lực về chuyển đổi số của Tập đoàn Viettel, phát triển các sản phẩm và dịch vụ số phục vụ hàng triệu người dùng tại Việt Nam và quốc tế.',
    },
  });

  const momo = await prisma.employer.upsert({
    where: { userId: momoUser.id },
    update: {},
    create: {
      userId: momoUser.id,
      companyName: 'MoMo',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/logo.png',
      website: 'https://momo.vn',
      industry: 'Fintech',
      companySize: '500-1000',
      location: 'TP. Hồ Chí Minh',
      isVerified: true,
      description:
        'MoMo là ví điện tử số 1 Việt Nam với hơn 30 triệu người dùng. Chúng tôi đang xây dựng hệ sinh thái tài chính số toàn diện và tìm kiếm những người tài để cùng phát triển.',
    },
  });

  const vinai = await prisma.employer.upsert({
    where: { userId: vinaiUser.id },
    update: {},
    create: {
      userId: vinaiUser.id,
      companyName: 'VinAI Research',
      logoUrl: 'https://res.cloudinary.com/demo/image/upload/v1/samples/logo.png',
      website: 'https://vinai.io',
      industry: 'Trí tuệ nhân tạo',
      companySize: '200-500',
      location: 'Hà Nội',
      isVerified: true,
      description:
        'VinAI Research là viện nghiên cứu AI hàng đầu Đông Nam Á, trực thuộc Vingroup. Chúng tôi nghiên cứu và ứng dụng AI vào các lĩnh vực xe tự lái, nhận dạng khuôn mặt, xử lý ngôn ngữ tự nhiên.',
    },
  });

  console.log('✅ Employer profiles created (5)');

  // ── 3. Candidate Profiles ───────────────────────────────────────────────────

  const candidate = await prisma.candidate.upsert({
    where: { userId: candidateUser.id },
    update: {},
    create: {
      userId: candidateUser.id,
      fullName: 'Lê Minh Hùng',
      phone: '0901234567',
      headline: 'Full-Stack Developer | React & Node.js | 3 năm kinh nghiệm',
      summary:
        'Lập trình viên Full-Stack với 3 năm kinh nghiệm xây dựng ứng dụng web hiện đại. Thành thạo React, Next.js, Node.js và PostgreSQL. Đam mê xây dựng sản phẩm có tác động thực sự đến người dùng.',
      location: 'Hà Nội',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Git', 'Tailwind CSS'],
      cvUrl: null,
      cvFileName: null,
    },
  });

  await prisma.experience.createMany({
    skipDuplicates: true,
    data: [
      {
        candidateId: candidate.id,
        company: 'TechViet JSC',
        position: 'Full-Stack Developer',
        startDate: new Date('2022-06-01'),
        endDate: null,
        isCurrent: true,
        description: 'Phát triển ứng dụng web với React + Node.js. Tham gia thiết kế kiến trúc hệ thống và tối ưu hiệu năng database.',
      },
      {
        candidateId: candidate.id,
        company: 'Startup ABC',
        position: 'Frontend Developer',
        startDate: new Date('2021-01-01'),
        endDate: new Date('2022-05-31'),
        isCurrent: false,
        description: 'Xây dựng giao diện người dùng với React và Redux. Làm việc chặt chẽ với UI/UX designer.',
      },
    ],
  });

  await prisma.education.createMany({
    skipDuplicates: true,
    data: [
      {
        candidateId: candidate.id,
        school: 'Đại học Bách Khoa Hà Nội',
        degree: 'Kỹ sư',
        major: 'Công nghệ thông tin',
        startYear: 2017,
        endYear: 2021,
      },
    ],
  });

  const candidate2 = await prisma.candidate.upsert({
    where: { userId: candidateUser2.id },
    update: {},
    create: {
      userId: candidateUser2.id,
      fullName: 'Nguyễn Văn A',
      phone: '0912345678',
      headline: 'Backend Developer | Java & Spring Boot',
      summary: 'Backend Developer 2 năm kinh nghiệm với Java Spring Boot và microservices.',
      location: 'Hà Nội',
      skills: ['Java', 'Spring Boot', 'MySQL', 'Docker', 'Kubernetes'],
    },
  });

  const candidate3 = await prisma.candidate.upsert({
    where: { userId: candidateUser3.id },
    update: {},
    create: {
      userId: candidateUser3.id,
      fullName: 'Trần Thị B',
      phone: '0987654321',
      headline: 'UI/UX Designer | Figma | 2 năm kinh nghiệm',
      summary: 'UI/UX Designer với 2 năm kinh nghiệm thiết kế sản phẩm digital. Thành thạo Figma, Adobe XD.',
      location: 'TP. Hồ Chí Minh',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    },
  });

  console.log('✅ Candidate profiles created (3)');

  // ── 4. Jobs ─────────────────────────────────────────────────────────────────

  // TechCorp Vietnam — 6 jobs (5 ACTIVE, 1 PENDING)
  const tcJobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'Senior Full-Stack Developer',
        description: 'Chúng tôi tìm kiếm Senior Full-Stack Developer để dẫn dắt team phát triển sản phẩm SaaS B2B. Bạn sẽ làm việc với stack React + Node.js + PostgreSQL trên môi trường cloud AWS.',
        requirements: '- 4+ năm kinh nghiệm Full-Stack\n- Thành thạo React, TypeScript, Node.js\n- Hiểu biết về Docker, CI/CD\n- Kỹ năng giao tiếp tốt, có khả năng mentor junior',
        benefits: 'Lương 30-50tr VND. MacBook Pro. Bảo hiểm cao cấp. Remote 3 ngày/tuần. Review lương 2 lần/năm.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 30000000,
        salaryMax: 50000000,
        industry: 'Công nghệ thông tin',
        experience: '4 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 142,
      },
    }),
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'Frontend Developer (React/Next.js)',
        description: 'TechCorp Vietnam tuyển dụng Frontend Developer để xây dựng giao diện người dùng cho nền tảng quản lý doanh nghiệp. Bạn sẽ làm việc với design team và backend team trong môi trường Agile.',
        requirements: '- 2+ năm kinh nghiệm Frontend\n- Thành thạo React, Next.js, TypeScript\n- Nắm vững CSS, Tailwind CSS\n- Có kinh nghiệm với TanStack Query hoặc SWR',
        benefits: 'Lương 15-25tr VND. Laptop. Bảo hiểm. Flexible working hours.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 15000000,
        salaryMax: 25000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 98,
      },
    }),
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'DevOps Engineer',
        description: 'Tìm kiếm DevOps Engineer để xây dựng và vận hành hạ tầng cloud cho các sản phẩm của TechCorp. Trách nhiệm bao gồm CI/CD pipeline, monitoring, và bảo mật hệ thống.',
        requirements: '- 3+ năm kinh nghiệm DevOps\n- Thành thạo AWS hoặc GCP\n- Docker, Kubernetes\n- Terraform, Ansible\n- Kinh nghiệm với Prometheus, Grafana',
        benefits: 'Lương 25-40tr VND. Remote full-time. Được hỗ trợ chứng chỉ AWS/GCP.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'REMOTE',
        salaryMin: 25000000,
        salaryMax: 40000000,
        industry: 'Công nghệ thông tin',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(60),
        viewCount: 76,
      },
    }),
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'Product Manager',
        description: 'Chúng tôi tìm kiếm Product Manager để định hướng và phát triển sản phẩm SaaS của TechCorp. Bạn sẽ làm cầu nối giữa business và kỹ thuật, xây dựng roadmap và ưu tiên tính năng.',
        requirements: '- 3+ năm kinh nghiệm Product Manager\n- Tư duy phân tích dữ liệu tốt\n- Kinh nghiệm với Agile/Scrum\n- Kỹ năng giao tiếp xuất sắc (tiếng Anh và Việt)',
        benefits: 'Lương 25-40tr VND. Stock option. Remote linh hoạt.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 25000000,
        salaryMax: 40000000,
        industry: 'Công nghệ thông tin',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 54,
      },
    }),
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'Thực tập sinh Lập trình (Fresher)',
        description: 'TechCorp Vietnam tuyển thực tập sinh lập trình để tham gia vào các dự án thực tế. Chương trình thực tập 3-6 tháng, có mentorship từ senior developer.',
        requirements: '- Sinh viên năm 3-4 ngành CNTT\n- Biết React hoặc Node.js cơ bản\n- Chăm chỉ, ham học hỏi\n- Có thể làm full-time hoặc part-time',
        benefits: 'Trợ cấp 3-5tr VND/tháng. Mentorship. Cơ hội được nhận chính thức sau thực tập.',
        location: 'Hà Nội',
        jobType: 'INTERNSHIP',
        workMode: 'HYBRID',
        salaryMin: 3000000,
        salaryMax: 5000000,
        industry: 'Công nghệ thông tin',
        experience: '0 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(90),
        viewCount: 213,
      },
    }),
    prisma.job.create({
      data: {
        employerId: techcorp.id,
        title: 'Mobile Developer (React Native)',
        description: 'Tuyển Mobile Developer xây dựng ứng dụng React Native cho cả iOS và Android. Bạn sẽ phát triển tính năng mới và tối ưu hiệu năng cho ứng dụng di động của TechCorp.',
        requirements: '- 2+ năm kinh nghiệm React Native\n- Hiểu biết về native modules iOS/Android\n- Kinh nghiệm với Redux Toolkit hoặc Zustand\n- Biết tích hợp API REST',
        benefits: 'Lương 20-35tr VND. MacBook. Bảo hiểm. Flexible hours.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 20000000,
        salaryMax: 35000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'PENDING',
        expiresAt: futureDate(30),
        viewCount: 0,
      },
    }),
  ]);

  // FPT Software — 6 jobs (5 ACTIVE, 1 PENDING)
  const fptJobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'Java Backend Developer',
        description: 'FPT Software tuyển Java Backend Developer tham gia dự án outsourcing cho khách hàng Nhật Bản và Hàn Quốc. Môi trường làm việc chuyên nghiệp, cơ hội học hỏi công nghệ mới.',
        requirements: '- 2+ năm kinh nghiệm Java\n- Spring Boot, Hibernate\n- MySQL hoặc PostgreSQL\n- Tiếng Nhật N3 hoặc tiếng Anh B2 là lợi thế',
        benefits: 'Lương 15-25tr VND. 13th month salary. Opportunity to work onsite Japan/Korea.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 15000000,
        salaryMax: 25000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 187,
      },
    }),
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'Business Analyst',
        description: 'Tuyển Business Analyst hỗ trợ phân tích yêu cầu nghiệp vụ và làm cầu nối giữa khách hàng với đội kỹ thuật trong các dự án phần mềm quy mô lớn.',
        requirements: '- 2+ năm kinh nghiệm BA\n- Thành thạo UML, flowchart\n- Kỹ năng viết tài liệu tốt\n- Tiếng Anh giao tiếp tốt\n- Ưu tiên có kinh nghiệm lĩnh vực Finance/Banking',
        benefits: 'Lương 18-28tr VND. Professional development budget. Annual trip.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 18000000,
        salaryMax: 28000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 93,
      },
    }),
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'QA Engineer (Automation)',
        description: 'FPT Software tuyển QA Engineer chuyên về automation testing. Bạn sẽ xây dựng framework test tự động và đảm bảo chất lượng phần mềm trước khi release.',
        requirements: '- 2+ năm kinh nghiệm QA/Test\n- Thành thạo Selenium, Playwright hoặc Cypress\n- Biết lập trình Python hoặc Java\n- Kinh nghiệm với Jira, TestRail',
        benefits: 'Lương 15-22tr VND. Certified testing training. Remote 2 ngày/tuần.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 15000000,
        salaryMax: 22000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(60),
        viewCount: 67,
      },
    }),
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'Scrum Master',
        description: 'Tuyển Scrum Master có kinh nghiệm dẫn dắt team Agile trong các dự án phần mềm quy mô lớn. Bạn sẽ là người giữ nhịp và loại bỏ rào cản cho đội nhóm.',
        requirements: '- Chứng chỉ CSM hoặc PSM\n- 3+ năm kinh nghiệm làm Scrum Master\n- Kỹ năng coaching và facilitation\n- Kinh nghiệm làm việc với đội nhóm đa văn hóa',
        benefits: 'Lương 25-38tr VND. Leadership training. International project exposure.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 25000000,
        salaryMax: 38000000,
        industry: 'Công nghệ thông tin',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 45,
      },
    }),
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'Data Engineer',
        description: 'FPT Software tuyển Data Engineer để xây dựng data pipeline và hạ tầng dữ liệu cho các dự án AI/Analytics. Bạn sẽ làm việc với lượng dữ liệu lớn từ nhiều nguồn khác nhau.',
        requirements: '- 3+ năm kinh nghiệm Data Engineering\n- Apache Spark, Kafka, Airflow\n- Python, SQL\n- Kinh nghiệm với cloud data warehouse (BigQuery, Redshift, Snowflake)',
        benefits: 'Lương 25-40tr VND. Remote friendly. AWS/GCP certification support.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'REMOTE',
        salaryMin: 25000000,
        salaryMax: 40000000,
        industry: 'Công nghệ thông tin',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 112,
      },
    }),
    prisma.job.create({
      data: {
        employerId: fpt.id,
        title: 'Technical Lead (.NET)',
        description: 'Tuyển Technical Lead có kinh nghiệm với .NET để dẫn dắt team 5-8 người trong dự án phát triển hệ thống quản lý tài chính cho khách hàng châu Âu.',
        requirements: '- 5+ năm kinh nghiệm .NET C#\n- Kinh nghiệm lead team 5+ người\n- ASP.NET Core, Entity Framework\n- Microservices architecture\n- Tiếng Anh tốt',
        benefits: 'Lương 40-60tr VND. Onsite opportunity Europe. Premium health insurance.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 40000000,
        salaryMax: 60000000,
        industry: 'Công nghệ thông tin',
        experience: '5 năm',
        status: 'PENDING',
        expiresAt: futureDate(30),
        viewCount: 0,
      },
    }),
  ]);

  // Viettel Digital — 5 jobs (4 ACTIVE, 1 PENDING)
  const viettelJobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: viettel.id,
        title: 'Software Engineer (Golang)',
        description: 'Viettel Digital tuyển Software Engineer Golang để phát triển các microservices xử lý hàng triệu request mỗi ngày. Bạn sẽ tham gia xây dựng nền tảng cloud communication.',
        requirements: '- 3+ năm kinh nghiệm Golang\n- Thiết kế và vận hành microservices\n- Redis, Kafka\n- Kinh nghiệm với gRPC là lợi thế',
        benefits: 'Lương 25-40tr VND. Nhà công vụ tại Hà Nội (cho người ngoại tỉnh). Bảo hiểm PVI.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 25000000,
        salaryMax: 40000000,
        industry: 'Viễn thông',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 89,
      },
    }),
    prisma.job.create({
      data: {
        employerId: viettel.id,
        title: 'UI/UX Designer',
        description: 'Tuyển UI/UX Designer để thiết kế trải nghiệm người dùng cho các ứng dụng mobile và web của Viettel Digital. Bạn sẽ làm việc trực tiếp với Product Manager và engineering team.',
        requirements: '- 2+ năm kinh nghiệm UI/UX\n- Thành thạo Figma\n- Hiểu biết về mobile design patterns (iOS, Android)\n- Kỹ năng nghiên cứu người dùng\n- Portfolio đẹp là bắt buộc',
        benefits: 'Lương 15-25tr VND. Creative workspace. Design conference budget.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 15000000,
        salaryMax: 25000000,
        industry: 'Viễn thông',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 134,
      },
    }),
    prisma.job.create({
      data: {
        employerId: viettel.id,
        title: 'Cloud Infrastructure Engineer',
        description: 'Viettel Cloud tuyển Cloud Infrastructure Engineer để xây dựng và vận hành hạ tầng cloud riêng của Viettel phục vụ hàng nghìn doanh nghiệp.',
        requirements: '- 3+ năm DevOps/Cloud\n- OpenStack hoặc VMware\n- Kubernetes, Ansible\n- Networking (VLAN, BGP, OSPF)',
        benefits: 'Lương 28-45tr VND. Chứng chỉ cloud được hỗ trợ. Security clearance required.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 28000000,
        salaryMax: 45000000,
        industry: 'Viễn thông',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 56,
      },
    }),
    prisma.job.create({
      data: {
        employerId: viettel.id,
        title: 'Marketing Digital Specialist',
        description: 'Tuyển Digital Marketing Specialist quản lý và tối ưu các kênh marketing online cho các sản phẩm số của Viettel.',
        requirements: '- 2+ năm kinh nghiệm Digital Marketing\n- Google Ads, Facebook Ads, TikTok Ads\n- Phân tích dữ liệu với Google Analytics\n- Kỹ năng viết content hấp dẫn',
        benefits: 'Lương 12-20tr VND. Marketing tools budget. Growth opportunities.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 12000000,
        salaryMax: 20000000,
        industry: 'Marketing',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(60),
        viewCount: 78,
      },
    }),
    prisma.job.create({
      data: {
        employerId: viettel.id,
        title: 'Cybersecurity Analyst',
        description: 'Viettel Cyber Security tuyển Cybersecurity Analyst để bảo vệ hạ tầng mạng và dữ liệu khách hàng. Làm việc trong SOC team, phân tích và ứng phó sự cố bảo mật.',
        requirements: '- 2+ năm kinh nghiệm Security\n- CEH, OSCP hoặc CompTIA Security+\n- SIEM, IDS/IPS\n- Kinh nghiệm pentesting là lợi thế',
        benefits: 'Lương 20-35tr VND. Security certifications sponsored. Clearance required.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 20000000,
        salaryMax: 35000000,
        industry: 'Công nghệ thông tin',
        experience: '2 năm',
        status: 'PENDING',
        expiresAt: futureDate(30),
        viewCount: 0,
      },
    }),
  ]);

  // MoMo — 6 jobs (6 ACTIVE)
  const momoJobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'Senior Backend Engineer (Python)',
        description: 'MoMo tuyển Senior Backend Engineer để phát triển hệ thống xử lý thanh toán và core banking. Bạn sẽ làm việc với hệ thống xử lý hàng triệu giao dịch mỗi ngày.',
        requirements: '- 4+ năm Python backend\n- Microservices, event-driven architecture\n- Redis, Kafka, PostgreSQL\n- Kinh nghiệm fintech/banking là lợi thế',
        benefits: 'Lương 35-55tr VND. ESOP. Free lunch. Gym membership. Premium healthcare.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 35000000,
        salaryMax: 55000000,
        industry: 'Fintech',
        experience: '4 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 234,
      },
    }),
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'Data Scientist',
        description: 'Tuyển Data Scientist xây dựng các mô hình machine learning cho hệ thống phát hiện gian lận, credit scoring và recommendation engine của MoMo.',
        requirements: '- 3+ năm Data Science/ML\n- Python, TensorFlow hoặc PyTorch\n- Kinh nghiệm với tabular data và time series\n- Thành thạo SQL\n- Bằng cử nhân/thạc sĩ Toán/Thống kê/CNTT',
        benefits: 'Lương 30-50tr VND. Research budget. Conference attendance. ESOP.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'REMOTE',
        salaryMin: 30000000,
        salaryMax: 50000000,
        industry: 'Fintech',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 178,
      },
    }),
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'iOS Developer (Swift)',
        description: 'MoMo tuyển iOS Developer phát triển tính năng mới cho ứng dụng di động của ví điện tử số 1 Việt Nam với hơn 30 triệu người dùng.',
        requirements: '- 3+ năm iOS development\n- Swift, SwiftUI\n- Kinh nghiệm tích hợp payment SDK\n- Hiểu biết về UX trên iOS\n- Published app trên App Store',
        benefits: 'Lương 28-45tr VND. Latest iPhone. ESOP. Free lunch.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 28000000,
        salaryMax: 45000000,
        industry: 'Fintech',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 89,
      },
    }),
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'Product Designer',
        description: 'Tuyển Product Designer thiết kế trải nghiệm người dùng đỉnh cao cho ứng dụng MoMo. Bạn sẽ làm việc trong team design 20+ người và ảnh hưởng đến hàng triệu người dùng.',
        requirements: '- 3+ năm Product/UX Design\n- Thành thạo Figma\n- Hiểu biết sâu về mobile UX\n- Kỹ năng storytelling và trình bày tốt\n- Portfolio ấn tượng',
        benefits: 'Lương 20-35tr VND. Design tools. Creative office. ESOP.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 20000000,
        salaryMax: 35000000,
        industry: 'Fintech',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(60),
        viewCount: 156,
      },
    }),
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'Risk & Compliance Analyst',
        description: 'Tuyển Risk Analyst phân tích và quản lý rủi ro trong các hoạt động tài chính của MoMo, đảm bảo tuân thủ quy định của NHNN.',
        requirements: '- 2+ năm kinh nghiệm Risk/Compliance trong Fintech hoặc ngân hàng\n- Hiểu biết về quy định NHNN, AML/CFT\n- Kỹ năng phân tích dữ liệu\n- Tiếng Anh tốt',
        benefits: 'Lương 18-28tr VND. Professional certifications. Annual bonus.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 18000000,
        salaryMax: 28000000,
        industry: 'Tài chính',
        experience: '2 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 43,
      },
    }),
    prisma.job.create({
      data: {
        employerId: momo.id,
        title: 'Freelance Content Creator (Part-time)',
        description: 'MoMo tìm kiếm Content Creator part-time/freelance tạo nội dung video và bài viết giới thiệu tính năng mới của ví MoMo trên các kênh social media.',
        requirements: '- Kỹ năng viết lách và sáng tạo nội dung tốt\n- Hiểu biết về TikTok, Facebook, Instagram\n- Biết sử dụng Canva hoặc CapCut\n- Linh hoạt thời gian làm việc',
        benefits: 'Thù lao 200-500k/bài. Remote 100%. Làm việc linh hoạt.',
        location: 'TP. Hồ Chí Minh',
        jobType: 'FREELANCE',
        workMode: 'REMOTE',
        salaryMin: 5000000,
        salaryMax: 15000000,
        industry: 'Marketing',
        experience: '0 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(90),
        viewCount: 312,
      },
    }),
  ]);

  // VinAI Research — 5 jobs (4 ACTIVE, 1 PAUSED)
  const vinaiJobs = await Promise.all([
    prisma.job.create({
      data: {
        employerId: vinai.id,
        title: 'AI/ML Engineer (Computer Vision)',
        description: 'VinAI Research tuyển AI/ML Engineer chuyên về Computer Vision để phát triển các model nhận dạng vật thể, phân tích hình ảnh y tế và hệ thống xe tự lái.',
        requirements: '- Thạc sĩ/Tiến sĩ AI/ML hoặc 4+ năm kinh nghiệm\n- Thành thạo PyTorch, OpenCV\n- Kinh nghiệm với YOLO, Transformer architectures\n- Publication tại top conference là lợi thế (CVPR, ICCV, NeurIPS)',
        benefits: 'Lương 50-80tr VND. Research budget. Conference travel. Publication bonus.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 50000000,
        salaryMax: 80000000,
        industry: 'Trí tuệ nhân tạo',
        experience: '4 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(45),
        viewCount: 267,
      },
    }),
    prisma.job.create({
      data: {
        employerId: vinai.id,
        title: 'NLP Research Engineer',
        description: 'Tuyển NLP Research Engineer nghiên cứu và phát triển các mô hình ngôn ngữ lớn (LLM) cho tiếng Việt. Bạn sẽ làm việc trực tiếp với các nhà nghiên cứu hàng đầu.',
        requirements: '- Bằng thạc sĩ/tiến sĩ NLP hoặc 3+ năm nghiên cứu\n- Thành thạo Hugging Face, PyTorch\n- Kinh nghiệm fine-tuning LLMs\n- Đọc và hiểu research papers tốt',
        benefits: 'Lương 45-70tr VND. GPU compute credits. Research publications.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 45000000,
        salaryMax: 70000000,
        industry: 'Trí tuệ nhân tạo',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(60),
        viewCount: 198,
      },
    }),
    prisma.job.create({
      data: {
        employerId: vinai.id,
        title: 'MLOps Engineer',
        description: 'VinAI tuyển MLOps Engineer để xây dựng và vận hành platform phục vụ training và serving các AI model. Đảm bảo các model AI được triển khai hiệu quả vào sản phẩm.',
        requirements: '- 3+ năm MLOps/Platform Engineering\n- Kubeflow, MLflow, Airflow\n- Kubernetes, Docker\n- Kinh nghiệm với GPU cluster management',
        benefits: 'Lương 35-55tr VND. NVIDIA GPU resources. Training budget.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'HYBRID',
        salaryMin: 35000000,
        salaryMax: 55000000,
        industry: 'Trí tuệ nhân tạo',
        experience: '3 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(30),
        viewCount: 143,
      },
    }),
    prisma.job.create({
      data: {
        employerId: vinai.id,
        title: 'Research Intern (AI/ML)',
        description: 'VinAI Research tuyển thực tập sinh nghiên cứu AI/ML để tham gia các dự án nghiên cứu công bố tại hội nghị quốc tế. Chương trình thực tập 6 tháng với mentorship từ các nhà nghiên cứu senior.',
        requirements: '- Sinh viên năm cuối hoặc học viên cao học\n- Nền tảng toán học vững (Linear Algebra, Probability, Calculus)\n- Biết Python, có kinh nghiệm với ML cơ bản\n- GPA ≥ 3.2 hoặc tương đương',
        benefits: 'Trợ cấp 8-12tr VND/tháng. Mentorship từ PhD researchers. Cơ hội co-author paper.',
        location: 'Hà Nội',
        jobType: 'INTERNSHIP',
        workMode: 'ON_SITE',
        salaryMin: 8000000,
        salaryMax: 12000000,
        industry: 'Trí tuệ nhân tạo',
        experience: '0 năm',
        status: 'ACTIVE',
        expiresAt: futureDate(90),
        viewCount: 421,
      },
    }),
    prisma.job.create({
      data: {
        employerId: vinai.id,
        title: 'Autonomous Driving Engineer',
        description: 'Tuyển kỹ sư hệ thống lái xe tự động tham gia dự án xe tự lái VinFast. Làm việc với sensor fusion, path planning và control system.',
        requirements: '- 4+ năm kinh nghiệm AV hoặc robotics\n- C++, Python, ROS\n- Kinh nghiệm với LiDAR, Camera, Radar\n- Bằng thạc sĩ kỹ thuật',
        benefits: 'Lương 50-75tr VND. Relocation support. Premium insurance.',
        location: 'Hà Nội',
        jobType: 'FULL_TIME',
        workMode: 'ON_SITE',
        salaryMin: 50000000,
        salaryMax: 75000000,
        industry: 'Trí tuệ nhân tạo',
        experience: '4 năm',
        status: 'PAUSED',
        expiresAt: futureDate(30),
        viewCount: 89,
      },
    }),
  ]);

  console.log(`✅ Jobs created (${tcJobs.length + fptJobs.length + viettelJobs.length + momoJobs.length + vinaiJobs.length})`);

  // ── 5. Applications ──────────────────────────────────────────────────────────

  const cvUrl = 'https://res.cloudinary.com/demo/raw/upload/v1/samples/cv-demo.pdf';

  const applicationData = [
    // candidate@jobhub.vn (Lê Minh Hùng) — 12 applications
    { jobId: tcJobs[0].id, candidateId: candidate.id, status: 'REVIEWING' as const, coverLetter: 'Tôi có 3 năm kinh nghiệm Full-Stack React + Node.js và đã từng dẫn dắt team nhỏ 3 người. Tôi rất hứng thú với vị trí Senior tại TechCorp.', note: 'CV ấn tượng, mời phỏng vấn vòng 1' },
    { jobId: tcJobs[1].id, candidateId: candidate.id, status: 'ACCEPTED' as const, coverLetter: 'Next.js và Tailwind CSS là những công cụ tôi dùng hàng ngày. Sẵn sàng contribute ngay từ tuần đầu tiên.', note: 'Passed technical interview' },
    { jobId: fptJobs[0].id, candidateId: candidate.id, status: 'PENDING' as const, coverLetter: 'Tôi muốn mở rộng kinh nghiệm với Java Spring Boot. Sẵn sàng học thêm để đáp ứng yêu cầu.', note: null },
    { jobId: fptJobs[4].id, candidateId: candidate.id, status: 'REJECTED' as const, coverLetter: 'Tôi có kinh nghiệm xây dựng data pipeline nhỏ với Python. Muốn phát triển sang hướng Data Engineering.', note: 'Không đủ kinh nghiệm Spark/Kafka' },
    { jobId: viettelJobs[0].id, candidateId: candidate.id, status: 'PENDING' as const, coverLetter: 'Tôi đã tự học Golang trong 6 tháng qua và xây dựng 2 side project với Gin framework. Rất hứng thú với hệ thống xử lý cao tải.', note: null },
    { jobId: momoJobs[0].id, candidateId: candidate.id, status: 'REVIEWING' as const, coverLetter: 'Full-Stack experience của tôi bao gồm Node.js backend với PostgreSQL. Đam mê fintech và muốn contribute vào hệ thống thanh toán lớn.', note: 'Schedule technical screen' },
    { jobId: momoJobs[5].id, candidateId: candidate.id, status: 'PENDING' as const, coverLetter: null, note: null },
    { jobId: vinaiJobs[2].id, candidateId: candidate.id, status: 'REJECTED' as const, coverLetter: 'Tôi có kinh nghiệm với Docker và K8s, muốn phát triển sang hướng MLOps.', note: 'Không có kinh nghiệm GPU cluster' },
    { jobId: tcJobs[4].id, candidateId: candidate.id, status: 'ACCEPTED' as const, coverLetter: 'Tôi đang là sinh viên năm 4 BKHN và muốn có cơ hội thực tập tại TechCorp.', note: 'Nhận vào chương trình thực tập' },
    { jobId: fptJobs[1].id, candidateId: candidate.id, status: 'PENDING' as const, coverLetter: 'Tôi có kinh nghiệm phân tích yêu cầu trong 2 project thực tế tại trường và internship.', note: null },

    // nguyen.van.a — 5 applications tại TechCorp và FPT
    { jobId: tcJobs[0].id, candidateId: candidate2.id, status: 'PENDING' as const, coverLetter: '4 năm kinh nghiệm Java + Spring Boot, muốn chuyển sang Full-Stack.', note: null },
    { jobId: tcJobs[2].id, candidateId: candidate2.id, status: 'REVIEWING' as const, coverLetter: 'Kinh nghiệm Docker và Kubernetes trong 3 năm tại công ty cũ.', note: 'Tech background phù hợp' },
    { jobId: fptJobs[0].id, candidateId: candidate2.id, status: 'ACCEPTED' as const, coverLetter: 'Java Spring Boot là chuyên môn chính của tôi. N3 tiếng Nhật.', note: 'Offer sent' },
    { jobId: fptJobs[5].id, candidateId: candidate2.id, status: 'REVIEWING' as const, coverLetter: 'Kinh nghiệm lead team 3 người trong 2 năm. Technical background .NET và Java.', note: null },
    { jobId: viettelJobs[0].id, candidateId: candidate2.id, status: 'PENDING' as const, coverLetter: 'Golang là ngôn ngữ tôi đang dùng trong 1.5 năm qua tại startup.', note: null },

    // tran.thi.b — 5 applications tại MoMo và VinAI
    { jobId: momoJobs[3].id, candidateId: candidate3.id, status: 'REVIEWING' as const, coverLetter: 'Portfolio của tôi bao gồm 10+ mobile app design trên Figma. Đam mê Fintech UX.', note: 'Portfolio rất ấn tượng' },
    { jobId: viettelJobs[1].id, candidateId: candidate3.id, status: 'ACCEPTED' as const, coverLetter: '2 năm UI/UX Designer mobile tại agency, thành thạo iOS và Android design system.', note: 'Passed design test' },
    { jobId: tcJobs[3].id, candidateId: candidate3.id, status: 'PENDING' as const, coverLetter: 'Ngoài design, tôi có kinh nghiệm làm Product tại startup 1 năm.', note: null },
    { jobId: momoJobs[5].id, candidateId: candidate3.id, status: 'PENDING' as const, coverLetter: 'Tôi có 1k followers TikTok về nội dung tài chính cá nhân.', note: null },
    { jobId: vinaiJobs[3].id, candidateId: candidate3.id, status: 'REJECTED' as const, coverLetter: 'Tôi muốn thực tập để học về AI UX design.', note: 'Vị trí không phù hợp với background design' },
  ];

  for (const app of applicationData) {
    await prisma.application.upsert({
      where: { jobId_candidateId: { jobId: app.jobId, candidateId: app.candidateId } },
      update: {},
      create: {
        jobId: app.jobId,
        candidateId: app.candidateId,
        cvUrl,
        coverLetter: app.coverLetter ?? undefined,
        status: app.status,
        note: app.note ?? undefined,
      },
    });
  }

  console.log(`✅ Applications created (${applicationData.length})`);

  // ── 6. Saved Jobs ────────────────────────────────────────────────────────────

  const savedJobData = [
    { jobId: vinaiJobs[0].id, candidateId: candidate.id },
    { jobId: momoJobs[1].id, candidateId: candidate.id },
    { jobId: fptJobs[4].id, candidateId: candidate.id },
    { jobId: tcJobs[2].id, candidateId: candidate.id },
    { jobId: vinaiJobs[1].id, candidateId: candidate.id },
    { jobId: momoJobs[0].id, candidateId: candidate.id },
  ];

  for (const saved of savedJobData) {
    await prisma.savedJob.upsert({
      where: { jobId_candidateId: { jobId: saved.jobId, candidateId: saved.candidateId } },
      update: {},
      create: saved,
    });
  }

  console.log(`✅ Saved jobs created (${savedJobData.length})`);

  // ── Done ─────────────────────────────────────────────────────────────────────

  // ── 7. Flagged Jobs (Fraud Detection demo) ──────────────────────────────────

  const flaggedJobsCount = await prisma.job.count({ where: { isFlagged: true } });
  if (flaggedJobsCount === 0) {
    await Promise.all([
      prisma.job.create({
        data: {
          employerId: techcorp.id,
          title: 'Senior Full-Stack Developer',
          description: 'Tuyển gấp Senior Full-Stack Developer bổ sung cho team. Ưu tiên ứng viên có kinh nghiệm React và Node.js. Lương hấp dẫn, môi trường năng động.',
          requirements: '- 4+ năm Full-Stack\n- React, TypeScript, Node.js\n- PostgreSQL, Docker\n- Kỹ năng giao tiếp tốt',
          benefits: 'Lương 30-50tr VND. MacBook. Remote linh hoạt.',
          location: 'Hà Nội',
          jobType: 'FULL_TIME',
          workMode: 'REMOTE',
          salaryMin: 30000000,
          salaryMax: 50000000,
          industry: 'Công nghệ thông tin',
          experience: '4 năm',
          status: 'PENDING',
          expiresAt: futureDate(30),
          isFlagged: true,
          flagReason: 'Trùng tiêu đề trong vòng 24 giờ',
        },
      }),
      prisma.job.create({
        data: {
          employerId: momo.id,
          title: 'Digital Marketing Executive',
          description: 'MoMo tuyển Digital Marketing Executive thúc đẩy tăng trưởng người dùng qua các kênh digital. Cơ hội làm việc với sản phẩm Fintech số 1 Việt Nam.',
          requirements: '- 2+ năm Digital Marketing\n- Google/Facebook/TikTok Ads\n- Phân tích dữ liệu\n- Content creation',
          benefits: 'Lương 15-22tr VND. ESOP. Môi trường năng động.',
          location: 'TP. Hồ Chí Minh',
          jobType: 'FULL_TIME',
          workMode: 'ON_SITE',
          salaryMin: 15000000,
          salaryMax: 22000000,
          industry: 'Marketing',
          experience: '2 năm',
          status: 'PENDING',
          expiresAt: futureDate(30),
          isFlagged: true,
          flagReason: 'Đăng quá 10 tin trong 24 giờ (11 tin)',
        },
      }),
      prisma.job.create({
        data: {
          employerId: fpt.id,
          title: 'Java Backend Developer',
          description: 'FPT Software tuyển bổ sung Java Backend Developer cho dự án ngân hàng Nhật Bản. Cơ hội đi Nhật onsite 3-6 tháng.',
          requirements: '- 2+ năm Java Spring Boot\n- Hibernate, MySQL\n- Tiếng Nhật N3 hoặc tiếng Anh B2\n- Quen làm việc Agile',
          benefits: 'Lương 16-26tr VND. Cơ hội đi Nhật. Đào tạo liên tục.',
          location: 'Hà Nội',
          jobType: 'FULL_TIME',
          workMode: 'HYBRID',
          salaryMin: 16000000,
          salaryMax: 26000000,
          industry: 'Công nghệ thông tin',
          experience: '2 năm',
          status: 'PENDING',
          expiresAt: futureDate(30),
          isFlagged: true,
          flagReason: 'Trùng tiêu đề trong vòng 24 giờ',
        },
      }),
    ]);
    console.log('✅ Flagged jobs created (3)');
  }

  // ── 8. Reports ───────────────────────────────────────────────────────────────

  const reportsCount = await prisma.report.count();
  if (reportsCount === 0) {
    const reportRows = [
      { reporterId: candidateUser.id,  targetId: momoJobs[5].id,    reason: 'SPAM',          description: 'Tin này xuất hiện lặp đi lặp lại nhiều lần trong ngày, gây nhiễu kết quả tìm kiếm.', status: 'PENDING',   adminNote: null },
      { reporterId: candidateUser2.id, targetId: vinaiJobs[4].id,   reason: 'MISLEADING',    description: 'Mô tả lương 50-75tr nhưng khi phỏng vấn thực tế mức offer chỉ 35tr, misleading hoàn toàn.', status: 'PENDING', adminNote: null },
      { reporterId: candidateUser3.id, targetId: tcJobs[5].id,      reason: 'INAPPROPRIATE', description: 'Form ứng tuyển yêu cầu cung cấp CMND, ảnh cá nhân và địa chỉ nhà riêng — không liên quan đến tuyển dụng.', status: 'PENDING', adminNote: null },
      { reporterId: candidateUser.id,  targetId: fptJobs[3].id,     reason: 'FRAUD',         description: 'Nhà tuyển dụng yêu cầu đóng phí "đào tạo" 500.000đ trước khi phỏng vấn — dấu hiệu lừa đảo rõ ràng.', status: 'PENDING', adminNote: null },
      { reporterId: candidateUser2.id, targetId: viettelJobs[4].id, reason: 'SPAM',          description: 'Tin đăng giống hệt nhau đã xuất hiện 3 lần trong 1 tuần với nội dung copy-paste.', status: 'REVIEWED',  adminNote: 'Đã kiểm tra — đây là tin đăng lại do cũ hết hạn, không vi phạm quy định. NTD đã được nhắc nhở.' },
      { reporterId: candidateUser3.id, targetId: momoJobs[4].id,    reason: 'MISLEADING',    description: 'Mô tả công việc quá chung chung, không rõ KPI và trách nhiệm thực tế.', status: 'REVIEWED', adminNote: 'Đã liên hệ MoMo HR và yêu cầu cập nhật JD chi tiết hơn. NTD đã bổ sung nội dung.' },
      { reporterId: candidateUser.id,  targetId: tcJobs[2].id,      reason: 'OTHER',         description: 'Không tìm thấy thông tin liên hệ trực tiếp của HR trong mô tả.', status: 'DISMISSED', adminNote: 'Báo cáo không hợp lệ. Thông tin liên hệ qua hệ thống ứng tuyển là đủ theo quy định.' },
      { reporterId: candidateUser2.id, targetId: fptJobs[2].id,     reason: 'INAPPROPRIATE', description: 'Yêu cầu kinh nghiệm 2 năm nhưng mức lương chỉ 15-22tr — không tương xứng với thị trường.', status: 'DISMISSED', adminNote: 'Không vi phạm chính sách. Mức lương và yêu cầu là quyết định của NTD.' },
    ];

    for (const r of reportRows) {
      await prisma.report.create({
        data: {
          reporterId: r.reporterId,
          targetType: 'JOB',
          targetId: r.targetId,
          reason: r.reason as any,
          description: r.description,
          status: r.status as any,
          adminNote: r.adminNote,
        },
      });
    }
    console.log(`✅ Reports created (${reportRows.length})`);
  }

  // ── 9. Audit Logs ────────────────────────────────────────────────────────────

  const logsCount = await prisma.auditLog.count();
  if (logsCount === 0) {
    const allJobs = [...tcJobs, ...fptJobs, ...viettelJobs, ...momoJobs, ...vinaiJobs];
    const auditRows: Array<{ action: string; targetType: string; targetId: string; daysAgo: number; metadata: Record<string, unknown> }> = [
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: tcJobs[0].id,       daysAgo: 30, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: fptJobs[0].id,      daysAgo: 28, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: momoJobs[0].id,     daysAgo: 25, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: viettelJobs[0].id,  daysAgo: 22, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: vinaiJobs[0].id,    daysAgo: 20, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: fptJobs[1].id,      daysAgo: 18, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: momoJobs[3].id,     daysAgo: 15, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_APPROVED',       targetType: 'JOB',    targetId: tcJobs[1].id,       daysAgo: 12, metadata: { previousStatus: 'PENDING' } },
      { action: 'JOB_REJECTED',       targetType: 'JOB',    targetId: allJobs[10].id,     daysAgo: 10, metadata: { previousStatus: 'PENDING', reason: 'Nội dung không đầy đủ, thiếu phúc lợi' } },
      { action: 'JOB_REJECTED',       targetType: 'JOB',    targetId: allJobs[15].id,     daysAgo: 6,  metadata: { previousStatus: 'PENDING', reason: 'Mức lương không thực tế' } },
      { action: 'USER_BANNED',        targetType: 'USER',   targetId: candidateUser2.id,  daysAgo: 14, metadata: { reason: 'Tạo nhiều tài khoản spam và báo cáo giả mạo' } },
      { action: 'USER_UNBANNED',      targetType: 'USER',   targetId: candidateUser2.id,  daysAgo: 7,  metadata: { reason: 'Đã xác minh danh tính, cam kết không tái phạm' } },
      { action: 'EMPLOYER_VERIFIED',  targetType: 'USER',   targetId: fptUser.id,         daysAgo: 25, metadata: { companyName: 'FPT Software' } },
      { action: 'EMPLOYER_VERIFIED',  targetType: 'USER',   targetId: momoUser.id,        daysAgo: 20, metadata: { companyName: 'MoMo' } },
      { action: 'EMPLOYER_VERIFIED',  targetType: 'USER',   targetId: viettelUser.id,     daysAgo: 16, metadata: { companyName: 'Viettel Digital' } },
      { action: 'EMPLOYER_VERIFIED',  targetType: 'USER',   targetId: vinaiUser.id,       daysAgo: 10, metadata: { companyName: 'VinAI Research' } },
      { action: 'REPORT_REVIEWED',    targetType: 'REPORT', targetId: 'report-demo-1',    daysAgo: 4,  metadata: { adminNote: 'Đã xem xét và liên hệ NTD' } },
      { action: 'REPORT_DISMISSED',   targetType: 'REPORT', targetId: 'report-demo-2',    daysAgo: 2,  metadata: { adminNote: 'Không vi phạm chính sách' } },
      { action: 'USER_ROLE_CHANGED',  targetType: 'USER',   targetId: candidateUser3.id,  daysAgo: 1,  metadata: { fromRole: 'CANDIDATE', toRole: 'CANDIDATE', note: 'Kiểm tra quyền hạn' } },
    ];

    for (const row of auditRows) {
      await prisma.auditLog.create({
        data: {
          adminId: adminUser.id,
          action: row.action as any,
          targetType: row.targetType as any,
          targetId: row.targetId,
          metadata: row.metadata as any,
          createdAt: pastDate(row.daysAgo),
        },
      });
    }
    console.log(`✅ Audit logs created (${auditRows.length})`);
  }

  // ── 10. Job Alerts ───────────────────────────────────────────────────────────

  const alertsCount = await prisma.jobAlert.count();
  if (alertsCount === 0) {
    await prisma.jobAlert.createMany({
      data: [
        {
          candidateId: candidate.id,
          industries: ['Công nghệ thông tin'],
          locations: ['Hà Nội'],
          jobTypes: ['FULL_TIME', 'CONTRACT'],
          frequency: 'DAILY',
          isActive: true,
        },
        {
          candidateId: candidate.id,
          industries: ['Trí tuệ nhân tạo', 'Fintech'],
          locations: ['Hà Nội', 'TP. Hồ Chí Minh', 'Remote'],
          jobTypes: ['FULL_TIME'],
          frequency: 'WEEKLY',
          isActive: true,
        },
        {
          candidateId: candidate.id,
          industries: ['Công nghệ thông tin'],
          locations: ['Remote'],
          jobTypes: ['FREELANCE', 'PART_TIME'],
          frequency: 'DAILY',
          isActive: false,
          lastSentAt: pastDate(2),
        },
      ],
    });
    console.log('✅ Job alerts created (3)');
  }

  // ── 11. Application Tags ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.application.updateMany({ where: { candidateId: candidate.id,  jobId: tcJobs[0].id,    status: 'REVIEWING' }, data: { tag: 'SHORTLISTED' } }),
    prisma.application.updateMany({ where: { candidateId: candidate.id,  jobId: momoJobs[0].id,  status: 'REVIEWING' }, data: { tag: 'POTENTIAL'  } }),
    prisma.application.updateMany({ where: { candidateId: candidate2.id, jobId: tcJobs[2].id,    status: 'REVIEWING' }, data: { tag: 'POTENTIAL'  } }),
    prisma.application.updateMany({ where: { candidateId: candidate2.id, jobId: fptJobs[5].id,   status: 'REVIEWING' }, data: { tag: 'ON_HOLD'    } }),
    prisma.application.updateMany({ where: { candidateId: candidate3.id, jobId: momoJobs[3].id,  status: 'REVIEWING' }, data: { tag: 'SHORTLISTED' } }),
  ]);
  console.log('✅ Application tags updated');

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Demo accounts (password: Demo@2026)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Admin    → admin@jobhub.vn');
  console.log('  Employer → employer@jobhub.vn  (TechCorp Vietnam)');
  console.log('  Candidate→ candidate@jobhub.vn (Lê Minh Hùng)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
