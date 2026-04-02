import { useEffect, useState } from "react";
import type { AdminBooking } from "../types/adminBooking";
import { getAdminBookings } from "../api/adminBookings";
import { formatDateTime, formatPrice } from "../lib/format";

type AdminTab = 'bookings' | 'slots' | 'tickets' | 'operations';

function AdminPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>('bookings')

    const [bookings, setBookings] = useState<AdminBooking[]>([])
    const [bookingsPage, setBookingsPage] = useState(1)
    const [bookingsTotalPages, setBookingsTotalPages] = useState(1)
    const [bookingsTotal, setBookingsTotal] = useState(0)
    const [isLoadingBookings, setIsLoadingBookings] = useState(false)
    const [bookingsError, setBookingsError] = useState('')

    useEffect(() => {
        if (activeTab !== 'bookings') {
            return;
        }

        async function loadBookings() {
            try {
                setIsLoadingBookings(true);
                setBookingsError('');

                const data = await getAdminBookings(bookingsPage, 10);

                setBookings(data.bookings);
                setBookingsPage(data.page);
                setBookingsTotalPages(data.totalPages);
                setBookingsTotal(data.total);
            } catch (error) {
                if (error instanceof Error) {
                    setBookingsError(error.message)
                    return;
                }

                setBookingsError('Failed to load bookings')
            } finally {
                setIsLoadingBookings(false);
            }
        }

        loadBookings();
    }, [activeTab, bookingsPage])

    function getStatusClasses(status: AdminBooking['status']) {
        if (status === "CONFIRMED") {
            return "bg-green-100 text-green-700";
        }

        if (status === "CANCELLED") {
            return "bg-yellow-100 text-yellow-800";
        }

        return "bg-slate-200 text-slate-700";
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-blue-900">
                    Admin Dashboard
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                    Manage bookings, slots, ticket types, and tour operations.
                </p>
            </div>

            <div className="rounded-xl bg-white/90 p-3 shadow-sm">
                <div className="flex flex-wrap gap-2">
                    <button
                        type="button"
                        onClick={() => setActiveTab("bookings")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "bookings"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Bookings
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("slots")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "slots"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Slots
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("tickets")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "tickets"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Ticket Types
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab("operations")}
                        className={`rounded px-4 py-2 text-sm font-medium ${
                            activeTab === "operations"
                                ? "bg-blue-700 text-white"
                                : "bg-slate-100 hover:bg-slate-200"
                        }`}
                    >
                        Operations
                    </button>
                </div>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-md">
                {activeTab === "bookings" && (
                    <div className="space-y-4">
                        <div>
                            <h2 className="text-lg font-semibold text-blue-900">
                                Bookings
                            </h2>
                            <p className="mt-1 text-sm text-slate-600">
                                Total bookings: {bookingsTotal}
                            </p>
                        </div>

                        {isLoadingBookings && (
                            <p className="text-sm text-slate-600">
                                Loading bookings...
                            </p>
                        )}

                        {bookingsError && (
                            <p className="text-sm text-red-600">
                                {bookingsError}
                            </p>
                        )}

                        {!isLoadingBookings &&
                            !bookingsError &&
                            bookings.length === 0 && (
                                <p className="text-sm text-slate-600">
                                    No bookings found.
                                </p>
                            )}

                        {!isLoadingBookings &&
                            !bookingsError &&
                            bookings.length > 0 && (
                                <>
                                    <div className="space-y-3">
                                        {bookings.map((booking) => (
                                            <div
                                                key={booking.id}
                                                className="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm"
                                            >
                                                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                                                    <div className="space-y-2">
                                                        <p className="font-semibold text-slate-900">
                                                            {booking.email}
                                                        </p>

                                                        <p className="text-sm text-slate-600">
                                                            Booking ID: {booking.id}
                                                        </p>

                                                        <p className="text-sm text-slate-600">
                                                            Slot:{" "}
                                                            {formatDateTime(
                                                                booking.slot.startAt
                                                            )}{" "}
                                                            -{" "}
                                                            {formatDateTime(
                                                                booking.slot.endAt
                                                            )}
                                                        </p>

                                                        <p className="text-sm text-slate-600">
                                                            Created:{" "}
                                                            {formatDateTime(
                                                                booking.createdAt
                                                            )}
                                                        </p>

                                                        <p className="text-sm text-slate-600">
                                                            Tickets: {booking.qtyTotal}
                                                        </p>

                                                        <p className="text-sm font-medium text-slate-800">
                                                            Total:{" "}
                                                            {formatPrice(
                                                                booking.amountTotalCents
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col items-start gap-2 md:items-end">
                                                        <span
                                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                                                                booking.status
                                                            )}`}
                                                        >
                                                            {booking.status}
                                                        </span>

                                                        {booking.refundReason && (
                                                            <p className="max-w-xs text-sm text-slate-600">
                                                                Refund reason:{" "}
                                                                {booking.refundReason}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingsPage((prev) =>
                                                    Math.max(1, prev - 1)
                                                )
                                            }
                                            disabled={bookingsPage === 1}
                                            className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Previous
                                        </button>

                                        <p className="text-sm text-slate-600">
                                            Page {bookingsPage} of {bookingsTotalPages}
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBookingsPage((prev) =>
                                                    Math.min(
                                                        bookingsTotalPages,
                                                        prev + 1
                                                    )
                                                )
                                            }
                                            disabled={
                                                bookingsPage === bookingsTotalPages
                                            }
                                            className="rounded bg-slate-100 px-4 py-2 text-sm font-medium hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </>
                            )}
                    </div>
                )}

                {activeTab === "slots" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Slots
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Slot management will appear here.
                        </p>
                    </div>
                )}

                {activeTab === "tickets" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Ticket Types
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Ticket configuration will appear here.
                        </p>
                    </div>
                )}

                {activeTab === "operations" && (
                    <div>
                        <h2 className="text-lg font-semibold text-blue-900">
                            Operations
                        </h2>
                        <p className="mt-2 text-sm text-slate-600">
                            Refunds and admin actions will appear here.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default AdminPage;