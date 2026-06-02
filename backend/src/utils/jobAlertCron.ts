import cron from 'node-cron';
import { prisma } from '../lib/prisma';
import https from 'https';
import { env } from '../config/env';

async function sendJobAlertEmail(to: string, candidateName: string, jobs: { title: string; location: string; employer: { companyName: string } }[]) {
  if (!env.BREVO_API_KEY || !env.BREVO_SENDER_EMAIL) return;

  const jobRows = jobs
    .map(j => `<li><strong>${j.title}</strong> — ${j.employer.companyName}, ${j.location}</li>`)
    .join('');

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:0 auto">
      <h2 style="color:#7C3AED">Việc làm mới phù hợp với bạn — JobHub</h2>
      <p>Xin chào <strong>${candidateName}</strong>,</p>
      <p>Có <strong>${jobs.length}</strong> việc làm mới khớp với tiêu chí của bạn hôm nay:</p>
      <ul style="line-height:2">${jobRows}</ul>
      <p><a href="${env.CLIENT_URL}/jobs" style="color:#7C3AED">Xem tất cả việc làm →</a></p>
      <p style="color:#999;font-size:12px">Để hủy đăng ký nhận thông báo, vào phần Cài đặt → Thông báo việc làm trong tài khoản của bạn.</p>
    </div>`;

  const body = JSON.stringify({
    sender: { name: 'JobHub', email: env.BREVO_SENDER_EMAIL },
    to: [{ email: to }],
    subject: `${jobs.length} việc làm mới hôm nay — JobHub`,
    htmlContent: html,
  });

  return new Promise<void>((resolve) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.BREVO_API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      res.resume();
      res.on('end', resolve);
    });
    req.on('error', (e) => console.error('[JobAlert cron] Email error:', e.message));
    req.setTimeout(15000, () => req.destroy());
    req.write(body);
    req.end();
  });
}

async function runJobAlerts() {
  console.log('[JobAlert cron] Starting daily job alert run...');
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const alerts = await prisma.jobAlert.findMany({
    where: { isActive: true },
    include: {
      candidate: {
        select: {
          fullName: true,
          user: { select: { email: true } },
        },
      },
    },
  });

  let sent = 0;
  for (const alert of alerts) {
    const where: Record<string, unknown> = {
      status: 'ACTIVE',
      createdAt: { gte: since },
    };
    if (alert.industries.length > 0) where.industry = { in: alert.industries };
    if (alert.locations.length > 0) where.location = { in: alert.locations };
    if (alert.jobTypes.length > 0) where.jobType = { in: alert.jobTypes };

    const jobs = await prisma.job.findMany({
      where,
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        title: true,
        location: true,
        employer: { select: { companyName: true } },
      },
    });

    if (jobs.length === 0) continue;

    await sendJobAlertEmail(
      alert.candidate.user.email,
      alert.candidate.fullName,
      jobs,
    );

    await prisma.jobAlert.update({
      where: { id: alert.id },
      data: { lastSentAt: new Date() },
    });

    sent++;
  }

  console.log(`[JobAlert cron] Done — sent ${sent} alerts out of ${alerts.length} active.`);
}

export function startJobAlertCron() {
  // Chạy 8h sáng mỗi ngày (giờ Việt Nam = UTC+7 → 1:00 UTC)
  cron.schedule('0 1 * * *', () => {
    runJobAlerts().catch((e) => console.error('[JobAlert cron] Error:', e));
  });
  console.log('[JobAlert cron] Scheduled — runs daily at 08:00 ICT');
}
