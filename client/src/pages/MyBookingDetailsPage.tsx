import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { cancelMyBooking, getMyBookingById, type ClientBooking } from "../api/clientBookings";

export default function MyBookingDetailsPage() {
    const { id } = useParams();

    const [booking, setBooking] = useState<ClientBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [isCancelling, setIsCancelling] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        async function loadBooking() {
            if (!id) {
                setError('Invalid booking ID');
                setIsLoading(false);
                return;
            }

            try {
                const data = await getMyBookingById(id);

                setBooking(data.booking);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to load booking';

                setError(message);
            } finally {
                setIsLoading(false);
            }
        }

        loadBooking();
    }, [id])

    async function handleCancel() {
        if (!booking) return;

        const confirmed = window.confirm('Are you sure you want to cancel this booking?')

        if (!confirmed) return;

        setError('')
        setSuccessMessage('');

        try {
            setIsCancelling(true);

            await cancelMyBooking(booking.id);

            setBooking(prev => prev ? { ...prev, status: 'CANCELLED' } : prev);

            setSuccessMessage('Booking cancelled successfully');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Cancel failed';

            setError(message);
        } finally {
            setIsCancelling(false);
        }
    }

    if (isLoading) {
        return <div className="text-slate-600">Loading booking...</div>;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
        );
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

            {successMessage ? (
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                    {successMessage}
                </div>
            ) : null}
            
            {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            ) : null}

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
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isCancelling ? "Cancelling..." : "Cancel booking"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}