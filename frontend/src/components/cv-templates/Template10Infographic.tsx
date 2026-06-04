import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template10Infographic({ data }: { data: CVData }) {
  const purple = "#7C3AED";
  const blue = "#3B82F6";
  const teal = "#0D9488";

  return (
    <div style={{ width: 794, minHeight: 1123, fontFamily: "Arial, Helvetica, sans-serif", background: "#F8FAFC", boxSizing: "border-box" as const }}>
      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${purple}, ${blue})`, padding: "32px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "3px solid rgba(255,255,255,.5)" }} />
          ) : (
            <div style={{ width: 88, height: 88, borderRadius: "50%", background: "rgba(255,255,255,.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700, color: "#fff" }}>
              {data.fullName?.[0] ?? "?"}
            </div>
          )}
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: -0.5, marginBottom: 4 }}>{data.fullName || "Họ và Tên"}</div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,.85)", marginBottom: 10 }}>{data.title}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" as const, fontSize: 11, color: "rgba(255,255,255,.75)" }}>
              {data.email && <span>✉ {data.email}</span>}
              {data.phone && <span>✆ {data.phone}</span>}
              {data.location && <span>⊙ {data.location}</span>}
              {data.github && <span>⌥ {data.github}</span>}
            </div>
          </div>
        </div>

        {/* Stats row */}
        {data.experiences.length > 0 && (
          <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
            <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "10px 18px", textAlign: "center" as const }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{data.experiences.length}+</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Kinh nghiệm</div>
            </div>
            <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "10px 18px", textAlign: "center" as const }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{data.skills.length}+</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Kỹ năng</div>
            </div>
            {data.projects.length > 0 && (
              <div style={{ background: "rgba(255,255,255,.15)", borderRadius: 12, padding: "10px 18px", textAlign: "center" as const }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{data.projects.length}+</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,.75)" }}>Dự án</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Left sidebar */}
        <div style={{ width: 220, background: "#1E293B", padding: "24px 18px", minHeight: "calc(100% - 160px)", boxSizing: "border-box" as const }}>
          {data.summary && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#60A5FA", marginBottom: 10 }}>Về tôi</div>
              <p style={{ fontSize: 11.5, color: "#CBD5E1", lineHeight: 1.7, margin: 0 }}>{data.summary}</p>
            </div>
          )}

          {data.skills.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#60A5FA", marginBottom: 10 }}>Kỹ Năng</div>
              {data.skills.map((sk, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#E2E8F0", marginBottom: 3 }}>
                    <span>{sk}</span><span style={{ color: "#94A3B8" }}>{85 - (i % 4) * 10}%</span>
                  </div>
                  <div style={{ height: 4, background: "#334155", borderRadius: 2 }}>
                    <div style={{ height: 4, background: `linear-gradient(90deg, ${purple}, ${blue})`, borderRadius: 2, width: `${85 - (i % 4) * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.languages.length > 0 && (
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#60A5FA", marginBottom: 10 }}>Ngoại Ngữ</div>
              {data.languages.map((l, i) => (
                <div key={i} style={{ fontSize: 11.5, color: "#CBD5E1", marginBottom: 6 }}><b style={{ color: "#fff" }}>{l.name}</b> — {l.level}</div>
              ))}
            </div>
          )}

          {data.certifications.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#60A5FA", marginBottom: 10 }}>Chứng Chỉ</div>
              {data.certifications.map((c, i) => (
                <div key={i} style={{ fontSize: 11, color: "#CBD5E1", marginBottom: 8 }}>
                  <div style={{ color: "#fff", fontWeight: 600 }}>{c.name}</div>
                  <div>{c.issuer} · {c.year}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "24px 28px" }}>
          {data.experiences.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: purple, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 2, background: purple }} /> Kinh Nghiệm
              </div>
              {data.experiences.map((exp, i) => (
                <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, position: "relative" as const }}>
                  <div style={{ width: 36, display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: i === 0 ? purple : "#CBD5E1", border: `2px solid ${i === 0 ? purple : "#E2E8F0"}`, flexShrink: 0 }} />
                    {i < data.experiences.length - 1 && <div style={{ width: 2, flex: 1, background: "#E2E8F0", marginTop: 4 }} />}
                  </div>
                  <div style={{ flex: 1, paddingBottom: 4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1E293B" }}>{exp.company}</div>
                      <div style={{ fontSize: 10.5, color: "#94A3B8" }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Nay" : formatDate(exp.endDate)}</div>
                    </div>
                    <div style={{ fontSize: 12, color: purple, fontWeight: 600, marginBottom: 4 }}>{exp.position}</div>
                    {exp.description && <p style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.65, margin: 0 }}>{exp.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {data.projects.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: teal, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 2, background: teal }} /> Dự Án Nổi Bật
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {data.projects.map((p, i) => (
                  <div key={i} style={{ background: "#F1F5F9", borderRadius: 8, padding: "12px 14px", border: "1px solid #E2E8F0" }}>
                    <div style={{ fontWeight: 700, fontSize: 12.5, color: "#1E293B", marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, color: teal, marginBottom: 6 }}>{p.techStack.join(" · ")}</div>
                    <p style={{ fontSize: 11.5, color: "#475569", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.educations.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: blue, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 2, background: blue }} /> Học Vấn
              </div>
              {data.educations.map((edu, i) => (
                <div key={i} style={{ background: "#F1F5F9", borderRadius: 8, padding: "12px 14px", border: "1px solid #E2E8F0", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                    <div style={{ fontSize: 12, color: "#64748B" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
                  </div>
                  <div style={{ fontSize: 11, color: "#94A3B8" }}>{edu.startYear} — {edu.endYear || "Nay"}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
