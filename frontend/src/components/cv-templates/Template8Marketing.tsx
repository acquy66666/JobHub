import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template8Marketing({ data }: { data: CVData }) {
  const coral = "#F97316";
  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "Arial, Helvetica, sans-serif", boxSizing: "border-box" as const, fontSize: 13 }}>
      {/* Bold header strip */}
      <div style={{ background: coral, padding: "36px 48px 28px" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>{data.fullName || "Họ và Tên"}</div>
        {data.title && <div style={{ fontSize: 15, color: "rgba(255,255,255,.85)", fontWeight: 600, marginBottom: 12 }}>{data.title}</div>}
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" as const, fontSize: 12, color: "rgba(255,255,255,.8)" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.location && <span>⊙ {data.location}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.website && <span>🌐 {data.website}</span>}
        </div>
      </div>

      <div style={{ padding: "28px 48px" }}>
        {data.summary && (
          <div style={{ marginBottom: 24, padding: "16px 20px", background: "#FFF7ED", borderLeft: `4px solid ${coral}`, borderRadius: "0 8px 8px 0" }}>
            <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{data.summary}</p>
          </div>
        )}

        <div style={{ display: "flex", gap: 32 }}>
          {/* Main column */}
          <div style={{ flex: 1 }}>
            {data.experiences.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: coral, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ height: 2, width: 20, background: coral }} /> Kinh Nghiệm
                </div>
                {data.experiences.map((exp, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{exp.company}</div>
                      <div style={{ fontSize: 11, color: "#999", background: "#FFF7ED", padding: "2px 8px", borderRadius: 10 }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Nay" : formatDate(exp.endDate)}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: coral, fontWeight: 600, marginBottom: 4 }}>{exp.position}</div>
                    {exp.description && <p style={{ fontSize: 12, color: "#555", lineHeight: 1.65, margin: 0 }}>{exp.description}</p>}
                  </div>
                ))}
              </div>
            )}

            {data.educations.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: coral, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ height: 2, width: 20, background: coral }} /> Học Vấn
                </div>
                {data.educations.map((edu, i) => (
                  <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                      <div style={{ fontSize: 12, color: "#64748B" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>{edu.startYear} — {edu.endYear || "Nay"}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ width: 200, flexShrink: 0 }}>
            {data.skills.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: coral, marginBottom: 10 }}>Kỹ Năng</div>
                {data.skills.map((sk, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: coral, flexShrink: 0 }} />{sk}
                  </div>
                ))}
              </div>
            )}

            {data.languages.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: coral, marginBottom: 10 }}>Ngoại Ngữ</div>
                {data.languages.map((l, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#374151", marginBottom: 6 }}><b>{l.name}</b>: {l.level}</div>
                ))}
              </div>
            )}

            {data.awards.length > 0 && (
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: coral, marginBottom: 10 }}>Giải Thưởng</div>
                {data.awards.map((a, i) => (
                  <div key={i} style={{ fontSize: 11.5, color: "#374151", marginBottom: 6 }}>🏆 {a}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
