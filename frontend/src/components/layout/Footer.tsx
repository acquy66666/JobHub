import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-bg-1 border-t border-border-dark mt-0">
      <div className="max-w-wrap mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-[10px] mb-4">
              <div className="w-8 h-8 bg-brand-gradient rounded-[9px] flex items-center justify-center font-black text-[15px] text-white">
                J
              </div>
              <span className="text-[18px] font-extrabold tracking-[-0.02em] text-t0">
                JobHub
              </span>
            </div>
            <p className="text-t2 text-sm leading-relaxed">
              Kết nối tài năng với cơ hội. Nền tảng tuyển dụng hiện đại dành cho thế hệ mới.
            </p>
          </div>

          {/* Ứng viên */}
          <div>
            <h4 className="text-t0 font-semibold text-sm mb-4">Ứng viên</h4>
            <ul className="space-y-2">
              {["Tìm việc làm", "Upload CV", "Công ty nổi bật", "Gợi ý việc làm"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-t2 text-sm hover:text-t1 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Nhà tuyển dụng */}
          <div>
            <h4 className="text-t0 font-semibold text-sm mb-4">Nhà tuyển dụng</h4>
            <ul className="space-y-2">
              {["Đăng tin tuyển dụng", "Quản lý hồ sơ", "Tìm ứng viên", "Gói dịch vụ"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-t2 text-sm hover:text-t1 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hỗ trợ */}
          <div>
            <h4 className="text-t0 font-semibold text-sm mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {["Về chúng tôi", "Liên hệ", "Điều khoản", "Chính sách bảo mật"].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-t2 text-sm hover:text-t1 transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border-dark pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-t2 text-sm">
            © {new Date().getFullYear()} JobHub. All rights reserved.
          </p>
          <p className="text-t2 text-sm">
            Made with ❤️ for đồ án tốt nghiệp
          </p>
        </div>
      </div>
    </footer>
  );
}
