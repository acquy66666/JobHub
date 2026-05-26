"use client";

import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="vi">
      <body className="min-h-screen bg-[#07070D] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl font-black text-[#7C3AED] mb-4">⚠</div>
          <h1 className="text-2xl font-bold text-[#F5F5FF] mb-2">
            Đã có lỗi xảy ra
          </h1>
          <p className="text-[#9494B0] mb-8 leading-relaxed">
            Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
              boxShadow: "0 4px 22px rgba(124,58,237,0.35)",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
