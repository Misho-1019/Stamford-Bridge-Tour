import { useEffect, useState } from "react";
import { type ClientBooking, getMyBookings } from "../api/clientBookings";

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState<ClientBooking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        async function loadBookings() {
            try {
                const data = await getMyBookings();

                setBookings(data.bookings);
            } catch (err) {
                const message = err instanceof Error ? err.message : 'Failed to load bookings';

                setError(message)
            } finally {
                setIsLoading(false);
            }
        }

        loadBookings();
    }, [])

    if (isLoading) {
        return <div className="text-slate-600">Loading bookings...</div>;
    }

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="text-slate-600">
                You don’t have any bookings yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h1 className="text-2xl font-semibold text-blue-900">
                My Bookings
            </h1>

            {bookings.map((booking) => (
                <div
                    key={booking.id}
                    className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
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

                        <div className="text-sm font-medium text-blue-900">
                            {booking.status}
                        </div>
                    </div>

                    <div className="mt-4 text-sm text-slate-600">
                        <div>
                            <span className="font-medium text-slate-800">
                                Date:
                            </span>{" "}
                            {new Date(booking.slot.startAt).toLocaleString()}
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
                </div>
            ))}
        </div>
    );
}