"use client";

import { Suspense } from "react";
import SkillProposeForm from "@/components/skills/SkillProposeForm";

export default function CandidateProposeSkillPage() {
  return (
    <Suspense fallback={<div className="p-8 text-t1">Đang tải...</div>}>
      <SkillProposeForm roleLabel="Ứng viên" />
    </Suspense>
  );
}
