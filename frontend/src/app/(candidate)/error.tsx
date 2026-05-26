"use client";

import { useEffect } from "react";

export default function CandidateError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-t0 mb-2">Có lỗi xảy ra</h2>
        <p className="text-t1 mb-6 leading-relaxed">
          Không thể tải dữ liệu. Vui lòng thử lại.
        </p>
        <button
          onClick={reset}
          className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}
