interface Props {
  children: React.ReactNode;
}

export function SectionTag({ children }: Props) {
  return (
    <div className="inline-flex items-center gap-[7px] bg-[rgba(124,58,237,.1)] border border-[rgba(124,58,237,.22)] text-[#B09BF8] text-xs font-semibold tracking-[.06em] uppercase px-[14px] py-[6px] rounded-full mb-[18px]">
      <span className="w-[6px] h-[6px] bg-[#B09BF8] rounded-full" />
      {children}
    </div>
  );
}
