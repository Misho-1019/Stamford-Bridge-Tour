import { useEffect, useState } from "react";
import { getAdminBookingStats, type AdminBookingStats } from "../../lib/api/admin";

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminBookingStats();
        
        setStats(data)
      } catch (err) {
        setError('Failed to load admin stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats();
  }, [])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Analytics Dashboard
      </h2>

      {loading && (
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      {stats && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Total Bookings</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalBookings}</p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Confirmed</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.confirmedBookings}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Cancelled</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.cancelledBookings}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-200">
            <p className="text-sm text-slate-500">Refunded</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats.refundedBookings}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}