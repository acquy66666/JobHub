import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template4Creative({ data }: { data: CVData }) {
  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "Arial, Helvetica, sans-serif", background: "#fff", boxSizing: "border-box" as const }}>
      {/* Gradient Header */}
      <div style={{ background: "linear-gradient(135deg, #7C3AED, #3B82F6)", padding: "32px 40px", display: "flex", alignItems: "center", gap: 24 }}>
        {data.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={data.avatarUrl} alt="" style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,.5)", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
            {data.fullName?.[0] ?? "?"}
          </div>
        )}
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>{data.fullName || "Họ và Tên"}</div>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", fontWeight: 500, marginBottom: 10 }}>{data.title}</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, fontSize: 11, color: "rgba(255,255,255,.75)" }}>
            {data.email && <span>✉ {data.email}</span>}
            {data.phone && <span>✆ {data.phone}</span>}
            {data.location && <span>⊙ {data.location}</span>}
          </div>
        </div>
      </div>

      {/* Body: Sidebar + Main */}
      <div style={{ display: "flex" }}>
        {/* Sidebar */}
        <div style={{ width: 220, background: "#F8FAFC", padding: "24px 18px", borderRight: "1px solid #E2E8F0", flexShrink: 0 }}>
          {data.skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", marginBottom: 10 }}>Kỹ Năng</div>
              {data.skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: 6 }}>
                  <div style={{ fontSize: 11.5, color: "#374151", marginBottom: 2 }}>{sk}</div>
                  <div style={{ height: 3, background: "#E2E8F0", borderRadius: 2 }}>
                    <div style={{ height: 3, background: "linear-gradient(90deg,#7C3AED,#3B82F6)", borderRadius: 2, width: `${85 - (i % 4) * 12}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", marginBottom: 10 }}>Ngoại Ngữ</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#374151", marginBottom: 6 }}><b>{l.name}</b><br /><span style={{ color: "#64748B", fontSize: 11 }}>{l.level}</span></div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", marginBottom: 10 }}>Chứng Chỉ</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: "#374151", marginBottom: 8 }}><b style={{ fontSize: 11.5 }}>{c.name}</b><br />{c.issuer}<br /><span style={{ color: "#94A3B8" }}>{c.year}</span></div>
              ))}
            </div>
          )}

          {data.linkedin && <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4, wordBreak: "break-all" as const }}>in {data.linkedin}</div>}
          {data.github && <div style={{ fontSize: 11, color: "#64748B", wordBreak: "break-all" as const }}>⌥ {data.github}</div>}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "24px 28px" }}>
          {data.summary && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", borderBottom: "2px solid #7C3AED", paddingBottom: 4, marginBottom: 10 }}>Giới Thiệu</div>
              <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.7, margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {data.experiences.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", borderBottom: "2px solid #7C3AED", paddingBottom: 4, marginBottom: 10 }}>Kinh Nghiệm</div>
              {data.experiences.map((exp, i) => (
                <div key={i} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.company}</div>
                    <span style={{ fontSize: 10.5, color: "#94A3B8", background: "#F1F5F9", padding: "2px 8px", borderRadius: 10 }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Hiện tại" : formatDate(exp.endDate)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600, marginBottom: 4 }}>{exp.position}</div>
                  {exp.description && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, margin: 0 }}>{exp.description}</p>}
                </div>
              ))}
            </div>
          )}

          {data.projects.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", borderBottom: "2px solid #7C3AED", paddingBottom: 4, marginBottom: 10 }}>Dự Án</div>
              {data.projects.map((p, i) => (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: "#3B82F6", marginBottom: 3 }}>{p.techStack.join(" · ")}</div>
                  <p style={{ fontSize: 12, color: "#555", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                </div>
              ))}
            </div>
          )}

          {data.educations.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#7C3AED", borderBottom: "2px solid #7C3AED", paddingBottom: 4, marginBottom: 10 }}>Học Vấn</div>
              {data.educations.map((edu, i) => (
                <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{edu.startYear} — {edu.endYear || "Hiện tại"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
