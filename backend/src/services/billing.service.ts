import { prisma } from '../lib/prisma';
import { JobTier, TransactionType } from '../generated/prisma/client';

function err(message: string, status = 400) {
  return Object.assign(new Error(message), { status });
}

export const billingService = {
  async getBalanceByEmployerId(employerId: string) {
    let balance = await prisma.employerCreditBalance.findUnique({ where: { employerId } });
    if (!balance) {
      balance = await prisma.employerCreditBalance.create({
        data: { id: `bal-${employerId}`, employerId, basicCredits: 0, premiumCredits: 0, vipCredits: 0 },
      });
    }
    return balance;
  },

  async getBalanceByUserId(userId: string) {
    const employer = await prisma.employer.findUnique({ where: { userId }, select: { id: true } });
    if (!employer) throw err('Không tìm thấy hồ sơ công ty', 404);
    return this.getBalanceByEmployerId(employer.id);
  },

  async listPackages() {
    return prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: [{ tier: 'asc' }, { sortOrder: 'asc' }, { priceVnd: 'asc' }],
    });
  },

  async listOrders(employerId: string, page = 1, limit = 10, status?: string) {
    const where: { employerId: string; status?: string } = { employerId };
    if (status) where.status = status;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.paymentOrder.findMany({
        where: where as object,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { package: true, coupon: true },
      }),
      prisma.paymentOrder.count({ where: where as object }),
    ]);
    return { orders, total, totalPages: Math.ceil(total / limit) };
  },

  async getOrder(employerId: string, orderId: string) {
    const order = await prisma.paymentOrder.findFirst({
      where: { id: orderId, employerId },
      include: { package: true, coupon: true },
    });
    if (!order) throw err('Không tìm thấy đơn hàng', 404);
    return order;
  },

  async listTransactions(employerId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [txns, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: { employerId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.creditTransaction.count({ where: { employerId } }),
    ]);
    return { transactions: txns, total, totalPages: Math.ceil(total / limit) };
  },

  // Admin
  async listAllOrders(page = 1, limit = 20, filters: { status?: string; provider?: string; employerId?: string } = {}) {
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    if (filters.provider) where.provider = filters.provider;
    if (filters.employerId) where.employerId = filters.employerId;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      prisma.paymentOrder.findMany({
        where: where as object,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: { package: true, coupon: true, employer: { select: { id: true, companyName: true } } },
      }),
      prisma.paymentOrder.count({ where: where as object }),
    ]);
    return { orders, total, totalPages: Math.ceil(total / limit) };
  },

  async revenueStats() {
    const rows = await prisma.$queryRawUnsafe<Array<{ month: string; revenue: bigint; orders: bigint }>>(
      `SELECT to_char(date_trunc('month', "paidAt"), 'YYYY-MM') AS month,
              SUM("amountNet")::bigint AS revenue,
              COUNT(*)::bigint AS orders
       FROM "PaymentOrder"
       WHERE status = 'SUCCESS' AND "paidAt" IS NOT NULL
       GROUP BY 1 ORDER BY 1 DESC LIMIT 12`,
    );
    const byProvider = await prisma.$queryRawUnsafe<Array<{ provider: string; revenue: bigint; orders: bigint }>>(
      `SELECT provider::text AS provider,
              SUM("amountNet")::bigint AS revenue,
              COUNT(*)::bigint AS orders
       FROM "PaymentOrder"
       WHERE status = 'SUCCESS'
       GROUP BY 1`,
    );
    return {
      monthly: rows.map((r) => ({ month: r.month, revenue: Number(r.revenue), orders: Number(r.orders) })),
      byProvider: byProvider.map((r) => ({ provider: r.provider, revenue: Number(r.revenue), orders: Number(r.orders) })),
    };
  },

  async adminGrantCredits(
    employerId: string,
    tier: JobTier,
    amount: number,
    note: string,
    adminUserId: string,
  ) {
    if (amount === 0) throw err('Số lượng credits phải khác 0');
    const balance = await this.getBalanceByEmployerId(employerId);
    const field = tier === 'BASIC' ? 'basicCredits' : tier === 'PREMIUM' ? 'premiumCredits' : 'vipCredits';
    const newValue = balance[field] + amount;
    if (newValue < 0) throw err('Số dư không đủ');
    return prisma.$transaction(async (tx) => {
      const updated = await tx.employerCreditBalance.update({
        where: { id: balance.id },
        data: { [field]: newValue },
      });
      await tx.creditTransaction.create({
        data: {
          id: `txn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          employerId,
          type: TransactionType.ADMIN_GRANT,
          tier,
          delta: amount,
          balanceAfter: newValue,
          adminUserId,
          note,
        },
      });
      return updated;
    });
  },
};
