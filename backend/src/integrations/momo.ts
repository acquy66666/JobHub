import crypto from 'crypto';
import https from 'https';
import { env } from '../config/env';

export interface MomoOrderInput {
  orderId: string;
  amountVnd: number;
  orderInfo: string;
}

export interface MomoCreateResult {
  payUrl: string;
  qrCodeUrl: string;
  deeplink: string;
  raw: Record<string, unknown>;
}

function hmacSha256(secret: string, raw: string): string {
  return crypto.createHmac('sha256', secret).update(raw).digest('hex');
}

export async function createPayment(input: MomoOrderInput): Promise<MomoCreateResult> {
  const requestId = `${input.orderId}-${Date.now()}`;
  const extraData = '';
  const requestType = 'captureWallet';
  const rawSignature =
    `accessKey=${env.MOMO_ACCESS_KEY}` +
    `&amount=${input.amountVnd}` +
    `&extraData=${extraData}` +
    `&ipnUrl=${env.MOMO_IPN_URL}` +
    `&orderId=${input.orderId}` +
    `&orderInfo=${input.orderInfo}` +
    `&partnerCode=${env.MOMO_PARTNER_CODE}` +
    `&redirectUrl=${env.MOMO_REDIRECT_URL}` +
    `&requestId=${requestId}` +
    `&requestType=${requestType}`;
  const signature = hmacSha256(env.MOMO_SECRET_KEY, rawSignature);

  const body = JSON.stringify({
    partnerCode: env.MOMO_PARTNER_CODE,
    accessKey: env.MOMO_ACCESS_KEY,
    requestId,
    amount: String(input.amountVnd),
    orderId: input.orderId,
    orderInfo: input.orderInfo,
    redirectUrl: env.MOMO_REDIRECT_URL,
    ipnUrl: env.MOMO_IPN_URL,
    extraData,
    requestType,
    signature,
    lang: 'vi',
  });

  // If sandbox creds missing, return placeholder for dev/demo
  if (!env.MOMO_PARTNER_CODE || !env.MOMO_SECRET_KEY) {
    const fake = `https://test-payment.momo.vn/pay/placeholder?orderId=${input.orderId}`;
    return {
      payUrl: fake,
      qrCodeUrl: fake,
      deeplink: fake,
      raw: { placeholder: true, reason: 'MoMo sandbox env vars not configured' },
    };
  }

  const url = new URL(env.MOMO_ENDPOINT);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const json = JSON.parse(data) as Record<string, unknown>;
            resolve({
              payUrl: String(json.payUrl || ''),
              qrCodeUrl: String(json.qrCodeUrl || json.payUrl || ''),
              deeplink: String(json.deeplink || ''),
              raw: json,
            });
          } catch (e) {
            reject(new Error(`MoMo invalid JSON: ${data}`));
          }
        });
      },
    );
    req.on('error', reject);
    req.setTimeout(15000, () => req.destroy(new Error('MoMo timeout')));
    req.write(body);
    req.end();
  });
}

export interface MomoVerifyResult {
  valid: boolean;
  orderId: string;
  amount: number;
  resultCode: number;
  raw: Record<string, unknown>;
}

export function verifyIpn(body: Record<string, unknown>): MomoVerifyResult {
  const incomingSig = String(body.signature || '');
  const rawSignature =
    `accessKey=${env.MOMO_ACCESS_KEY}` +
    `&amount=${body.amount ?? ''}` +
    `&extraData=${body.extraData ?? ''}` +
    `&message=${body.message ?? ''}` +
    `&orderId=${body.orderId ?? ''}` +
    `&orderInfo=${body.orderInfo ?? ''}` +
    `&orderType=${body.orderType ?? ''}` +
    `&partnerCode=${body.partnerCode ?? ''}` +
    `&payType=${body.payType ?? ''}` +
    `&requestId=${body.requestId ?? ''}` +
    `&responseTime=${body.responseTime ?? ''}` +
    `&resultCode=${body.resultCode ?? ''}` +
    `&transId=${body.transId ?? ''}`;
  const expected = hmacSha256(env.MOMO_SECRET_KEY, rawSignature);
  const valid =
    incomingSig.length > 0 &&
    incomingSig.length === expected.length &&
    crypto.timingSafeEqual(Buffer.from(incomingSig, 'hex'), Buffer.from(expected, 'hex'));
  return {
    valid,
    orderId: String(body.orderId || ''),
    amount: Number(body.amount || 0),
    resultCode: Number(body.resultCode || -1),
    raw: body,
  };
}
