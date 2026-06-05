import crypto from 'crypto';
import { env } from '../config/env';

function sortObject(obj: Record<string, string>): Record<string, string> {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();
  for (const k of keys) {
    sorted[k] = obj[k];
  }
  return sorted;
}

function encode(v: string): string {
  return encodeURIComponent(v).replace(/%20/g, '+');
}

function buildQueryString(params: Record<string, string>): string {
  return Object.keys(params)
    .map((k) => `${encode(k)}=${encode(params[k])}`)
    .join('&');
}

function formatDate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getFullYear().toString() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

export interface VnpayOrderInput {
  orderId: string;
  amountVnd: number;
  orderInfo: string;
  ipAddr: string;
  expiresAt: Date;
}

export function buildPaymentUrl(input: VnpayOrderInput): { payUrl: string; txnRef: string } {
  const createDate = formatDate(new Date());
  const expireDate = formatDate(input.expiresAt);
  const params: Record<string, string> = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode: env.VNPAY_TMN_CODE,
    vnp_Amount: String(input.amountVnd * 100),
    vnp_CurrCode: 'VND',
    vnp_TxnRef: input.orderId,
    vnp_OrderInfo: input.orderInfo,
    vnp_OrderType: 'billpayment',
    vnp_Locale: 'vn',
    vnp_ReturnUrl: env.VNPAY_RETURN_URL,
    vnp_IpAddr: input.ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };
  const sorted = sortObject(params);
  const signData = buildQueryString(sorted);
  const hmac = crypto.createHmac('sha512', env.VNPAY_HASH_SECRET);
  const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  const payUrl = `${env.VNPAY_URL}?${signData}&vnp_SecureHash=${signature}`;
  return { payUrl, txnRef: input.orderId };
}

export interface VnpayVerifyResult {
  valid: boolean;
  txnRef: string;
  amount: number;
  responseCode: string;
  raw: Record<string, string>;
}

export function verifyResponse(query: Record<string, string>): VnpayVerifyResult {
  const data = { ...query };
  const incomingHash = data['vnp_SecureHash'] || '';
  delete data['vnp_SecureHash'];
  delete data['vnp_SecureHashType'];
  const sorted = sortObject(data);
  const signData = buildQueryString(sorted);
  const hmac = crypto.createHmac('sha512', env.VNPAY_HASH_SECRET);
  const signature = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
  const valid =
    incomingHash.length > 0 &&
    incomingHash.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(incomingHash, 'hex'), Buffer.from(signature, 'hex'));
  return {
    valid,
    txnRef: data['vnp_TxnRef'] || '',
    amount: Math.floor(Number(data['vnp_Amount'] || '0') / 100),
    responseCode: data['vnp_ResponseCode'] || '',
    raw: query,
  };
}
