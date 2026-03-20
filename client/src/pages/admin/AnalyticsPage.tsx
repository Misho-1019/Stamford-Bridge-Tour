import { useEffect, useState } from "react";
import { getAdminBookingStats, getAdminRevenueSeries, getAdminSlotStat, getAdminTicketTypeStats, type AdminBookingStats } from "../../lib/api/admin";
import StatCard from "../../components/admin/StatCard";
import RevenueChart from "../../components/admin/RevenueChart";
import TicketTypeChart from "../../components/admin/TicketTypeChart";
import SlotStatsTable from "../../components/admin/SlotStatsTable";

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
  const [slotStats, setSlotStats] = useState<{
    slotId: string;
    startAt: string;
    endAt: string;
    capacityTotal: number;
    bookingsCount: number;
    ticketsSold: number;
    revenueCents: number;
    usagePercent: number;
  }[]>([])

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  async function loadDashboardData(params?: { fromDate?: string; toDate?: string }) {
    try {
      setLoading(true);
      setError(null);

      const [statsData, revenueSeriesData, ticketTypeData, slotStatsData] = await Promise.all([
        getAdminBookingStats(params),
        getAdminRevenueSeries(params),
        getAdminTicketTypeStats(params),
        getAdminSlotStat(params),
      ])

      setStats(statsData)
      setRevenueSeries(revenueSeriesData.data)
      setTicketStats(ticketTypeData.data)
      setSlotStats(slotStatsData.data)
    } catch (err) {
      setError('Failed to load stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, [])

  return (
    <div>
      <h2 className="text-xl font-semibold text-[#003399]">
        Analytics Dashboard
      </h2>

      {loading && (
        <p className="mt-4 text-sm text-slate-600">Loading...</p>
      )}

      {error && (
        <p className="mt-4 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex flex-col">
            <label
              htmlFor="fromDate"
              className="mb-1 text-sm font-medium text-slate-700"
            >
              From
            </label>
            <input
              id="fromDate"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003399]"
            />
          </div>
      
          <div className="flex flex-col">
            <label
              htmlFor="toDate"
              className="mb-1 text-sm font-medium text-slate-700"
            >
              To
            </label>
            <input
              id="toDate"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-[#003399]"
            />
          </div>
      
          <button
            type="button"
            disabled={loading}
            onClick={() => loadDashboardData({ fromDate, toDate })}
            className={`rounded-lg px-4 py-2 font-medium text-white ${
              loading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#003399] hover:opacity-90'
            }`}
          >
            {loading ? 'Loading...' : 'Apply'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setFromDate('');
              setToDate('');
              loadDashboardData();
            }}
            className={`rounded-lg border px-4 py-2 font-medium ${
              loading
                ? 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            Reset
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Stats */}
          <div className="mt-6 space-y-8">
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
      
          {/* Charts */}
          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
            {revenueSeries.length > 0 && (
              <RevenueChart data={revenueSeries} />
            )}
      
            {ticketStats.length > 0 && (
              <TicketTypeChart data={ticketStats} />
            )}
          </div>
      
          {/* Table */}
          {slotStats.length > 0 && (
            <div className="mt-8">
              <SlotStatsTable data={slotStats} />
            </div>
          )}
        </>
      )}
    </div>
  );
}