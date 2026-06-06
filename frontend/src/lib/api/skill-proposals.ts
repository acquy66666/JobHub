import api from "@/lib/api";
import type { SkillCategory } from "@/lib/api/skills";

export type SkillProposalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SkillProposal {
  id: string;
  proposedById: string;
  proposedByRole: "CANDIDATE" | "EMPLOYER" | "ADMIN";
  name: string;
  nameEn: string | null;
  category: SkillCategory;
  reason: string | null;
  status: SkillProposalStatus;
  adminNote: string | null;
  createdSkillId: string | null;
  createdAt: string;
  updatedAt: string;
  proposer?: { id: string; email: string; role: string } | null;
}

export interface ProposalListResponse {
  items: SkillProposal[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const skillProposalsApi = {
  async create(body: { name: string; nameEn?: string; category: SkillCategory; reason?: string }) {
    const { data } = await api.post<SkillProposal>("/skill-proposals", body);
    return data;
  },
  async listMine() {
    const { data } = await api.get<SkillProposal[]>("/skill-proposals/mine");
    return data;
  },
  async listAdmin(params: { status?: SkillProposalStatus; page?: number; limit?: number }) {
    const { data } = await api.get<ProposalListResponse>("/skill-proposals/admin", { params });
    return data;
  },
  async approve(id: string, adminNote?: string) {
    const { data } = await api.patch(`/skill-proposals/admin/${id}/approve`, { adminNote });
    return data;
  },
  async reject(id: string, adminNote: string) {
    const { data } = await api.patch(`/skill-proposals/admin/${id}/reject`, { adminNote });
    return data;
  },
};
