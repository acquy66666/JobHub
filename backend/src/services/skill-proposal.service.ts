import { prisma } from '../lib/prisma';
import { Role, SkillCategory, SkillProposalStatus, NotificationType } from '../generated/prisma/client';

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function err(message: string, status: number, code?: string) {
  return Object.assign(new Error(message), { status, code });
}

export const skillProposalService = {
  async create(userId: string, role: Role, data: { name: string; nameEn?: string; category: SkillCategory; reason?: string }) {
    const name = data.name.trim();
    if (name.length < 2) throw err('Tên kỹ năng quá ngắn', 400);
    const slug = slugify(name);
    if (!slug) throw err('Tên kỹ năng không hợp lệ', 400);

    const existingSkill = await prisma.skill.findFirst({
      where: { OR: [{ slug }, { nameVi: { equals: name, mode: 'insensitive' } }] },
      select: { id: true, nameVi: true },
    });
    if (existingSkill) {
      throw err(`Kỹ năng "${existingSkill.nameVi}" đã tồn tại trong hệ thống`, 409, 'SKILL_EXISTS');
    }

    const dupPending = await prisma.skillProposal.findFirst({
      where: { proposedById: userId, name: { equals: name, mode: 'insensitive' }, status: 'PENDING' },
      select: { id: true },
    });
    if (dupPending) {
      throw err('Bạn đã đề xuất kỹ năng này và đang chờ duyệt', 409, 'PROPOSAL_PENDING');
    }

    return prisma.skillProposal.create({
      data: {
        proposedById: userId,
        proposedByRole: role,
        name,
        nameEn: data.nameEn?.trim() || null,
        category: data.category,
        reason: data.reason?.trim() || null,
      },
    });
  },

  async listMine(userId: string) {
    return prisma.skillProposal.findMany({
      where: { proposedById: userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async listForAdmin(status: SkillProposalStatus | undefined, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [items, total] = await Promise.all([
      prisma.skillProposal.findMany({
        where,
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.skillProposal.count({ where }),
    ]);
    const userIds = Array.from(new Set(items.map((p) => p.proposedById)));
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, role: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    return {
      items: items.map((p) => ({ ...p, proposer: userMap.get(p.proposedById) ?? null })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async approve(proposalId: string, adminUserId: string, adminNote?: string) {
    const proposal = await prisma.skillProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw err('Không tìm thấy đề xuất', 404);
    if (proposal.status !== 'PENDING') throw err('Đề xuất đã được xử lý', 400);

    const slug = slugify(proposal.name);
    const slugTaken = await prisma.skill.findUnique({ where: { slug }, select: { id: true } });
    if (slugTaken) throw err('Slug đã tồn tại — kỹ năng có thể đã được tạo trước đó', 409, 'SKILL_EXISTS');

    return prisma.$transaction(async (tx) => {
      const newSkill = await tx.skill.create({
        data: {
          slug,
          nameVi: proposal.name,
          nameEn: proposal.nameEn,
          category: proposal.category,
          aliases: [],
        },
      });
      const updated = await tx.skillProposal.update({
        where: { id: proposalId },
        data: {
          status: 'APPROVED',
          adminNote: adminNote?.trim() || null,
          resolvedById: adminUserId,
          resolvedAt: new Date(),
          createdSkillId: newSkill.id,
        },
      });
      await tx.notification.create({
        data: {
          userId: proposal.proposedById,
          type: NotificationType.SKILL_PROPOSAL_APPROVED,
          title: 'Đề xuất kỹ năng được duyệt',
          message: `Kỹ năng "${proposal.name}" đã được thêm vào ngân hàng kỹ năng.`,
          link: '/candidate/skills/propose',
          metadata: { proposalId, skillId: newSkill.id, skillSlug: newSkill.slug },
        },
      });
      return { proposal: updated, skill: newSkill };
    });
  },

  async reject(proposalId: string, adminUserId: string, adminNote: string) {
    if (!adminNote || !adminNote.trim()) throw err('Cần ghi lý do từ chối', 400);
    const proposal = await prisma.skillProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw err('Không tìm thấy đề xuất', 404);
    if (proposal.status !== 'PENDING') throw err('Đề xuất đã được xử lý', 400);

    return prisma.$transaction(async (tx) => {
      const updated = await tx.skillProposal.update({
        where: { id: proposalId },
        data: {
          status: 'REJECTED',
          adminNote: adminNote.trim(),
          resolvedById: adminUserId,
          resolvedAt: new Date(),
        },
      });
      await tx.notification.create({
        data: {
          userId: proposal.proposedById,
          type: NotificationType.SKILL_PROPOSAL_REJECTED,
          title: 'Đề xuất kỹ năng bị từ chối',
          message: `Kỹ năng "${proposal.name}" không được duyệt. Lý do: ${adminNote.trim()}`,
          link: proposal.proposedByRole === 'EMPLOYER' ? '/employer/skills/propose' : '/candidate/skills/propose',
          metadata: { proposalId },
        },
      });
      return updated;
    });
  },
};
