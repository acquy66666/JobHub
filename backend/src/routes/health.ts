import { Router } from 'express';
import { sendVerificationEmail } from '../utils/email';
import { env } from '../config/env';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ ok: true, env: env.NODE_ENV, emailConfigured: !!(env.BREVO_SMTP_KEY && env.BREVO_SMTP_USER) });
});

// Test email — chỉ dùng để debug, không expose route này trong production lâu dài
router.post('/health/test-email', async (req, res) => {
  const to = String(req.body?.to || '');
  if (!to || !to.includes('@')) {
    res.status(400).json({ ok: false, message: 'Thiếu field "to" (email)' });
    return;
  }
  try {
    await sendVerificationEmail(to, '123456');
    res.json({ ok: true, message: `Email test gửi đến ${to} thành công` });
  } catch (err) {
    res.status(500).json({ ok: false, message: (err as Error).message });
  }
});

export default router;
