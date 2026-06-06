"use client";

import { Suspense } from "react";
import SkillProposeForm from "@/components/skills/SkillProposeForm";

export default function EmployerProposeSkillPage() {
  return (
    <Suspense fallback={<div className="p-8 text-t1">Đang tải...</div>}>
      <SkillProposeForm roleLabel="Nhà tuyển dụng" />
    </Suspense>
  );
}
