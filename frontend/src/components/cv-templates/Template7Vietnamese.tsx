import { CVData } from "@/lib/cvTypes";

function formatDate(d: string) {
  if (!d) return "";
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

export function Template7Vietnamese({ data }: { data: CVData }) {
  const blueH = "#1D4ED8";
  const row: React.CSSProperties = { display: "flex", marginBottom: 6, fontSize: 12 };
  const label: React.CSSProperties = { width: 150, color: "#555", flexShrink: 0 };
  const val: React.CSSProperties = { color: "#111" };

  return (
    <div style={{ width: 794, minHeight: 1123, background: "#fff", color: "#111", fontFamily: "Arial, Helvetica, sans-serif", padding: "36px 48px", boxSizing: "border-box" as const, fontSize: 12 }}>
      {/* Title */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: "#111", letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 2 }}>Sơ Yếu Lý Lịch</div>
        <div style={{ fontSize: 11, color: "#888" }}>Curriculum Vitae</div>
      </div>

      {/* Info + Photo row */}
      <div style={{ display: "flex", gap: 24, marginBottom: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={row}><div style={label}>Họ và tên:</div><div style={{ ...val, fontWeight: 700, fontSize: 13 }}>{data.fullName || "Nguyễn Văn A"}</div></div>
          {data.dateOfBirth && <div style={row}><div style={label}>Ngày sinh:</div><div style={val}>{data.dateOfBirth}</div></div>}
          {data.gender && <div style={row}><div style={label}>Giới tính:</div><div style={val}>{data.gender}</div></div>}
          {data.location && <div style={row}><div style={label}>Địa chỉ:</div><div style={val}>{data.location}</div></div>}
          {data.phone && <div style={row}><div style={label}>Số điện thoại:</div><div style={val}>{data.phone}</div></div>}
          {data.email && <div style={row}><div style={label}>Email:</div><div style={val}>{data.email}</div></div>}
          {data.title && <div style={row}><div style={label}>Vị trí ứng tuyển:</div><div style={{ ...val, fontWeight: 600, color: blueH }}>{data.title}</div></div>}
        </div>
        <div style={{ width: 100, flexShrink: 0, display: "flex", flexDirection: "column" as const, alignItems: "center" }}>
          {data.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.avatarUrl} alt="" style={{ width: 90, height: 120, objectFit: "cover", border: "1px solid #ccc" }} />
          ) : (
            <div style={{ width: 90, height: 120, background: "#F1F5F9", border: "1px solid #CBD5E1", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: "#94A3B8", textAlign: "center" as const }}>
              Ảnh<br />3×4
            </div>
          )}
        </div>
      </div>

      <div style={{ borderBottom: `2px solid ${blueH}`, marginBottom: 18 }} />

      {data.summary && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: blueH, borderLeft: `4px solid ${blueH}`, paddingLeft: 10, marginBottom: 8 }}>MỤC TIÊU NGHỀ NGHIỆP</div>
          <p style={{ fontSize: 12, color: "#374151", lineHeight: 1.7, margin: 0 }}>{data.summary}</p>
        </div>
      )}

      {data.educations.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: blueH, borderLeft: `4px solid ${blueH}`, paddingLeft: 10, marginBottom: 8 }}>HỌC VẤN</div>
          {data.educations.map((edu, i) => (
            <div key={i} style={{ ...row, alignItems: "flex-start", marginBottom: 10 }}>
              <div style={{ ...label, paddingTop: 2 }}>{edu.startYear} — {edu.endYear || "Nay"}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{edu.school}</div>
                <div style={{ color: "#555" }}>{edu.degree}{edu.major ? ` — ${edu.major}` : ""}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {data.experiences.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: blueH, borderLeft: `4px solid ${blueH}`, paddingLeft: 10, marginBottom: 8 }}>KINH NGHIỆM LÀM VIỆC</div>
          {data.experiences.map((exp, i) => (
            <div key={i} style={{ ...row, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ ...label, paddingTop: 2 }}>{formatDate(exp.startDate)} — {exp.isCurrent ? "Nay" : formatDate(exp.endDate)}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 12.5 }}>{exp.company}</div>
                <div style={{ color: blueH, fontWeight: 600, marginBottom: 3 }}>{exp.position}</div>
                {exp.description && <div style={{ color: "#555", lineHeight: 1.6 }}>{exp.description}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.skills.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: blueH, borderLeft: `4px solid ${blueH}`, paddingLeft: 10, marginBottom: 8 }}>KỸ NĂNG</div>
          <div style={row}><div style={label}>Chuyên môn:</div><div style={val}>{data.skills.join(", ")}</div></div>
          {data.languages.map((l, i) => (
            <div key={i} style={row}><div style={label}>{l.name}:</div><div style={val}>{l.level}</div></div>
          ))}
        </div>
      )}

      {(data.certifications.length > 0 || data.awards.length > 0) && (
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: blueH, borderLeft: `4px solid ${blueH}`, paddingLeft: 10, marginBottom: 8 }}>THÀNH TÍCH & CHỨNG CHỈ</div>
          {data.certifications.map((c, i) => (
            <div key={`c${i}`} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>• {c.name} — {c.issuer} ({c.year})</div>
          ))}
          {data.awards.map((a, i) => (
            <div key={`a${i}`} style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>• {a}</div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 32, display: "flex", justifyContent: "flex-end" }}>
        <div style={{ textAlign: "center" as const, fontSize: 12, color: "#555" }}>
          <div>TP. Hồ Chí Minh, ngày ______ tháng ______ năm ______</div>
          <div style={{ marginTop: 60, fontWeight: 700 }}>{data.fullName}</div>
        </div>
      </div>
    </div>
  );
}
