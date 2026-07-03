type SkeletonProps = {
  className?: string;
};

function SkeletonLine({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded ${className}`}
      style={{ background: 'rgba(255,255,255,0.04)' }}
    />
  );
}

function SkeletonCard() {
  return (
    <div className="animate-shimmer space-y-3 rounded-xl p-4" style={{ border: '1px solid rgba(255,255,255,0.04)', background: 'rgba(255,255,255,0.02)' }}>
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
    <div className="animate-shimmer space-y-2" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '12px', padding: '12px' }}>
      <SkeletonLine className="h-4 w-32" />
      <SkeletonLine className="h-48 w-full rounded-xl" />
    </div>
  );
}

export { SkeletonLine, SkeletonCard, SkeletonChart };
