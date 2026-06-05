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

  async revenueStats(opts: { granularity?: 'day' | 'week' | 'month' | 'year'; from?: Date; to?: Date } = {}) {
    const granularity = opts.granularity ?? 'month';
    const truncFmt: Record<string, string> = {
      day: 'YYYY-MM-DD',
      week: 'IYYY-"W"IW',
      month: 'YYYY-MM',
      year: 'YYYY',
    };
    const fmt = truncFmt[granularity];
    const from = opts.from ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const to = opts.to ?? new Date();
    const rows = await prisma.$queryRawUnsafe<Array<{ bucket: string; revenue: bigint; orders: bigint }>>(
      `SELECT to_char(date_trunc($1, "paidAt"), $2) AS bucket,
              SUM("amountNet")::bigint AS revenue,
              COUNT(*)::bigint AS orders
       FROM "PaymentOrder"
       WHERE status = 'SUCCESS' AND "paidAt" IS NOT NULL
         AND "paidAt" >= $3 AND "paidAt" <= $4
       GROUP BY 1 ORDER BY 1 ASC`,
      granularity,
      fmt,
      from,
      to,
    );
    const byProvider = await prisma.$queryRawUnsafe<Array<{ provider: string; revenue: bigint; orders: bigint }>>(
      `SELECT provider::text AS provider,
              SUM("amountNet")::bigint AS revenue,
              COUNT(*)::bigint AS orders
       FROM "PaymentOrder"
       WHERE status = 'SUCCESS' AND "paidAt" >= $1 AND "paidAt" <= $2
       GROUP BY 1`,
      from,
      to,
    );
    const totals = await prisma.$queryRawUnsafe<Array<{ revenue: bigint; orders: bigint; avg: number | null }>>(
      `SELECT COALESCE(SUM("amountNet"),0)::bigint AS revenue,
              COUNT(*)::bigint AS orders,
              CASE WHEN COUNT(*) > 0 THEN AVG("amountNet")::float ELSE 0 END AS avg
       FROM "PaymentOrder"
       WHERE status = 'SUCCESS' AND "paidAt" >= $1 AND "paidAt" <= $2`,
      from,
      to,
    );
    const pendingCount = await prisma.paymentOrder.count({ where: { status: 'PENDING' } });
    const t = totals[0] ?? { revenue: BigInt(0), orders: BigInt(0), avg: 0 };
    return {
      granularity,
      from: from.toISOString(),
      to: to.toISOString(),
      series: rows.map((r) => ({ bucket: r.bucket, revenue: Number(r.revenue), orders: Number(r.orders) })),
      byProvider: byProvider.map((r) => ({ provider: r.provider, revenue: Number(r.revenue), orders: Number(r.orders) })),
      summary: {
        totalRevenue: Number(t.revenue),
        successOrders: Number(t.orders),
        pendingOrders: pendingCount,
        avgOrderValue: Math.round(Number(t.avg) || 0),
      },
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
