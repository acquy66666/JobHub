import { CVData } from "@/lib/cvTypes";

const s = {
  root: { width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "Arial, Helvetica, sans-serif", padding: "48px 56px", boxSizing: "border-box" as const, fontSize: 13 },
  name: { fontSize: 28, fontWeight: 800, letterSpacing: -0.5, color: "#111", marginBottom: 4 },
  title: { fontSize: 15, color: "#2563EB", fontWeight: 600, marginBottom: 12 },
  contact: { display: "flex", gap: 20, flexWrap: "wrap" as const, fontSize: 12, color: "#555", marginBottom: 24 },
  hr: { border: "none", borderTop: "2px solid #111", marginBottom: 18 },
  hrLight: { border: "none", borderTop: "1px solid #ddd", margin: "14px 0" },
  sectionTitle: { fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" as const, color: "#2563EB", marginBottom: 10 },
  company: { fontWeight: 700, fontSize: 14, color: "#111" },
  role: { fontSize: 13, color: "#333" },
  date: { fontSize: 11, color: "#888", marginTop: 1 },
  desc: { fontSize: 12, color: "#444", marginTop: 4, lineHeight: 1.6 },
  school: { fontWeight: 700, fontSize: 13 },
  degree: { fontSize: 12, color: "#555" },
  skillsWrap: { display: "flex", flexWrap: "wrap" as const, gap: 6 },
  skill: { fontSize: 11, background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE", borderRadius: 4, padding: "2px 8px" },
};

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template1Classic({ data }: { data: CVData }) {
  return (
    <div style={s.root}>
      <div style={s.name}>{data.fullName || "Họ và Tên"}</div>
      {data.title && <div style={s.title}>{data.title}</div>}
      <div style={s.contact}>
        {data.email && <span>✉ {data.email}</span>}
        {data.phone && <span>✆ {data.phone}</span>}
        {data.location && <span>⊙ {data.location}</span>}
        {data.website && <span>🌐 {data.website}</span>}
        {data.linkedin && <span>in {data.linkedin}</span>}
      </div>
      <hr style={s.hr} />

      {data.summary && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Giới Thiệu</div>
          <p style={{ ...s.desc, marginTop: 0 }}>{data.summary}</p>
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Kinh Nghiệm Làm Việc</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={s.company}>{exp.company}</div>
                  <div style={s.role}>{exp.position}</div>
                </div>
                <div style={s.date}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Hiện tại" : formatDate(exp.endDate)}</div>
              </div>
              {exp.description && <div style={s.desc}>{exp.description}</div>}
              {i < data.experiences.length - 1 && <hr style={s.hrLight} />}
            </div>
          ))}
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Học Vấn</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={s.school}>{edu.school}</div>
                <div style={s.degree}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
              </div>
              <div style={s.date}>{edu.startYear} — {edu.endYear || "Hiện tại"}</div>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Kỹ Năng</div>
          <div style={s.skillsWrap}>
            {data.skills.map((sk, i) => <span key={i} style={s.skill}>{sk}</span>)}
          </div>
        </div>
      )}

      {data.languages.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={s.sectionTitle}>Ngoại Ngữ</div>
          {data.languages.map((l, i) => (
            <div key={i} style={{ fontSize: 12, color: "#444", marginBottom: 2 }}><b>{l.name}</b>: {l.level}</div>
          ))}
        </div>
      )}

      {data.certifications.length > 0 && (
        <div>
          <div style={s.sectionTitle}>Chứng Chỉ</div>
          {data.certifications.map((c, i) => (
            <div key={i} style={{ fontSize: 12, color: "#444", marginBottom: 2 }}>{c.name} — {c.issuer} ({c.year})</div>
          ))}
        </div>
      )}
    </div>
  );
}
