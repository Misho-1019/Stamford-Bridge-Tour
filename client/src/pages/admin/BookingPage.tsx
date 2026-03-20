import { useEffect, useState } from "react";
import { getAdminBooking, type AdminBooking } from "../../lib/api/admin";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
  }).format(cents / 100);
}

function BookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadBookings() {
      try {
        const data = await getAdminBooking();
        setBookings(data.bookings);
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

    loadBookings();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#003399]">Bookings</h2>
        <p className="mt-1 text-sm text-slate-700">
          Manage tour bookings, statuses, and booking details.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm backdrop-blur-sm">
        {loading && <p className="text-sm text-slate-600">Loading...</p>}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {!loading && !error && bookings.length === 0 && (
          <p className="text-sm text-slate-600">No bookings found.</p>
        )}

        {!loading && !error && bookings.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left">
                  <th className="pb-3 pr-4 text-slate-600">Email</th>
                  <th className="pb-3 pr-4 text-slate-600">Date</th>
                  <th className="pb-3 pr-4 text-slate-600">Tickets</th>
                  <th className="pb-3 pr-4 text-slate-600">Amount</th>
                  <th className="pb-3 pr-4 text-slate-600">Status</th>
                </tr>
              </thead>
        
              <tbody>
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-3 pr-4 text-slate-900">{b.email}</td>
        
                    <td className="py-3 pr-4 text-slate-600">
                      {new Date(b.createdAt).toLocaleString()}
                    </td>
        
                    <td className="py-3 pr-4 text-slate-600">
                      {b.qtyTotal}
                    </td>
        
                    <td className="py-3 pr-4 text-slate-900 font-medium">
                      {formatCurrency(b.amountTotalCents)}
                    </td>
        
                    <td className="py-3 pr-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;

function StatusBadge({ status }: { status: string }) {
  const base =
    'inline-flex rounded-full px-2 py-1 text-xs font-medium';

  if (status === 'CONFIRMED') {
    return (
      <span className={`${base} bg-green-100 text-green-700`}>
        Confirmed
      </span>
    );
  }

  if (status === 'CANCELLED') {
    return (
      <span className={`${base} bg-red-100 text-red-700`}>
        Cancelled
      </span>
    );
  }

  if (status === 'REFUNDED') {
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>
        Refunded
      </span>
    );
  }

  return (
    <span className={`${base} bg-slate-100 text-slate-600`}>
      {status}
    </span>
  );
}
