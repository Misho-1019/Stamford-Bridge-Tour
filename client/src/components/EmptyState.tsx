import { Link } from "react-router";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
};

function EmptyState({ title, message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="mb-4 text-4xl" style={{ color: 'rgba(212,175,55,0.2)' }}>◈</div>
      <h3 className="text-lg font-semibold" style={{ color: 'rgba(255,255,255,0.70)' }}>{title}</h3>
      <p className="mt-1 max-w-sm text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 rounded-lg px-5 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
          style={{
            border: '1px solid rgba(212,175,55,0.35)',
            background: 'rgba(212,175,55,0.12)',
            backdropFilter: 'blur(12px)',
            color: '#D4AF37'
          }}
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
