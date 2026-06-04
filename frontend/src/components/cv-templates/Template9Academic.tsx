import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template9Academic({ data }: { data: CVData }) {
  const darkGreen = "#064E3B";
  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "Georgia, 'Times New Roman', serif", padding: "48px 56px", boxSizing: "border-box" as const, fontSize: 12 }}>
      {/* Header */}
      <div style={{ textAlign: "center" as const, marginBottom: 28, borderBottom: `2px solid ${darkGreen}`, paddingBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: darkGreen, letterSpacing: 0.5, marginBottom: 6 }}>{data.fullName || "Họ và Tên"}</div>
        {data.title && <div style={{ fontSize: 13, color: "#374151", fontStyle: "italic", marginBottom: 8 }}>{data.title}</div>}
        <div style={{ display: "flex", justifyContent: "center", gap: 20, flexWrap: "wrap" as const, fontSize: 11.5, color: "#555" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⊙ {data.location}</span>}
          {data.website && <span>🌐 {data.website}</span>}
        </div>
      </div>

      {data.summary && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Research Interests</div>
          <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.8, margin: 0, fontStyle: "italic" }}>{data.summary}</p>
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Học Vấn</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ marginBottom: 12, display: "flex", gap: 16 }}>
              <div style={{ width: 80, fontSize: 12, color: "#555", flexShrink: 0, fontStyle: "italic" }}>{edu.startYear} — {edu.endYear || "Nay"}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                <div style={{ fontSize: 12, color: "#374151" }}>{edu.degree}{edu.major ? ` trong ${edu.major}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Kinh Nghiệm Nghiên Cứu & Công Tác</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, display: "flex", gap: 16 }}>
              <div style={{ width: 80, fontSize: 11.5, color: "#555", flexShrink: 0, fontStyle: "italic" }}>{formatDate(exp.startDate)} —<br />{exp.isCurrent ? "Nay" : formatDate(exp.endDate)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.position}</div>
                <div style={{ fontSize: 12, color: darkGreen, marginBottom: 4 }}>{exp.company}</div>
                {exp.description && <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, margin: 0 }}>{exp.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.publications.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Publications</div>
          {data.publications.map((p, i) => (
            <div key={i} style={{ marginBottom: 10, fontSize: 12, color: "#374151", lineHeight: 1.7 }}>
              [{i + 1}] {p.authors}. &quot;{p.title}&quot;. <em>{p.journal}</em>, {p.year}.
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Kỹ Năng & Công Cụ</div>
          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.8 }}>{data.skills.join(" · ")}</div>
        </div>
      )}

      {(data.certifications.length > 0 || data.awards.length > 0) && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Giải Thưởng & Học Bổng</div>
          {data.awards.map((a, i) => (
            <div key={`a${i}`} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>• {a}</div>
          ))}
          {data.certifications.map((c, i) => (
            <div key={`c${i}`} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>• {c.name} — {c.issuer} ({c.year})</div>
          ))}
        </div>
      )}

      {data.languages.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: darkGreen, textTransform: "uppercase" as const, letterSpacing: 1, borderBottom: `1px solid ${darkGreen}`, paddingBottom: 4, marginBottom: 10 }}>Ngoại Ngữ</div>
          {data.languages.map((l, i) => (
            <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}><b>{l.name}</b>: {l.level}</div>
          ))}
        </div>
      )}
    </div>
  );
}
