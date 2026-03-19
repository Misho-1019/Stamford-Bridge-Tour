import { useEffect, useState } from "react";
import { getAdminBookingStats, getAdminRevenueSeries, getAdminTicketTypeStats, type AdminBookingStats } from "../../lib/api/admin";
import StatCard from "../../components/admin/StatCard";
import RevenueChart from "../../components/admin/RevenueChart";
import TicketTypeChart from "../../components/admin/TicketTypeChart";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(cents / 100);
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<AdminBookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenueCents: number; bookings: number }[]>([])
  const [ticketStats, setTicketStats] = useState<{ ticketTypeName: string; revenueCents: number }[]>([])

  useEffect(() => {
    async function loadStats() {
      try {
        const [statsData, revenueSeriesData, ticketTypeData] = await Promise.all([
          getAdminBookingStats(),
          getAdminRevenueSeries(),
          getAdminTicketTypeStats(),
        ]);
        
        setStats(statsData)
        setRevenueSeries(revenueSeriesData.data)
        setTicketStats(ticketTypeData.data);
      } catch (err) {
        setError('Failed to load admin stats')
      } finally {
        setLoading(false)
      }
    }

    loadStats();
  }, [])

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
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
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Total Bookings" value={stats.totalBookings} />
          <StatCard label="Confirmed" value={stats.confirmedBookings} />
          <StatCard label="Cancelled" value={stats.cancelledBookings} />
          <StatCard label="Refunded" value={stats.refundedBookings} />
          <StatCard
            label="Confirmed Revenue"
            value={formatCurrency(stats.confirmedRevenueCents)}
          />
          <StatCard
            label="Refunded Revenue"
            value={formatCurrency(stats.refundedRevenueCents)}
          />
        </div>
      )}
      {revenueSeries.length > 0 && (
        <div className="mt-8">
          <RevenueChart data={revenueSeries} />
        </div>
      )}
      {ticketStats.length > 0 && (
        <div className="mt-8">
          <TicketTypeChart data={ticketStats} />
        </div>
      )}
    </div>
  );
}