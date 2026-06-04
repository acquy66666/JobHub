import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template2Sidebar({ data }: { data: CVData }) {
  const sidebar: React.CSSProperties = {
    width: 220, minHeight: "100%", background: "#1E3A5F", color: "#fff",
    padding: "36px 20px", boxSizing: "border-box", flexShrink: 0,
  };
  const main: React.CSSProperties = { flex: 1, padding: "36px 28px", background: "#fff", color: "#111" };
  const sideLabel: React.CSSProperties = { fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#93C5FD", marginBottom: 8, marginTop: 20 };
  const mainLabel: React.CSSProperties = { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", color: "#1E3A5F", marginBottom: 8, borderBottom: "2px solid #1E3A5F", paddingBottom: 4 };

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "Arial, Helvetica, sans-serif", display: "flex", boxSizing: "border-box" }}>
      {/* Sidebar */}
      <div style={sidebar}>
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt="" style={{ width: 90, height: 90, borderRadius: "50%", objectFit: "cover", marginBottom: 16, border: "3px solid rgba(255,255,255,.3)" }} />
        ) : (
          <div style={{ width: 90, height: 90, borderRadius: "50%", background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 16 }}>
            {data.fullName?.[0] ?? "?"}
          </div>
        )}
        <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1.3, marginBottom: 4 }}>{data.fullName || "Họ và Tên"}</div>
        <div style={{ fontSize: 12, color: "#93C5FD", marginBottom: 16 }}>{data.title}</div>

        <div style={sideLabel}>Liên hệ</div>
        {data.email && <div style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4, wordBreak: "break-all" }}>✉ {data.email}</div>}
        {data.phone && <div style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4 }}>✆ {data.phone}</div>}
        {data.location && <div style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4 }}>⊙ {data.location}</div>}
        {data.linkedin && <div style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4, wordBreak: "break-all" }}>in {data.linkedin}</div>}

        {data.skills.length > 0 && (
          <>
            <div style={sideLabel}>Kỹ Năng</div>
            {data.skills.map((sk, i) => (
              <div key={i} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 11, color: "#E2E8F0", marginBottom: 3 }}>{sk}</div>
                <div style={{ height: 4, background: "rgba(255,255,255,.15)", borderRadius: 2 }}>
                  <div style={{ height: 4, background: "#60A5FA", borderRadius: 2, width: `${80 - (i % 3) * 15}%` }} />
                </div>
              </div>
            ))}
          </>
        )}

        {data.languages.length > 0 && (
          <>
            <div style={sideLabel}>Ngoại Ngữ</div>
            {data.languages.map((l, i) => (
              <div key={i} style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 4 }}><b style={{ color: "#fff" }}>{l.name}</b><br />{l.level}</div>
            ))}
          </>
        )}

        {data.certifications.length > 0 && (
          <>
            <div style={sideLabel}>Chứng Chỉ</div>
            {data.certifications.map((c, i) => (
              <div key={i} style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 6 }}><b style={{ color: "#fff" }}>{c.name}</b><br />{c.issuer} · {c.year}</div>
            ))}
          </>
        )}
      </div>

      {/* Main */}
      <div style={main}>
        {data.summary && (
          <div style={{ marginBottom: 22 }}>
            <div style={mainLabel}>Giới Thiệu</div>
            <p style={{ fontSize: 12, color: "#444", lineHeight: 1.65, marginTop: 8 }}>{data.summary}</p>
          </div>
        )}

        {data.experiences.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={mainLabel}>Kinh Nghiệm Làm Việc</div>
            {data.experiences.map((exp, i) => (
              <div key={i} style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.company}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Hiện tại" : formatDate(exp.endDate)}</div>
                </div>
                <div style={{ fontSize: 12, color: "#1E3A5F", fontWeight: 600 }}>{exp.position}</div>
                {exp.description && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, marginTop: 4 }}>{exp.description}</p>}
              </div>
            ))}
          </div>
        )}

        {data.educations.length > 0 && (
          <div style={{ marginBottom: 22 }}>
            <div style={mainLabel}>Học Vấn</div>
            {data.educations.map((edu, i) => (
              <div key={i} style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                  <div style={{ fontSize: 12, color: "#555" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
                </div>
                <div style={{ fontSize: 11, color: "#888" }}>{edu.startYear} — {edu.endYear || "Hiện tại"}</div>
              </div>
            ))}
          </div>
        )}

        {data.awards.length > 0 && (
          <div>
            <div style={mainLabel}>Giải Thưởng</div>
            {data.awards.map((a, i) => (
              <div key={i} style={{ fontSize: 12, color: "#444", marginTop: 6 }}>🏆 {a}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
