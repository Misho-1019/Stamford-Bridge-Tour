import { useEffect, useState } from "react";
import { cancelMyBooking, type ClientBooking, getMyBookings } from "../api/clientBookings";
import { Link } from "react-router";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<ClientBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [bookingToCancelId, setBookingToCancelId] = useState<string | null>(null);

    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    
    useEffect(() => {
        async function loadBookings() {
            try {
                const data = await getMyBookings();

                setBookings(data.bookings);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load bookings';

                setToast({ message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }

        loadBookings();
    }, [])

    async function handleCancel(bookingId: string) {

        try {
            setCancellingId(bookingId);

            await cancelMyBooking(bookingId)

            setBookingToCancelId(null);

            setBookings((prev) => prev.map(booking => booking.id === bookingId ? { ...booking, status: 'CANCELLED' } : booking))

            setToast({ message: 'Booking cancelled successfully.', type: 'success' })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to cancel booking';

            setToast({ message, type: 'error' });
        } finally {
            setCancellingId(null);
        }
    }

    useEffect(() => {
        if (!toast) return;

        const timer = setTimeout(() => {
            setToast(null);
        }, 3000)

        return () => clearTimeout(timer);
    }, [toast])

    if (isLoading) {
        return <div className="text-slate-600">Loading bookings...</div>;
    }

    if (bookings.length === 0) {
        return (
            <div className="text-center text-slate-600">
                <p>You don’t have any bookings yet.</p>
                <p className="mt-2">
                    <Link to="/book" className="text-blue-700 hover:underline">
                        Book your first tour
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-blue-900">
                My Bookings
            </h1>

            {bookings.filter(Boolean).map((booking) => (
                <Link
                    key={booking.id}
                    to={`/my-bookings/${booking.id}`}
                    className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm text-slate-500">
                                Booking ID
                            </div>
                            <div className="font-medium text-slate-900">
                                {booking.id}
                            </div>
                        </div>

                        <div
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                booking.status === "CONFIRMED"
                                    ? "bg-green-100 text-green-700"
                                    : booking.status === "CANCELLED"
                                    ? "bg-red-100 text-red-600"
                                    : "bg-slate-100 text-slate-600"
                            }`}
                        >
                            {booking.status}
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-600">
                        <div>
                            <span className="font-medium text-slate-800">
                                Date:
                            </span>{" "}
                            {new Date(booking.slot.startAt).toLocaleString(undefined, {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            })}
                        </div>

                        <div>
                            <span className="font-medium text-slate-800">
                                Tickets:
                            </span>{" "}
                            {booking.qtyTotal}
                        </div>

                        <div>
                            <span className="font-medium text-slate-800">
                                Total:
                            </span>{" "}
                            €{(booking.amountTotalCents / 100).toFixed(2)}
                        </div>
                    </div>

                    <div className="mt-4 border-t pt-3">
                        <div className="text-sm font-medium text-slate-800 mb-2">
                            Items
                        </div>

                        <div className="space-y-1 text-sm text-slate-600">
                            {booking.items.map((item, index) => (
                                <div key={index}>
                                    {item.ticketName} × {item.qty} — €
                                    {(item.unitPriceCents / 100).toFixed(2)}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                        {booking.status === "CONFIRMED" && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setBookingToCancelId(booking.id);
                                }}
                                disabled={cancellingId === booking.id}
                                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {cancellingId === booking.id
                                    ? "Cancelling..."
                                    : "Cancel booking"}
                            </button>
                        )}
                    </div>
                </Link>
            ))}

            <ConfirmModal
                isOpen={bookingToCancelId !== null}
                title="Cancel booking"
                message="Are you sure you want to cancel this booking?"
                confirmText="Cancel booking"
                cancelText="Keep booking"
                isLoading={bookingToCancelId !== null && cancellingId === bookingToCancelId}
                onCancel={() => setBookingToCancelId(null)}
                onConfirm={() => {
                    if (bookingToCancelId) {
                        handleCancel(bookingToCancelId);
                    }
                }}
            />

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}