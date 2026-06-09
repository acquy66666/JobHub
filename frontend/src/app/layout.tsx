import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";
import { Providers } from "@/providers/Providers";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://jobhub.vercel.app"
  ),
  title: {
    default: "JobHub — Kết nối tài năng với cơ hội",
    template: "%s | JobHub",
  },
  description:
    "Nền tảng tuyển dụng hiện đại kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu tại Việt Nam.",
  keywords: ["việc làm", "tuyển dụng", "ứng viên", "nhà tuyển dụng", "IT", "công nghệ"],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "JobHub",
    title: "JobHub — Kết nối tài năng với cơ hội",
    description:
      "Nền tảng tuyển dụng hiện đại kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu tại Việt Nam.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JobHub — Kết nối tài năng với cơ hội",
    description:
      "Nền tảng tuyển dụng hiện đại kết nối ứng viên tài năng với nhà tuyển dụng hàng đầu.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={GeistSans.variable}>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
