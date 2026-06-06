import api from "@/lib/api";

export type SkillCategory =
  | "IT"
  | "SU_PHAM"
  | "KINH_TE"
  | "Y_TE"
  | "MARKETING"
  | "KY_THUAT"
  | "THIET_KE"
  | "NGON_NGU"
  | "KY_NANG_MEM"
  | "KHAC";

export const CATEGORY_LABEL: Record<SkillCategory, string> = {
  IT: "Công nghệ thông tin",
  KY_THUAT: "Kỹ thuật & Sản xuất",
  KINH_TE: "Kinh tế & Tài chính",
  MARKETING: "Marketing & Sales",
  Y_TE: "Y tế & Dược",
  SU_PHAM: "Sư phạm & Giáo dục",
  THIET_KE: "Thiết kế & Sáng tạo",
  NGON_NGU: "Ngôn ngữ",
  KY_NANG_MEM: "Kỹ năng mềm",
  KHAC: "Khác",
};

export const CATEGORY_ORDER: SkillCategory[] = [
  "IT",
  "KY_THUAT",
  "KINH_TE",
  "MARKETING",
  "Y_TE",
  "SU_PHAM",
  "THIET_KE",
  "NGON_NGU",
  "KY_NANG_MEM",
  "KHAC",
];

export interface Skill {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string | null;
  category: SkillCategory;
  aliases: string[];
  jobCount: number;
  trending30d: number;
}

export const skillsApi = {
  async listByCategory() {
    const { data } = await api.get<Record<SkillCategory, Skill[]>>("/skills/by-category");
    return data;
  },
  async search(q: string, category?: SkillCategory, limit = 20) {
    const { data } = await api.get<Skill[]>("/skills/search", { params: { q, category, limit } });
    return data;
  },
};
