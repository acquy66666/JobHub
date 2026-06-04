import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template3Minimalist({ data }: { data: CVData }) {
  const accent = "#0EA5E9";
  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "Arial, Helvetica, sans-serif", padding: "56px 64px", boxSizing: "border-box" as const, fontSize: 13 }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ fontSize: 34, fontWeight: 900, letterSpacing: -1, color: "#0F172A", marginBottom: 6 }}>{data.fullName || "Họ và Tên"}</div>
        {data.title && <div style={{ fontSize: 15, color: accent, fontWeight: 600, marginBottom: 12 }}>{data.title}</div>}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, fontSize: 11.5, color: "#64748B" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⊙ {data.location}</span>}
          {data.website && <span>🌐 {data.website}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.github && <span>⌥ {data.github}</span>}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Giới Thiệu</div>
          <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Kinh Nghiệm</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 18, paddingLeft: 16, borderLeft: `2px solid ${i === 0 ? accent : "#E2E8F0"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.position}</div>
                <div style={{ fontSize: 11, color: "#94A3B8" }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Hiện tại" : formatDate(exp.endDate)}</div>
              </div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 4 }}>{exp.company}</div>
              {exp.description && <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65, margin: 0 }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Học Vấn</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{edu.degree}{edu.major ? ` · ${edu.major}` : ""}</div>
              </div>
              <div style={{ fontSize: 11, color: "#94A3B8" }}>{edu.startYear} — {edu.endYear || "Hiện tại"}</div>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Kỹ Năng</div>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
            {data.skills.map((sk, i) => (
              <span key={i} style={{ fontSize: 12, background: "#F0F9FF", color: "#0284C7", border: "1px solid #BAE6FD", borderRadius: 20, padding: "4px 12px" }}>{sk}</span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 40 }}>
        {data.languages.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Ngoại Ngữ</div>
            {data.languages.map((l, i) => (
              <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}><b>{l.name}</b>: {l.level}</div>
            ))}
          </div>
        )}
        {data.certifications.length > 0 && (
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Chứng Chỉ</div>
            {data.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>{c.name} ({c.year})</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
