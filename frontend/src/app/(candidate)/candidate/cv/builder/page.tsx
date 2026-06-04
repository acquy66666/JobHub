"use client";
import Link from "next/link";
import { CV_TEMPLATES, TemplateConfig } from "@/components/cv-templates";
import { SAMPLE_CV_DATA } from "@/lib/cvTypes";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { motion } from "framer-motion";

const SCALE = 0.22;
const H = Math.round(1123 * SCALE);

const atsBadge: Record<string, string> = {
  "Cao": "bg-[rgba(34,197,94,.1)] text-green-400 border-[rgba(34,197,94,.2)]",
  "Trung bình": "bg-[rgba(245,158,11,.1)] text-yellow-400 border-[rgba(245,158,11,.2)]",
  "Thấp": "bg-[rgba(239,68,68,.1)] text-red-400 border-[rgba(239,68,68,.2)]",
};

function TemplateCard({ tmpl, index }: { tmpl: TemplateConfig; index: number }) {
  const Comp = tmpl.component;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      className="card-dark rounded-2xl overflow-hidden group hover:border-[rgba(124,58,237,.4)] transition-all hover:-translate-y-1 hover:shadow-[0_14px_40px_rgba(0,0,0,.4)] cursor-pointer"
    >
      {/* Template thumbnail */}
      <div
        className="relative overflow-hidden bg-white border-b border-border-dark"
        style={{ height: H + 2 }}
      >
        <div style={{ width: 794, transformOrigin: "top left", transform: `scale(${SCALE})`, pointerEvents: "none" }}>
          <Comp data={SAMPLE_CV_DATA} />
        </div>
        {/* Overlay on hover */}
        <Link
          href={`/candidate/cv/builder/${tmpl.id}`}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
        >
          <span className="text-[13px] font-semibold text-white bg-[rgba(124,58,237,.9)] px-4 py-2 rounded-xl">
            Chọn mẫu này
          </span>
        </Link>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-[14px] font-bold text-t0">{tmpl.name}</h3>
          <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${atsBadge[tmpl.atsScore]}`}>
            ATS {tmpl.atsScore}
          </span>
        </div>
        <p className="text-[12px] text-t1 leading-relaxed mb-3">{tmpl.description}</p>
        <div className="flex flex-wrap gap-1 mb-4">
          {tmpl.industries.slice(0, 3).map((ind) => (
            <span key={ind} className="text-[10px] px-2 py-0.5 rounded-full bg-[rgba(124,58,237,.08)] text-[#B09BF8] border border-[rgba(124,58,237,.15)]">
              {ind}
            </span>
          ))}
        </div>
        <Link
          href={`/candidate/cv/builder/${tmpl.id}`}
          className="block w-full text-center btn-primary py-2 rounded-xl text-[13px] font-semibold"
        >
          Sử dụng mẫu →
        </Link>
      </div>
    </motion.div>
  );
}

export default function CVBuilderGallery() {
  return (
    <div className="p-4 sm:p-8 max-w-7xl">
      <ScrollReveal direction="up">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/candidate/cv" className="text-[13px] text-t1 hover:text-t0 transition-colors">
            ← Quản lý CV
          </Link>
          <span className="text-t2">/</span>
          <span className="text-[13px] text-t0">Tạo CV từ mẫu</span>
        </div>
        <h1 className="text-[26px] font-extrabold text-t0 mb-2">Chọn mẫu CV</h1>
        <p className="text-[14px] text-t1 mb-8">
          10 mẫu thiết kế chuyên nghiệp. Chọn mẫu phù hợp với ngành nghề và xuất PDF miễn phí.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {CV_TEMPLATES.map((tmpl, i) => (
          <TemplateCard key={tmpl.id} tmpl={tmpl} index={i} />
        ))}
      </div>
    </div>
  );
}
