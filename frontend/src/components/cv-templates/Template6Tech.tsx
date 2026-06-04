import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template6Tech({ data }: { data: CVData }) {
  const accent = "#16A34A";
  // Group skills into pairs for display
  const skillGroups: Record<string, string[]> = {
    Languages: [],
    Frameworks: [],
    Tools: [],
    Other: [],
  };
  data.skills.forEach((sk, i) => {
    const group = ["Languages", "Frameworks", "Tools", "Other"][i % 4];
    skillGroups[group].push(sk);
  });

  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "'Courier New', Courier, monospace", padding: "40px 52px", boxSizing: "border-box" as const, fontSize: 12 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 26, fontWeight: 700, color: "#111", letterSpacing: -0.5, marginBottom: 4 }}>{data.fullName || "Họ và Tên"}</div>
        {data.title && <div style={{ fontSize: 13, color: accent, fontWeight: 700, marginBottom: 8 }}>{data.title}</div>}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" as const, fontSize: 11.5, color: "#555" }}>
          {data.email && <span>✉ {data.email}</span>}
          {data.phone && <span>✆ {data.phone}</span>}
          {data.github && <span>⌥ {data.github}</span>}
          {data.website && <span>🌐 {data.website}</span>}
          {data.linkedin && <span>in {data.linkedin}</span>}
          {data.location && <span>⊙ {data.location}</span>}
        </div>
        <div style={{ borderBottom: `2px solid ${accent}`, marginTop: 14 }} />
      </div>

      {data.skills.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Technical Skills</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 24px" }}>
            {Object.entries(skillGroups).filter(([, v]) => v.length > 0).map(([group, skills]) => (
              <div key={group} style={{ fontSize: 12, color: "#222", marginBottom: 4 }}>
                <span style={{ color: "#999" }}>{group}: </span>{skills.join(", ")}
              </div>
            ))}
          </div>
          <div style={{ borderBottom: `1px solid #E5E7EB`, marginTop: 12 }} />
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Experience</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.company}</div>
                <div style={{ fontSize: 11, color: "#888" }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Present" : formatDate(exp.endDate)}</div>
              </div>
              <div style={{ fontSize: 12, color: accent, marginBottom: 4 }}>{exp.position}</div>
              {exp.description && (
                <ul style={{ margin: 0, paddingLeft: 16 }}>
                  {exp.description.split(". ").filter(Boolean).map((point, j) => (
                    <li key={j} style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, marginBottom: 2 }}>{point.trim().replace(/\.$/, "")}.</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          <div style={{ borderBottom: `1px solid #E5E7EB`, marginTop: 4 }} />
        </div>
      )}

      {data.projects.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Projects</div>
          {data.projects.map((p, i) => (
            <div key={i} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                {p.link && <div style={{ fontSize: 10.5, color: "#3B82F6" }}>{p.link}</div>}
              </div>
              <div style={{ fontSize: 11, color: "#888", fontStyle: "italic", marginBottom: 3 }}>{p.techStack.join(" | ")}</div>
              <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.6, margin: 0 }}>{p.description}</p>
            </div>
          ))}
          <div style={{ borderBottom: `1px solid #E5E7EB`, marginTop: 4 }} />
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Education</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{edu.school}</div>
                <div style={{ fontSize: 12, color: "#555" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
              </div>
              <div style={{ fontSize: 11, color: "#888" }}>{edu.startYear} — {edu.endYear || "Present"}</div>
            </div>
          ))}
        </div>
      )}

      {data.summary && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" as const, color: accent, marginBottom: 10 }}>Summary</div>
          <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.65, margin: 0 }}>{data.summary}</p>
        </div>
      )}
    </div>
  );
}
