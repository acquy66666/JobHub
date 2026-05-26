export function JobCardSkeleton() {
  return (
    <div className="card-dark p-5 rounded-[18px] animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-bg-3 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-3 rounded w-3/4" />
          <div className="h-3 bg-bg-3 rounded w-1/2" />
          <div className="flex gap-2 mt-3">
            <div className="h-6 bg-bg-3 rounded-lg w-24" />
            <div className="h-6 bg-bg-3 rounded-lg w-20" />
            <div className="h-6 bg-bg-3 rounded-lg w-28" />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4 pt-3 border-t border-border-dark/50">
        <div className="h-3 bg-bg-3 rounded w-20" />
        <div className="h-3 bg-bg-3 rounded w-16" />
      </div>
    </div>
  );
}
