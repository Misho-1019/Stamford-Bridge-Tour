import { useEffect, useState } from "react";
import {
  getAdminBooking,
  getAdminBookingById,
  updateAdminBookingStatus,
  type AdminBooking,
  type AdminBookingDetails,
} from "../../lib/api/admin";
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

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null,
  );
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [isRefundFormVisible, setIsRefundFormVisible] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [statusFilter, setStatusFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");

  async function loadBookings(
    currentPage: number,
    overrides?: { status?: string; email?: string },
  ) {
    try {
      setLoading(true);
      setError(null);

      const resolvedStatus =
        overrides && "status" in overrides
          ? overrides.status || undefined
          : statusFilter || undefined;

      const resolvedEmail =
        overrides && "email" in overrides
          ? overrides.email || undefined
          : emailFilter || undefined;

      const data = await getAdminBooking({
        page: currentPage,
        limit: 10,
        status: resolvedStatus,
        email: resolvedEmail,
      });

      setBookings(data.bookings);
      setPage(data.page);
      setTotalPages(data.totalPages);
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
      setIsRefundFormVisible(false);
      setRefundReason("");
      setRefundAmount("");
      setSelectedBookingId(id);
      setDetailsLoading(true);
      setDetailsError(null);

      const data = await getAdminBookingById(id);
      setSelectedBooking(data.booking);
    } catch (err) {
      setDetailsError("Failed to load booking details");
      setSelectedBooking(null);
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleUpdateStatus(
    nextStatus: "CONFIRMED" | "CANCELLED" | "REFUNDED",
    options?: { reason?: string; amountCents?: number },
  ) {
    if (!selectedBooking) return;

    try {
      setStatusUpdating(true);
      setDetailsError(null);

      const data = await updateAdminBookingStatus(
        selectedBooking.id,
        nextStatus,
        options,
      );
      setSelectedBooking(data.booking);

      await loadBookings(page);
      setIsRefundFormVisible(false);
      setRefundReason("");
      setRefundAmount("");
    } catch (err) {
      setDetailsError(
        err instanceof Error ? err.message : "Failed to update booking status",
      );
    } finally {
      setStatusUpdating(false);
    }
  }

  function handleRefundSubmit() {
    const trimmedReason = refundReason.trim();

    if (!trimmedReason) {
      setDetailsError("Refund reason is required");
      return;
    }

    let cents: number | undefined = undefined;

    if (refundAmount.trim()) {
      const parsedAmount = Number(refundAmount);

      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
        setDetailsError("Refund amount must be a valid positive number");
        return;
      }

      cents = Math.round(parsedAmount * 100);
    }

    setDetailsError(null);
    handleUpdateStatus("REFUNDED", {
      reason: trimmedReason,
      amountCents: cents,
    });
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
          <div className="flex max-w-[200px] flex-1 flex-col">
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

          <div className="flex max-w-[250px] flex-1 flex-col">
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
            <button
              onClick={() => loadBookings(1)}
              className="flex min-w-[100px] items-center justify-center rounded-lg bg-[#003399] px-5 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-[#002266]"
            >
              Apply
            </button>

            <button
              onClick={() => {
                setStatusFilter("");
                setEmailFilter("");
                loadBookings(1, { status: "", email: "" });
              }}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              Reset
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
            <Card className="!bg-white/95 overflow-hidden !p-0 p-0 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-left">
                      <th className="px-6 py-4 font-medium text-slate-600">
                        Email
                      </th>
                      <th className="px-6 py-4 font-medium text-slate-600">
                        Date
                      </th>
                      <th className="px-6 py-4 font-medium text-slate-600">
                        Tickets
                      </th>
                      <th className="px-6 py-4 font-medium text-slate-600">
                        Amount
                      </th>
                      <th className="px-6 py-4 font-medium text-slate-600">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {bookings.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => handleSelectBooking(b.id)}
                        className={`cursor-pointer transition-colors hover:bg-slate-50 ${
                          selectedBookingId === b.id
                            ? "bg-blue-50/60 hover:bg-blue-50"
                            : ""
                        }`}
                      >
                        <td className="px-6 py-4 text-slate-900">{b.email}</td>
                        <td className="px-6 py-4 text-slate-600">
                          {new Date(b.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center text-slate-600 sm:text-left">
                          {b.qtyTotal}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
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

          {!loading && !error && bookings.length > 0 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                disabled={page === 1}
                onClick={() => loadBookings(page - 1)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>

              <p className="text-sm font-medium text-slate-600">
                Page <span className="text-slate-900">{page}</span> of{" "}
                {totalPages}
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
              <p className="mt-3 text-sm text-slate-600">
                Loading booking details...
              </p>
            )}

            {detailsError && (
              <p className="mt-3 text-sm text-red-600">{detailsError}</p>
            )}

            {selectedBooking && !detailsLoading && (
              <div className="mt-4 space-y-4 text-sm">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-slate-500">Email</p>
                    <p className="break-all font-medium text-slate-900">
                      {selectedBooking.email}
                    </p>
                  </div>

                  <div className="col-span-full">
                    <p className="mb-1 text-sm text-slate-500">Status</p>
                    <div>
                      <Badge status={selectedBooking.status} />
                    </div>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-3 text-sm font-medium text-slate-700">
                        Actions
                      </p>

                      {isRefundFormVisible ? (
                        <div className="mt-2 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <h4 className="text-sm font-semibold text-slate-800">
                            Process Refund
                          </h4>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">
                              Reason
                            </label>
                            <input
                              type="text"
                              value={refundReason}
                              onChange={(e) => setRefundReason(e.target.value)}
                              required
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                            />
                          </div>

                          <div>
                            <label className="mb-1 block text-xs font-medium text-slate-700">
                              Amount (optional)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              placeholder="e.g. 50.00"
                              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-[#003399] focus:ring-1 focus:ring-[#003399]"
                            />
                          </div>

                          <div className="mt-4 flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setIsRefundFormVisible(false);
                                setRefundReason("");
                                setRefundAmount("");
                                setDetailsError(null);
                              }}
                              type="button"
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 hover:text-slate-900"
                            >
                              Cancel
                            </button>

                            <button
                              onClick={handleRefundSubmit}
                              disabled={!refundReason.trim() || statusUpdating}
                              type="button"
                              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusUpdating
                                ? "Processing..."
                                : "Confirm Refund"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {selectedBooking.status === "CONFIRMED" && (
                            <>
                              <button
                                type="button"
                                disabled={statusUpdating}
                                onClick={() => handleUpdateStatus("CANCELLED")}
                                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {statusUpdating
                                  ? "Updating..."
                                  : "Cancel Booking"}
                              </button>

                              <button
                                type="button"
                                disabled={statusUpdating}
                                onClick={() => {
                                  setDetailsError(null);
                                  setIsRefundFormVisible(true);
                                }}
                                className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {statusUpdating
                                  ? "Updating..."
                                  : "Mark Refunded"}
                              </button>
                            </>
                          )}

                          {selectedBooking.status === "CANCELLED" && (
                            <button
                              type="button"
                              disabled={statusUpdating}
                              onClick={() => {
                                setDetailsError(null);
                                setIsRefundFormVisible(true);
                              }}
                              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {statusUpdating ? "Updating..." : "Mark Refunded"}
                            </button>
                          )}

                          {selectedBooking.status === "REFUNDED" && (
                            <p className="text-sm text-slate-500">
                              No actions available for refunded bookings.
                            </p>
                          )}
                        </div>
                      )}
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
                      {selectedBooking.stripeSessionId ?? "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-500">Payment Intent ID</p>
                    <p className="break-all font-medium text-slate-900">
                      {selectedBooking.stripePaymentIntentId ?? "—"}
                    </p>
                  </div>

                  {selectedBooking.stripeRefundId && (
                    <div>
                      <p className="text-slate-500">Refund ID</p>
                      <p className="break-all font-medium text-slate-900">
                        {selectedBooking.stripeRefundId}
                      </p>
                    </div>
                  )}

                  {selectedBooking.refundedAt && (
                    <div>
                      <p className="text-slate-500">Refunded At</p>
                      <p className="font-medium text-slate-900">
                        {new Date(selectedBooking.refundedAt).toLocaleString()}
                      </p>
                    </div>
                  )}

                  {selectedBooking.refundReason && (
                    <div className="col-span-full">
                      <p className="text-slate-500">Refund Reason</p>
                      <p className="font-medium text-slate-900">
                        {selectedBooking.refundReason}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="text-slate-500">Slot</p>
                  <p className="font-medium text-slate-900">
                    {new Date(selectedBooking.slot.startAt).toLocaleString()} -{" "}
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
