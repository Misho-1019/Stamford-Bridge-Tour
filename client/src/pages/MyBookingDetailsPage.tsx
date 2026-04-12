import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { cancelMyBooking, getMyBookingById, type ClientBooking } from "../api/clientBookings";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";

export default function MyBookingDetailsPage() {
    const { id } = useParams();

    const [booking, setBooking] = useState<ClientBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCancelling, setIsCancelling] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [toast, setToast] =useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        async function loadBooking() {
            if (!id) {
                setToast({ message: 'Invalid booking ID', type: 'error' });
                setIsLoading(false);
                return;
            }

            try {
                const data = await getMyBookingById(id);

                setBooking(data.booking);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load booking';

                setToast({ message, type: 'error' });
            } finally {
                setIsLoading(false);
            }
        }

        loadBooking();
    }, [id])

    async function handleCancel() {
        if (!booking) return;

        try {
            setIsCancelling(true);

            await cancelMyBooking(booking.id);

            setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);

            setToast({ message: 'Booking cancelled successfully', type: 'success' });
            setIsModalOpen(false);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Cancel failed';

            setToast({ message, type: 'error' });
        } finally {
            setIsCancelling(false);
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
        return <div className="text-slate-600">Loading booking...</div>;
    }

    if (!booking) {
        return (
            <div className="text-slate-600">
                Booking not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                to="/my-bookings"
                className="inline-flex text-sm font-medium text-blue-700 hover:underline"
            >
                ← Back to My Bookings
            </Link>

            <h1 className="text-2xl font-semibold text-blue-900">
                Booking Details
            </h1>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
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
                                : booking.status === "REFUNDED"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-600"
                        }`}
                    >
                        {booking.status}
                    </div>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                    <div>
                        <span className="font-medium text-slate-800">
                            Booking date:
                        </span>{" "}
                        {new Date(booking.createdAt).toLocaleString()}
                    </div>

                    <div>
                        <span className="font-medium text-slate-800">
                            Tour date:
                        </span>{" "}
                        {new Date(booking.slot.startAt).toLocaleString()}
                    </div>

                    <div>
                        <span className="font-medium text-slate-800">
                            Email:
                        </span>{" "}
                        {booking.email}
                    </div>
                </div>

                <div className="border-t pt-4">
                    <div className="text-sm font-medium text-slate-800 mb-2">
                        Tickets
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

                <div className="border-t pt-4 text-sm text-slate-600 space-y-1">
                    <div>
                        <span className="font-medium text-slate-800">
                            Total tickets:
                        </span>{" "}
                        {booking.qtyTotal}
                    </div>

                    <div>
                        <span className="font-medium text-slate-800">
                            Total price:
                        </span>{" "}
                        €{(booking.amountTotalCents / 100).toFixed(2)}
                    </div>
                </div>

                {booking.status === "REFUNDED" && (
                    <div className="border-t pt-4 text-sm text-slate-600 space-y-1">
                        <div>
                            <span className="font-medium text-slate-800">
                                Refunded at:
                            </span>{" "}
                            {booking.refundedAt
                                ? new Date(booking.refundedAt).toLocaleString()
                                : "-"}
                        </div>

                        {booking.refundReason && (
                            <div>
                                <span className="font-medium text-slate-800">
                                    Refund reason:
                                </span>{" "}
                                {booking.refundReason}
                            </div>
                        )}
                    </div>
                )}

                {booking.status === "CONFIRMED" && (
                    <div className="border-t pt-4 flex justify-end">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isCancelling}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCancelling ? "Cancelling..." : "Cancel booking"}
                        </button>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                title="Cancel booking"
                message="Are you sure you want to cancel this booking?"
                confirmText="Cancel booking"
                cancelText="Keep booking"
                isLoading={isCancelling}
                onCancel={() => setIsModalOpen(false)}
                onConfirm={handleCancel}
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