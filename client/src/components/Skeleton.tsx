type SkeletonProps = {
  className?: string;
};

function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-slate-200 ${className}`}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-3 w-1/2" />
      <SkeletonLine className="h-3 w-2/3" />
      <div className="pt-2">
        <SkeletonLine className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function SkeletonChart() {
  return (
    <div className="animate-pulse space-y-2">
      <SkeletonLine className="h-4 w-32" />
      <SkeletonLine className="h-48 w-full rounded-xl" />
    </div>
  );
}

export { SkeletonLine, SkeletonCard, SkeletonChart };
