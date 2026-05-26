"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";

const INDUSTRIES = ["Công nghệ thông tin", "Tài chính - Ngân hàng", "Giáo dục", "Y tế", "Bán lẻ", "Marketing", "Kỹ thuật", "Nhân sự", "Kế toán", "Khác"];
const JOB_TYPES = [
  { value: "FULL_TIME", label: "Toàn thời gian" },
  { value: "PART_TIME", label: "Bán thời gian" },
  { value: "CONTRACT", label: "Hợp đồng" },
  { value: "INTERNSHIP", label: "Thực tập" },
  { value: "FREELANCE", label: "Freelance" },
];
const WORK_MODES = [
  { value: "", label: "Tất cả" },
  { value: "ON_SITE", label: "Tại văn phòng" },
  { value: "REMOTE", label: "Làm từ xa" },
  { value: "HYBRID", label: "Kết hợp" },
];

interface FilterState {
  keyword: string;
  location: string;
  industry: string;
  jobTypes: string[];
  workMode: string;
  salaryMin: string;
  salaryMax: string;
}

interface Props {
  initial: Partial<FilterState>;
}

export function JobFilters({ initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<FilterState>({
    keyword: initial.keyword ?? "",
    location: initial.location ?? "",
    industry: initial.industry ?? "",
    jobTypes: initial.jobTypes ?? [],
    workMode: initial.workMode ?? "",
    salaryMin: initial.salaryMin ?? "",
    salaryMax: initial.salaryMax ?? "",
  });

  function toggleJobType(value: string) {
    setFilters((f) => ({
      ...f,
      jobTypes: f.jobTypes.includes(value) ? f.jobTypes.filter((t) => t !== value) : [...f.jobTypes, value],
    }));
  }

  function apply() {
    const params = new URLSearchParams();
    if (filters.keyword) params.set("keyword", filters.keyword);
    if (filters.location) params.set("location", filters.location);
    if (filters.industry) params.set("industry", filters.industry);
    if (filters.workMode) params.set("workMode", filters.workMode);
    if (filters.salaryMin) params.set("salaryMin", filters.salaryMin);
    if (filters.salaryMax) params.set("salaryMax", filters.salaryMax);
    filters.jobTypes.forEach((t) => params.append("jobType", t));
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  function reset() {
    setFilters({ keyword: "", location: "", industry: "", jobTypes: [], workMode: "", salaryMin: "", salaryMax: "" });
    router.push(pathname);
  }

  const inputClass = "w-full bg-bg-3 border border-border-dark rounded-xl px-3 py-2 text-[13px] text-t0 placeholder:text-t2 focus:outline-none focus:border-[rgba(124,58,237,.5)] focus:shadow-[0_0_0_3px_rgba(124,58,237,.1)] transition-all";

  return (
    <div className="bg-bg-2 border border-border-dark rounded-2xl p-5 space-y-5 sticky top-20">
      <h3 className="text-[15px] font-bold text-t0">Bộ lọc</h3>

      {/* Keyword */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Từ khóa</label>
        <input
          type="text"
          placeholder="Tên công việc..."
          value={filters.keyword}
          onChange={(e) => setFilters((f) => ({ ...f, keyword: e.target.value }))}
          className={inputClass}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>

      {/* Location */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Địa điểm</label>
        <input
          type="text"
          placeholder="Hà Nội, TP.HCM..."
          value={filters.location}
          onChange={(e) => setFilters((f) => ({ ...f, location: e.target.value }))}
          className={inputClass}
          onKeyDown={(e) => e.key === "Enter" && apply()}
        />
      </div>

      {/* Industry */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Ngành nghề</label>
        <select
          value={filters.industry}
          onChange={(e) => setFilters((f) => ({ ...f, industry: e.target.value }))}
          className={inputClass}
        >
          <option value="">Tất cả ngành</option>
          {INDUSTRIES.map((ind) => <option key={ind} value={ind}>{ind}</option>)}
        </select>
      </div>

      {/* Job type */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Hình thức</label>
        <div className="space-y-2">
          {JOB_TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.jobTypes.includes(t.value)}
                onChange={() => toggleJobType(t.value)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
              <span className="text-[13px] text-t1">{t.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work mode */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Chế độ làm việc</label>
        <div className="space-y-2">
          {WORK_MODES.map((m) => (
            <label key={m.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="workMode"
                value={m.value}
                checked={filters.workMode === m.value}
                onChange={(e) => setFilters((f) => ({ ...f, workMode: e.target.value }))}
                className="w-4 h-4 accent-[#7C3AED]"
              />
              <span className="text-[13px] text-t1">{m.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Salary range */}
      <div className="space-y-2">
        <label className="text-[12px] font-semibold text-t1 uppercase tracking-wide">Mức lương (VND)</label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Tối thiểu"
            value={filters.salaryMin}
            onChange={(e) => setFilters((f) => ({ ...f, salaryMin: e.target.value }))}
            className={inputClass}
          />
          <input
            type="number"
            placeholder="Tối đa"
            value={filters.salaryMax}
            onChange={(e) => setFilters((f) => ({ ...f, salaryMax: e.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <button onClick={apply} className="btn-primary w-full py-2.5 rounded-xl text-[14px] font-semibold">
          Áp dụng bộ lọc
        </button>
        <button onClick={reset} className="w-full py-2.5 rounded-xl text-[13px] text-t1 border border-border-dark hover:bg-white/[.04] hover:text-t0 transition-colors">
          Xóa bộ lọc
        </button>
      </div>
    </div>
  );
}
