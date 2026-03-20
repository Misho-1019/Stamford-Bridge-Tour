import { useEffect, useState } from "react";
import { getAdminBooking, getAdminBookingById, updateAdminBookingStatus, type AdminBooking, type AdminBookingDetails } from "../../lib/api/admin";

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

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [statusUpdating, setStatusUpdating] = useState(false);

  async function handleSelectBooking(id: string) {
    try {
        setSelectedBookingId(id)
        setDetailsLoading(true);
        setDetailsError(null)

        const data = await getAdminBookingById(id)
        setSelectedBooking(data.booking)
    } catch (err) {
        setDetailsError('Failed to load booking details')
        setSelectedBooking(null)
    } finally {
        setDetailsLoading(false)
    }
  }

  async function handleUpdateStatus(nextStatus: 'CONFIRMED' | 'CANCELLED' | 'REFUNDED') {
    if (!selectedBooking) return;

    try {
      setStatusUpdating(true)
      setDetailsError(null);

      const data = await updateAdminBookingStatus(selectedBooking.id, nextStatus);
      setSelectedBooking(data.booking)

      const bookingsData = await getAdminBooking();
      setBookings(bookingsData.bookings)
    } catch (err) {
      setDetailsError('Failed to update booking status')
    } finally {
      setStatusUpdating(false)
    }
  }

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
                    onClick={() => handleSelectBooking(b.id)}
                    className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${
                      selectedBookingId === b.id ? 'bg-blue-50' : ''
                    }`}
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

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">
            Booking Details
          </h3>
        
          {!selectedBookingId && (
            <p className="mt-3 text-sm text-slate-600">
              Select a booking to view details.
            </p>
          )}
        
          {detailsLoading && (
            <p className="mt-3 text-sm text-slate-600">Loading booking details...</p>
          )}
        
          {detailsError && (
            <p className="mt-3 text-sm text-red-600">{detailsError}</p>
          )}
        
          {selectedBooking && !detailsLoading && (
            <div className="mt-4 space-y-4 text-sm">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-slate-500">Email</p>
                  <p className="font-medium text-slate-900">{selectedBooking.email}</p>
                </div>
        
                <div>
                  <p className="text-slate-500">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedBooking.status} />
                  </div>

                  <div>
                    <p className="text-slate-500">Actions</p>
                  
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedBooking.status === 'CONFIRMED' && (
                        <>
                          <button
                            type="button"
                            disabled={statusUpdating}
                            onClick={() => handleUpdateStatus('CANCELLED')}
                            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusUpdating ? 'Updating...' : 'Cancel Booking'}
                          </button>
                  
                          <button
                            type="button"
                            disabled={statusUpdating}
                            onClick={() => handleUpdateStatus('REFUNDED')}
                            className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {statusUpdating ? 'Updating...' : 'Mark Refunded'}
                          </button>
                        </>
                      )}
                  
                      {selectedBooking.status === 'CANCELLED' && (
                        <button
                          type="button"
                          disabled={statusUpdating}
                          onClick={() => handleUpdateStatus('REFUNDED')}
                          className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {statusUpdating ? 'Updating...' : 'Mark Refunded'}
                        </button>
                      )}
                  
                      {selectedBooking.status === 'REFUNDED' && (
                        <p className="text-sm text-slate-500">
                          No actions available for refunded bookings.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
        
                <div>
                  <p className="text-slate-500">Created At</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedBooking.createdAt).toLocaleString()}
                  </p>
                </div>
        
                <div>
                  <p className="text-slate-500">Amount</p>
                  <p className="font-medium text-slate-900">
                    {formatCurrency(selectedBooking.amountTotalCents)}
                  </p>
                </div>
        
                <div>
                  <p className="text-slate-500">Stripe Session ID</p>
                  <p className="break-all font-medium text-slate-900">
                    {selectedBooking.stripeSessionId ?? '—'}
                  </p>
                </div>
        
                <div>
                  <p className="text-slate-500">Payment Intent ID</p>
                  <p className="break-all font-medium text-slate-900">
                    {selectedBooking.stripePaymentIntentId ?? '—'}
                  </p>
                </div>
              </div>
        
              <div>
                <p className="text-slate-500">Slot</p>
                <p className="font-medium text-slate-900">
                  {new Date(selectedBooking.slot.startAt).toLocaleString()} -{' '}
                  {new Date(selectedBooking.slot.endAt).toLocaleString()}
                </p>
              </div>
        
              <div>
                <p className="text-slate-500">Items</p>
                <div className="mt-2 space-y-2">
                  {selectedBooking.items.map((item, index) => (
                    <div
                      key={`${item.ticketTypeId}-${index}`}
                      className="rounded-lg border border-slate-200 p-3"
                    >
                      <p className="text-slate-900">
                        Ticket Type ID: {item.ticketTypeId}
                      </p>
                      <p className="text-slate-600">Qty: {item.qty}</p>
                      <p className="text-slate-600">
                        Unit Price: {formatCurrency(item.unitPriceCents)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
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
