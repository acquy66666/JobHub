import api from "@/lib/api";

export type CertificateCategory =
  | "LANGUAGE"
  | "IT_CLOUD"
  | "IT_NETWORK"
  | "IT_SECURITY"
  | "IT_DEV"
  | "PROJECT_MGMT"
  | "FINANCE"
  | "MARKETING"
  | "DESIGN"
  | "OTHER";

export type CertificateLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type CandidateCertificateStatus = "PENDING" | "APPROVED" | "REJECTED";

export const CERT_CATEGORY_LABEL: Record<CertificateCategory, string> = {
  LANGUAGE: "Ngoại ngữ",
  IT_CLOUD: "Cloud (AWS/Azure/GCP)",
  IT_NETWORK: "Mạng (Network)",
  IT_SECURITY: "An ninh mạng",
  IT_DEV: "Lập trình & DevOps",
  PROJECT_MGMT: "Quản lý dự án",
  FINANCE: "Tài chính & Kế toán",
  MARKETING: "Marketing",
  DESIGN: "Thiết kế",
  OTHER: "Khác (Pháp lý, Y, Dược...)",
};

export const CERT_CATEGORY_ORDER: CertificateCategory[] = [
  "LANGUAGE",
  "IT_CLOUD",
  "IT_DEV",
  "IT_NETWORK",
  "IT_SECURITY",
  "PROJECT_MGMT",
  "FINANCE",
  "MARKETING",
  "DESIGN",
  "OTHER",
];

export const CERT_LEVEL_LABEL: Record<CertificateLevel, string> = {
  BASIC: "Cơ bản",
  INTERMEDIATE: "Trung cấp",
  ADVANCED: "Nâng cao",
  EXPERT: "Chuyên gia",
};

export const CERT_STATUS_LABEL: Record<CandidateCertificateStatus, string> = {
  PENDING: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  REJECTED: "Bị từ chối",
};

export interface Certificate {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string | null;
  issuer: string;
  category: CertificateCategory;
  level: CertificateLevel | null;
  validityMonths: number | null;
  description: string | null;
}

export interface CandidateCertificate {
  id: string;
  candidateId: string;
  certificateSlug: string;
  certificate: Pick<Certificate, "slug" | "nameVi" | "nameEn" | "issuer" | "category" | "level">;
  fileUrl: string;
  fileName: string;
  fileMime: string;
  issuedDate: string | null;
  expiryDate: string | null;
  score: string | null;
  status: CandidateCertificateStatus;
  adminNote: string | null;
  reviewedAt: string | null;
  uploadedAt: string;
}

export interface AdminCandidateCertificate extends CandidateCertificate {
  candidate: { id: string; fullName: string; user: { email: string } };
}

export const certificatesApi = {
  async search(q: string, category?: CertificateCategory, limit = 20) {
    const { data } = await api.get<Certificate[]>("/certificates/search", { params: { q, category, limit } });
    return data;
  },
  async listByCategory() {
    const { data } = await api.get<Record<CertificateCategory, Certificate[]>>("/certificates/by-category");
    return data;
  },
  async listMine() {
    const { data } = await api.get<CandidateCertificate[]>("/candidate/certificates");
    return data;
  },
  async create(payload: { certificateSlug: string; file: File; issuedDate?: string; expiryDate?: string; score?: string }) {
    const fd = new FormData();
    fd.append("file", payload.file);
    fd.append("certificateSlug", payload.certificateSlug);
    if (payload.issuedDate) fd.append("issuedDate", payload.issuedDate);
    if (payload.expiryDate) fd.append("expiryDate", payload.expiryDate);
    if (payload.score) fd.append("score", payload.score);
    const { data } = await api.post<CandidateCertificate>("/candidate/certificates", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete<{ ok: boolean }>(`/candidate/certificates/${id}`);
    return data;
  },
};

export const adminCertificatesApi = {
  async list(status: CandidateCertificateStatus | "ALL" = "PENDING", page = 1, limit = 20) {
    const { data } = await api.get<{ items: AdminCandidateCertificate[]; total: number; totalPages: number }>(
      "/admin/certificates",
      { params: { status, page, limit } },
    );
    return data;
  },
  async approve(id: string) {
    const { data } = await api.patch<{ ok: boolean }>(`/admin/certificates/${id}/approve`);
    return data;
  },
  async reject(id: string, adminNote: string) {
    const { data } = await api.patch<{ ok: boolean }>(`/admin/certificates/${id}/reject`, { adminNote });
    return data;
  },
};
