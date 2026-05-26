import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-0 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-[120px] font-black leading-none gradient-text select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-t0 mt-4 mb-2">
          Trang không tồn tại
        </h1>
        <p className="text-t1 mb-8 leading-relaxed">
          Trang bạn đang tìm kiếm đã bị xóa, đổi tên hoặc chưa từng tồn tại.
        </p>
        <Link
          href="/"
          className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
