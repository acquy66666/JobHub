"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { billingApi, CreditPackage, CouponPreview, PaymentProvider, TIER_META, formatVnd } from "@/lib/api/billing";
import { useToast } from "@/store/toastStore";

interface Props {
  pkg: CreditPackage | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CheckoutModal({ pkg, isOpen, onClose }: Props) {
  const router = useRouter();
  const toast = useToast();
  const [provider, setProvider] = useState<PaymentProvider>("VNPAY");
  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProvider("VNPAY");
      setCouponCode("");
      setCouponPreview(null);
      setCouponError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!pkg) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    const code = couponCode.trim();
    if (!code) {
      setCouponPreview(null);
      setCouponError(null);
      return;
    }
    setValidating(true);
    debounceRef.current = window.setTimeout(async () => {
      try {
        const res = await billingApi.validateCoupon(code, pkg.id);
        setCouponPreview(res);
        setCouponError(null);
      } catch (err) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Mã không hợp lệ";
        setCouponError(msg);
        setCouponPreview(null);
      } finally {
        setValidating(false);
      }
    }, 500);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [couponCode, pkg]);

  if (!pkg) return null;

  const meta = TIER_META[pkg.tier];
  const priceGross = pkg.priceVnd;
  const discount = couponPreview?.discountAmount ?? 0;
  const priceNet = couponPreview?.priceNet ?? priceGross;
  const bonusCredits = couponPreview?.bonusCredits ?? 0;

  async function handleConfirm() {
    if (!pkg) return;
    setSubmitting(true);
    try {
      const order = await billingApi.createOrder({
        packageId: pkg.id,
        couponCode: couponCode.trim() || undefined,
        provider,
      });
      toast.success("Đã tạo đơn hàng — chuyển sang trang thanh toán");
      onClose();
      router.push(`/employer/billing/orders/${order.id}`);
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Không tạo được đơn hàng";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="checkout-title"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-bg-1 border border-border-dark rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-t2 mb-1">Thanh toán</p>
                <h2 id="checkout-title" className="text-[18px] font-bold text-t0">
                  {pkg.name}
                </h2>
                <p className={`text-[12px] mt-0.5 ${meta.text}`}>
                  {pkg.creditAmount} credits {meta.label}
                  {pkg.bonusCredits > 0 ? ` + ${pkg.bonusCredits} bonus` : ""}
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng"
                className="text-t2 hover:text-t0 p-1"
              >
                ✕
              </button>
            </div>

            {/* Provider */}
            <div className="mb-4">
              <p className="text-[12px] font-semibold text-t1 mb-2">Phương thức thanh toán</p>
              <div className="grid grid-cols-2 gap-2">
                {(["VNPAY", "MOMO"] as PaymentProvider[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`px-3 py-3 rounded-xl border text-[13px] font-semibold transition-colors ${
                      provider === p
                        ? "border-primary bg-[rgba(124,58,237,.12)] text-t0"
                        : "border-border-dark text-t1 hover:bg-bg-3"
                    }`}
                  >
                    {p === "VNPAY" ? "🏦 VNPay" : "💗 MoMo"}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="mb-4">
              <label className="text-[12px] font-semibold text-t1 mb-2 block">
                Mã khuyến mãi (tùy chọn)
              </label>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="vd: WELCOME"
                className="w-full px-3 py-2 rounded-xl bg-bg-2 border border-border-dark text-[13px] text-t0 focus:border-primary focus:outline-none"
              />
              {validating && <p className="text-[11px] text-t2 mt-1">Đang kiểm tra…</p>}
              {couponError && <p className="text-[11px] text-red-400 mt-1">{couponError}</p>}
              {couponPreview && (
                <p className="text-[11px] text-green-400 mt-1">
                  ✓ {couponPreview.code}
                  {discount > 0 ? ` — giảm ${formatVnd(discount)}` : ""}
                  {bonusCredits > 0 ? ` + ${bonusCredits} bonus` : ""}
                </p>
              )}
            </div>

            {/* Summary */}
            <div className="mb-5 p-4 rounded-xl bg-bg-2 border border-border-dark space-y-1.5 text-[13px]">
              <div className="flex justify-between text-t1">
                <span>Tạm tính</span>
                <span className={discount > 0 ? "line-through text-t2" : "text-t0"}>
                  {formatVnd(priceGross)}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Giảm giá</span>
                  <span>-{formatVnd(discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-t0 pt-1.5 border-t border-border-dark">
                <span>Tổng cộng</span>
                <span className="text-purple-300">{formatVnd(priceNet)}</span>
              </div>
            </div>

            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-brand-gradient text-white font-bold text-[14px] disabled:opacity-50 transition-opacity"
            >
              {submitting ? "Đang xử lý…" : `Thanh toán ${formatVnd(priceNet)}`}
            </button>
            <p className="text-[10px] text-t2 mt-2 text-center">
              Bạn sẽ được chuyển sang trang quét QR sau khi tạo đơn.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
