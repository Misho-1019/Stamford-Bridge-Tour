import { Link } from "react-router";

type EmptyStateProps = {
  title: string;
  message: string;
  actionLabel?: string;
  actionTo?: string;
};

function EmptyState({ title, message, actionLabel, actionTo }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-12 text-center">
      <div className="mb-4 text-4xl opacity-30">○</div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-slate-500">{message}</p>
      {actionLabel && actionTo && (
        <Link
          to={actionTo}
          className="mt-4 rounded-lg bg-blue-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-800"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}

export default EmptyState;
