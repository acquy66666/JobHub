import { Router, Request, Response } from 'express';
import { verifyResponse as vnpayVerify } from '../integrations/vnpay';
import { verifyIpn as momoVerifyIpn } from '../integrations/momo';
import { paymentService } from '../services/payment.service';
import { env } from '../config/env';

const router = Router();

// VNPay return → redirect FE with order status
router.get('/vnpay/return', async (req: Request, res: Response) => {
  const query = req.query as Record<string, string>;
  const v = vnpayVerify(query);
  const status = v.valid && v.responseCode === '00' ? 'success' : 'failed';
  res.redirect(`${env.CLIENT_URL}/employer/billing/return?orderId=${v.txnRef}&status=${status}`);
});

// VNPay IPN (server-to-server) — must respond with their schema
router.get('/vnpay/ipn', async (req: Request, res: Response) => {
  try {
    const query = req.query as Record<string, string>;
    const v = vnpayVerify(query);
    if (!v.valid) {
      res.json({ RspCode: '97', Message: 'Invalid signature' });
      return;
    }
    if (!v.txnRef) {
      res.json({ RspCode: '01', Message: 'Order not found' });
      return;
    }
    if (v.responseCode === '00') {
      const r = await paymentService.markPaid(v.txnRef, v.raw as Record<string, unknown>, v.responseCode);
      res.json({
        RspCode: '00',
        Message: r.alreadyProcessed ? 'Already confirmed' : 'Confirm Success',
      });
    } else {
      await paymentService.markFailed(v.txnRef, v.raw as Record<string, unknown>, v.responseCode);
      res.json({ RspCode: '00', Message: 'Confirm Received (failed)' });
    }
  } catch (e) {
    console.error('[vnpay/ipn]', e);
    res.json({ RspCode: '99', Message: 'Unknown error' });
  }
});

// MoMo IPN — POST JSON
router.post('/momo/ipn', async (req: Request, res: Response) => {
  try {
    const body = req.body as Record<string, unknown>;
    const v = momoVerifyIpn(body);
    if (!v.valid) {
      res.status(400).json({ message: 'Invalid signature' });
      return;
    }
    if (v.resultCode === 0) {
      await paymentService.markPaid(v.orderId, body, String(v.resultCode));
    } else {
      await paymentService.markFailed(v.orderId, body, String(v.resultCode));
    }
    res.status(204).end();
  } catch (e) {
    console.error('[momo/ipn]', e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual ack route — for sandbox-less smoke test. Enabled by default; set ENABLE_DEV_MARK_PAID=false to disable
// once real VNPay/MoMo sandbox keys are wired.
if (process.env.ENABLE_DEV_MARK_PAID !== 'false') {
  router.post('/dev/mark-paid', async (req: Request, res: Response) => {
    try {
      const { orderId } = req.body as { orderId: string };
      if (!orderId) {
        res.status(400).json({ message: 'orderId required' });
        return;
      }
      const r = await paymentService.markPaid(orderId, { dev: true }, 'DEV-OK');
      res.json(r);
    } catch (e) {
      console.error('[dev/mark-paid]', e);
      res.status(500).json({ message: (e as Error).message });
    }
  });
}

export default router;
