import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Công ty tuyển dụng",
  description:
    "Khám phá hàng trăm công ty hàng đầu Việt Nam đang tìm kiếm nhân tài. Từ startup đến tập đoàn lớn.",
  openGraph: {
    title: "Công ty tuyển dụng | JobHub",
    description: "Khám phá hàng trăm công ty hàng đầu Việt Nam đang tìm kiếm nhân tài.",
  },
};

export default function CompaniesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
