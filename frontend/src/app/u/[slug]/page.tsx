"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import api from "@/lib/api";
import Link from "next/link";
import Image from "next/image";

interface PublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  headline: string | null;
  summary: string | null;
  location: string | null;
  skills: string[];
  experiences: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
  }>;
  educations: Array<{
    id: string;
    school: string;
    degree: string;
    major: string | null;
    startYear: number;
    endYear: number | null;
  }>;
}

function formatDateRange(start: string, end: string | null, isCurrent: boolean) {
  const s = new Date(start).toLocaleDateString("vi-VN", { month: "numeric", year: "numeric" });
  if (isCurrent) return `${s} — Hiện tại`;
  if (!end) return s;
  const e = new Date(end).toLocaleDateString("vi-VN", { month: "numeric", year: "numeric" });
  return `${s} — ${e}`;
}

export default function PublicProfilePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: profile, isLoading, isError } = useQuery<PublicProfile>({
    queryKey: ["public-profile", slug],
    queryFn: () => api.get(`/public/candidates/${slug}`).then((r) => r.data),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="text-5xl">🔍</div>
        <h1 className="text-[22px] font-bold text-t0">Hồ sơ không tồn tại</h1>
        <p className="text-[14px] text-t1 max-w-sm">Hồ sơ này chưa được công khai hoặc đường dẫn không hợp lệ.</p>
        <Link href="/" className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold mt-2">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Mini navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 border-b border-border-dark bg-[rgba(7,7,13,.85)] backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-[18px] font-extrabold bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
            JobHub
          </span>
        </Link>
        <div className="ml-auto">
          <Link href="/jobs" className="text-[13px] text-t1 hover:text-t0 transition-colors">
            Tìm việc làm →
          </Link>
        </div>
      </nav>

      <div className="pt-14">
        {/* Hero */}
        <ScrollReveal direction="up">
          <div className="max-w-3xl mx-auto px-6 pt-12 pb-8">
            <div className="card-dark rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
              {/* Avatar */}
              <div className="shrink-0">
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-2xl object-cover border border-border-dark"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#3B82F6] flex items-center justify-center text-[36px] font-black text-white">
                    {profile.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="text-center sm:text-left">
                <h1 className="text-[26px] font-extrabold text-t0 mb-1">{profile.fullName}</h1>
                {profile.headline && (
                  <p className="text-[15px] text-[#B09BF8] font-medium mb-2">{profile.headline}</p>
                )}
                {profile.location && (
                  <p className="text-[13px] text-t1 flex items-center gap-1.5 justify-center sm:justify-start">
                    <span>📍</span> {profile.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="max-w-3xl mx-auto px-6 pb-16 space-y-6">
          {/* Summary */}
          {profile.summary && (
            <ScrollReveal direction="up" delay={0.05}>
              <div className="card-dark rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-t0 mb-3">Giới thiệu</h2>
                <p className="text-[14px] text-t1 leading-relaxed whitespace-pre-line">{profile.summary}</p>
              </div>
            </ScrollReveal>
          )}

          {/* Skills */}
          {profile.skills.length > 0 && (
            <ScrollReveal direction="up" delay={0.08}>
              <div className="card-dark rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-t0 mb-4">Kỹ năng</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-lg text-[12px] font-medium bg-[rgba(124,58,237,.12)] text-[#B09BF8] border border-[rgba(124,58,237,.2)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Experience */}
          {profile.experiences.length > 0 && (
            <ScrollReveal direction="up" delay={0.11}>
              <div className="card-dark rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-t0 mb-4">Kinh nghiệm</h2>
                <div className="space-y-5">
                  {profile.experiences.map((exp, i) => (
                    <div key={exp.id} className={i > 0 ? "pt-5 border-t border-border-dark" : ""}>
                      <p className="text-[14px] font-semibold text-t0">{exp.position}</p>
                      <p className="text-[13px] text-[#B09BF8] font-medium mt-0.5">{exp.company}</p>
                      <p className="text-[12px] text-t2 mt-1">
                        {formatDateRange(exp.startDate, exp.endDate, exp.isCurrent)}
                      </p>
                      {exp.description && (
                        <p className="text-[13px] text-t1 mt-2 leading-relaxed">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Education */}
          {profile.educations.length > 0 && (
            <ScrollReveal direction="up" delay={0.14}>
              <div className="card-dark rounded-2xl p-6">
                <h2 className="text-[15px] font-bold text-t0 mb-4">Học vấn</h2>
                <div className="space-y-5">
                  {profile.educations.map((edu, i) => (
                    <div key={edu.id} className={i > 0 ? "pt-5 border-t border-border-dark" : ""}>
                      <p className="text-[14px] font-semibold text-t0">{edu.school}</p>
                      <p className="text-[13px] text-t1 mt-0.5">
                        {edu.degree}{edu.major ? ` · ${edu.major}` : ""}
                      </p>
                      <p className="text-[12px] text-t2 mt-1">
                        {edu.startYear} — {edu.endYear ?? "Hiện tại"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* CTA */}
          <ScrollReveal direction="up" delay={0.17}>
            <div className="card-dark rounded-2xl p-6 text-center">
              <p className="text-[14px] text-t1 mb-4">
                Tìm kiếm ứng viên tài năng như <span className="text-t0 font-semibold">{profile.fullName}</span>?
              </p>
              <Link
                href="/register"
                className="btn-primary px-6 py-2.5 rounded-xl text-[14px] font-semibold inline-block"
              >
                Đăng ký tuyển dụng miễn phí
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
