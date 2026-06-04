import { ComponentType } from "react";
import { CVData } from "@/lib/cvTypes";

export { Template1Classic } from "./Template1Classic";
export { Template2Sidebar } from "./Template2Sidebar";
export { Template3Minimalist } from "./Template3Minimalist";
export { Template4Creative } from "./Template4Creative";
export { Template5Executive } from "./Template5Executive";
export { Template6Tech } from "./Template6Tech";
export { Template7Vietnamese } from "./Template7Vietnamese";
export { Template8Marketing } from "./Template8Marketing";
export { Template9Academic } from "./Template9Academic";
export { Template10Infographic } from "./Template10Infographic";

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  industries: string[];
  atsScore: "Cao" | "Trung bình" | "Thấp";
  hasAvatar: boolean;
  hasSidebar: boolean;
  accentColor: string;
  component: ComponentType<{ data: CVData }>;
}

import { Template1Classic } from "./Template1Classic";
import { Template2Sidebar } from "./Template2Sidebar";
import { Template3Minimalist } from "./Template3Minimalist";
import { Template4Creative } from "./Template4Creative";
import { Template5Executive } from "./Template5Executive";
import { Template6Tech } from "./Template6Tech";
import { Template7Vietnamese } from "./Template7Vietnamese";
import { Template8Marketing } from "./Template8Marketing";
import { Template9Academic } from "./Template9Academic";
import { Template10Infographic } from "./Template10Infographic";

export const CV_TEMPLATES: TemplateConfig[] = [
  {
    id: "1-classic",
    name: "Classic Professional",
    description: "Mẫu cổ điển ATS-friendly. Phân cấp rõ ràng, đường kẻ ngang sạch sẽ.",
    industries: ["Finance", "Banking", "Law", "Government"],
    atsScore: "Cao",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#2563EB",
    component: Template1Classic,
  },
  {
    id: "2-sidebar",
    name: "Modern Sidebar",
    description: "2 cột — sidebar navy tối với kỹ năng progress bar. Nổi bật và chuyên nghiệp.",
    industries: ["IT", "Marketing", "Design"],
    atsScore: "Trung bình",
    hasAvatar: true,
    hasSidebar: true,
    accentColor: "#1E3A5F",
    component: Template2Sidebar,
  },
  {
    id: "3-minimalist",
    name: "Minimalist Clean",
    description: "Tối giản, nhiều khoảng trống. ATS score cao nhất. Phù hợp apply quốc tế.",
    industries: ["Tech", "Startup", "Remote"],
    atsScore: "Cao",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#0EA5E9",
    component: Template3Minimalist,
  },
  {
    id: "4-creative",
    name: "Creative Portfolio",
    description: "Header gradient tím-xanh JobHub. 2 cột với section Projects nổi bật.",
    industries: ["Design", "Frontend Dev", "Creative"],
    atsScore: "Thấp",
    hasAvatar: true,
    hasSidebar: true,
    accentColor: "#7C3AED",
    component: Template4Creative,
  },
  {
    id: "5-executive",
    name: "Executive Premium",
    description: "Font serif, accent vàng gold. Dành cho quản lý cấp cao và director.",
    industries: ["C-level", "Management", "Finance"],
    atsScore: "Cao",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#D97706",
    component: Template5Executive,
  },
  {
    id: "6-tech",
    name: "Tech / Developer",
    description: "Font monospace, kỹ năng nhóm theo category, Projects ngang tầm Experience.",
    industries: ["Software Dev", "DevOps", "Data Engineer"],
    atsScore: "Cao",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#16A34A",
    component: Template6Tech,
  },
  {
    id: "7-vietnamese",
    name: "Mẫu CV Chuẩn VN",
    description: "Format truyền thống Việt Nam với ảnh 3×4, đầy đủ thông tin cá nhân.",
    industries: ["Doanh nghiệp VN", "Nhà nước", "Kế toán"],
    atsScore: "Cao",
    hasAvatar: true,
    hasSidebar: false,
    accentColor: "#1D4ED8",
    component: Template7Vietnamese,
  },
  {
    id: "8-marketing",
    name: "Marketing Bold",
    description: "Header màu coral đậm, typography mạnh. Nhấn mạnh thành tích bằng số.",
    industries: ["Marketing", "PR", "Brand", "Content"],
    atsScore: "Trung bình",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#F97316",
    component: Template8Marketing,
  },
  {
    id: "9-academic",
    name: "Academic / Research",
    description: "Font serif formal. Có section Publications và Research Interests.",
    industries: ["Research", "Academia", "Data Science"],
    atsScore: "Cao",
    hasAvatar: false,
    hasSidebar: false,
    accentColor: "#064E3B",
    component: Template9Academic,
  },
  {
    id: "10-infographic",
    name: "Infographic Visual",
    description: "Timeline kinh nghiệm, skill bars, stats nổi bật. Sidebar tối sang trọng.",
    industries: ["UX/UI", "Graphic Design", "Creative Dev"],
    atsScore: "Thấp",
    hasAvatar: true,
    hasSidebar: true,
    accentColor: "#7C3AED",
    component: Template10Infographic,
  },
];

export function getTemplateById(id: string): TemplateConfig | undefined {
  return CV_TEMPLATES.find((t) => t.id === id);
}
