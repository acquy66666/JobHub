export interface CVExperience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

export interface CVEducation {
  school: string;
  degree: string;
  major: string;
  startYear: number;
  endYear: number;
}

export interface CVLanguage {
  name: string;
  level: string;
}

export interface CVCertification {
  name: string;
  issuer: string;
  year: number;
}

export interface CVProject {
  name: string;
  description: string;
  techStack: string[];
  link: string;
}

export interface CVPublication {
  title: string;
  journal: string;
  year: number;
  authors: string;
}

export interface CVData {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  avatarUrl: string;
  summary: string;
  experiences: CVExperience[];
  educations: CVEducation[];
  skills: string[];
  languages: CVLanguage[];
  certifications: CVCertification[];
  projects: CVProject[];
  dateOfBirth: string;
  gender: string;
  publications: CVPublication[];
  awards: string[];
}

export const EMPTY_CV_DATA: CVData = {
  fullName: '',
  title: '',
  email: '',
  phone: '',
  location: '',
  website: '',
  linkedin: '',
  github: '',
  avatarUrl: '',
  summary: '',
  experiences: [],
  educations: [],
  skills: [],
  languages: [],
  certifications: [],
  projects: [],
  dateOfBirth: '',
  gender: '',
  publications: [],
  awards: [],
};

export const SAMPLE_CV_DATA: CVData = {
  fullName: 'Nguyễn Văn An',
  title: 'Senior Frontend Developer',
  email: 'nguyen.van.an@email.com',
  phone: '0901 234 567',
  location: 'TP. Hồ Chí Minh',
  website: 'nguyenvanan.dev',
  linkedin: 'linkedin.com/in/nguyenvanan',
  github: 'github.com/nguyenvanan',
  avatarUrl: '',
  summary:
    'Frontend Developer với 5 năm kinh nghiệm xây dựng ứng dụng web hiệu năng cao. Thành thạo React, TypeScript và các công nghệ hiện đại. Đam mê tạo ra trải nghiệm người dùng xuất sắc và code sạch, dễ bảo trì.',
  experiences: [
    {
      company: 'TechCorp Vietnam',
      position: 'Senior Frontend Developer',
      startDate: '2022-03',
      endDate: '',
      isCurrent: true,
      description:
        'Dẫn dắt team 4 người phát triển dashboard analytics cho 50.000+ người dùng. Tối ưu performance giảm 60% thời gian tải trang. Triển khai design system dùng chung cho toàn bộ sản phẩm.',
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      startDate: '2020-06',
      endDate: '2022-02',
      isCurrent: false,
      description:
        'Xây dựng SPA e-commerce với React và Redux. Tích hợp payment gateway (VNPay, MoMo). Tăng conversion rate 25% thông qua A/B testing và UX improvements.',
    },
    {
      company: 'Digital Agency ABC',
      position: 'Junior Developer',
      startDate: '2019-01',
      endDate: '2020-05',
      isCurrent: false,
      description:
        'Phát triển website cho các doanh nghiệp vừa và nhỏ. Làm việc với HTML, CSS, JavaScript và WordPress.',
    },
  ],
  educations: [
    {
      school: 'Đại học Bách Khoa TP.HCM',
      degree: 'Kỹ sư',
      major: 'Khoa học Máy tính',
      startYear: 2015,
      endYear: 2019,
    },
  ],
  skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Docker', 'Git'],
  languages: [
    { name: 'Tiếng Việt', level: 'Bản ngữ' },
    { name: 'Tiếng Anh', level: 'B2 (IELTS 6.5)' },
  ],
  certifications: [
    { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: 2023 },
    { name: 'Google UX Design Certificate', issuer: 'Google', year: 2022 },
  ],
  projects: [
    {
      name: 'JobHub Platform',
      description: 'Website tuyển dụng full-stack với 3 nhóm người dùng, JWT auth, và deploy production.',
      techStack: ['Next.js', 'Express', 'PostgreSQL', 'Prisma'],
      link: 'github.com/nguyenvanan/jobhub',
    },
    {
      name: 'E-commerce Dashboard',
      description: 'Admin dashboard real-time analytics với Recharts và TanStack Query.',
      techStack: ['React', 'TypeScript', 'Recharts', 'TanStack Query'],
      link: 'github.com/nguyenvanan/ecommerce-dash',
    },
  ],
  dateOfBirth: '15/08/1997',
  gender: 'Nam',
  publications: [],
  awards: ['Giải Nhất Hackathon TP.HCM 2023', 'Học bổng Xuất sắc Đại học Bách Khoa 2018'],
};
