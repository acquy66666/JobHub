import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "JobHub — Kết nối tài năng với cơ hội";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#07070D",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        {/* Glow background */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 400,
            background:
              "radial-gradient(ellipse, rgba(124,58,237,0.25) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Logo */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: "-0.04em",
            background: "linear-gradient(135deg, #7C3AED, #3B82F6)",
            backgroundClip: "text",
            color: "transparent",
            marginBottom: 16,
          }}
        >
          JobHub
        </div>
        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#9494B0",
            letterSpacing: "-0.01em",
            textAlign: "center",
            maxWidth: 700,
          }}
        >
          Kết nối tài năng với cơ hội
        </div>
        {/* Stats row */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 48,
          }}
        >
          {[
            { num: "500+", label: "Việc làm" },
            { num: "100+", label: "Công ty" },
            { num: "10K+", label: "Ứng viên" },
          ].map(({ num, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: "#F5F5FF",
                }}
              >
                {num}
              </span>
              <span style={{ fontSize: 16, color: "#9494B0" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
