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
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{b.email}</p>
                    <p className="text-sm text-slate-500">
                      {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-slate-900">
                      {formatCurrency(b.amountTotalCents)}
                    </p>
                    <p className="text-sm text-slate-500">
                      {b.qtyTotal} tickets
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-sm text-slate-600">
                  Status: <span className="font-medium">{b.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsPage;
