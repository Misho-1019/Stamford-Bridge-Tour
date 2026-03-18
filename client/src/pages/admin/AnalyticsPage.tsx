import { useEffect } from "react";
import { getAdminBookingStats } from "../../lib/api/admin";

export default function AnalyticsPage() {
  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getAdminBookingStats();
        console.log('admin stats:', data);
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
    }

    loadStats();
  }, [])
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        Analytics Dashboard
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Admin analytics will appear here.
      </p>
    </div>
  );
}