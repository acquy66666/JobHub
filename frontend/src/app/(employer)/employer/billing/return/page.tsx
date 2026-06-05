"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ReturnInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const orderId = params.get("orderId");
    if (orderId) {
      router.replace(`/employer/billing/orders/${orderId}`);
    } else {
      router.replace("/employer/billing");
    }
  }, [params, router]);

  return (
    <div className="max-w-md mx-auto p-8 text-center">
      <p className="text-t1 text-[14px]">Đang chuyển hướng về đơn hàng…</p>
    </div>
  );
}

export default function ReturnPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-t1">Đang xử lý…</div>}>
      <ReturnInner />
    </Suspense>
  );
}
