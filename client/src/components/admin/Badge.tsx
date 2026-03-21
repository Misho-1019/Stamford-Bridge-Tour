export default function Badge({ status }: { status: string }) {
  const base = "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold";

  if (status === "CONFIRMED") {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>Confirmed</span>
    );
  }

  if (status === "CANCELLED") {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>
    );
  }

  if (status === "REFUNDED") {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-800`}>Refunded</span>
    );
  }

  return <span className={`${base} bg-slate-100 text-slate-700`}>{status}</span>;
}
