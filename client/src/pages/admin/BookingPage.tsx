import { useEffect, useState } from "react";
import { getAdminBooking, getAdminBookingById, updateAdminBookingStatus, type AdminBooking, type AdminBookingDetails } from "../../lib/api/admin";
import Card from "../../components/admin/Card";
import Badge from "../../components/admin/Badge";
import LoadingSkeleton from "../../components/admin/LoadingSkeleton";
import EmptyState from "../../components/admin/EmptyState";


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

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState('')
  const [emailFilter, setEmailFilter] = useState('')

  async function loadBookings(currentPage: number) {
      try {
        setLoading(true);
        setError(null);

        const data = await getAdminBooking({ 
          page: currentPage, 
          limit: 10,
          status: statusFilter || undefined,
          email: emailFilter || undefined,
        });

        setBookings(data.bookings);        
        setPage(data.page);
        setTotalPages(data.totalPages)
      } catch (err) {
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    loadBookings(1);
  }, []);

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

      await loadBookings(page)
    } catch (err) {
      setDetailsError('Failed to update booking status')
    } finally {
      setStatusUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#003399]">Bookings</h2>
        <p className="mt-1 text-sm text-slate-700">
          Manage tour bookings, statuses, and booking details.
        </p>
      </div>

      <Card className="!bg-white/90 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {/* Status */}
          <div className="flex flex-col flex-1 max-w-[200px]">
            <label className="mb-1.5 text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
            >
              <option value="">All Statuses</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        
          {/* Email */}
          <div className="flex flex-col flex-1 max-w-[250px]">
            <label className="mb-1.5 text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="text"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
              placeholder="Search email..."
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
            />
          </div>
        
          <div className="flex gap-2">
            {/* Apply */}
            <button
              onClick={() => loadBookings(1)}
              className="rounded-lg px-5 py-2 text-sm font-medium text-white shadow-sm transition-all flex items-center justify-center min-w-[100px] bg-[#003399] hover:bg-[#002266]"
            >
              Apply
            </button>
          
            {/* Reset */}
            <button
              onClick={() => {
                setStatusFilter('');
                setEmailFilter('');
                loadBookings(1);
              }}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              Reset
            </button>
          </div>
        </div>
      </Card>
    
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Table Column */}
        <div className="lg:col-span-2 space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <LoadingSkeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : bookings.length === 0 && !error ? (
            <EmptyState 
              title="No Bookings Found" 
              description="Adjust your search filters to find bookings." 
            />
          ) : (
            <Card className="!bg-white/95 backdrop-blur-sm overflow-hidden p-0 !p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-6 py-4 font-medium text-slate-600">Email</th>
                      <th className="px-6 py-4 font-medium text-slate-600">Date</th>
                      <th className="px-6 py-4 font-medium text-slate-600">Tickets</th>
                      <th className="px-6 py-4 font-medium text-slate-600">Amount</th>
                      <th className="px-6 py-4 font-medium text-slate-600">Status</th>
                    </tr>
                  </thead>
            
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {bookings.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => handleSelectBooking(b.id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                          selectedBookingId === b.id ? 'bg-blue-50/60 hover:bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-4 text-slate-900">{b.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-center sm:text-left">
                          {b.qtyTotal}
                        </td>
                        <td className="px-6 py-4 text-slate-900 font-medium">
                          {formatCurrency(b.amountTotalCents)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {(!loading && !error && bookings.length > 0) && (
            <div className="flex items-center justify-between mt-6">
              <button
                disabled={page === 1}
                onClick={() => loadBookings(page - 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
            
              <p className="text-sm font-medium text-slate-600">
                Page <span className="text-slate-900">{page}</span> of {totalPages}
              </p>
            
              <button
                disabled={page === totalPages}
                onClick={() => loadBookings(page + 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Details Panel Column */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
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
                  <p className="font-medium text-slate-900 break-all">{selectedBooking.email}</p>
                </div>
        
                <div className="col-span-full">
                  <p className="text-sm text-slate-500 mb-1">Status</p>
                  <div>
                    <Badge status={selectedBooking.status} />
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <p className="text-sm font-medium text-slate-700 mb-3">Actions</p>
                  
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
        </Card>
      </div>
    </div>
  </div>
);
}

export default BookingsPage;
