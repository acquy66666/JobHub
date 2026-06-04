import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template5Executive({ data }: { data: CVData }) {
  const accent = "#92400E";
  const gold = "#D97706";
  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#1C1917", fontFamily: "Georgia, 'Times New Roman', serif", padding: "52px 60px", boxSizing: "border-box" as const, fontSize: 13 }}>
      {/* Header */}
      <div style={{ borderBottom: `3px solid #2D3748`, paddingBottom: 20, marginBottom: 28 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 0.5, color: "#2D3748", marginBottom: 6 }}>{data.fullName || "Họ và Tên"}</div>
        {data.title && <div style={{ fontSize: 14, color: gold, fontWeight: 600, fontStyle: "italic", marginBottom: 10 }}>{data.title}</div>}
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" as const, fontSize: 11.5, color: "#78716C" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⊙ {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: accent, marginBottom: 12 }}>Tóm Tắt Năng Lực</div>
          <p style={{ fontSize: 13, color: "#292524", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{data.summary}</p>
        </div>
      )}

      {data.skills.length >= 4 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: accent, marginBottom: 12 }}>Năng Lực Cốt Lõi</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px 24px" }}>
            {data.skills.map((sk, i) => (
              <div key={i} style={{ fontSize: 12, color: "#292524", paddingLeft: 12, borderLeft: `2px solid ${gold}` }}>
                {sk}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: accent, marginBottom: 12 }}>Kinh Nghiệm Chuyên Môn</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#2D3748" }}>{exp.company}</div>
                <div style={{ fontSize: 11.5, color: "#78716C", fontStyle: "italic" }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Hiện tại" : formatDate(exp.endDate)}</div>
              </div>
              <div style={{ fontSize: 13, color: gold, fontWeight: 600, marginBottom: 6 }}>{exp.position}</div>
              {exp.description && <p style={{ fontSize: 12.5, color: "#44403C", lineHeight: 1.75, margin: 0 }}>{exp.description}</p>}
              {i < data.experiences.length - 1 && <div style={{ borderBottom: "1px solid #E7E5E4", marginTop: 14 }} />}
            </div>
          ))}
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: accent, marginBottom: 12 }}>Học Vấn</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#2D3748" }}>{edu.school}</div>
                <div style={{ fontSize: 12, color: "#78716C", fontStyle: "italic" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
              </div>
              <div style={{ fontSize: 12, color: "#78716C" }}>{edu.startYear} — {edu.endYear || "Hiện tại"}</div>
            </div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: accent, marginBottom: 12 }}>Chứng Chỉ & Công Nhận</div>
          {data.certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12.5, color: "#44403C", marginBottom: 6 }}>
              <b>{c.name}</b> — {c.issuer} ({c.year})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
