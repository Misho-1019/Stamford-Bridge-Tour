import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAdminBookingById } from "../api/adminBookingDetails";
import type { AdminBooking } from "../types/adminBooking";
import { formatDateTime, formatPrice } from "../lib/format";

function getStatusClasses(status: AdminBooking["status"]) {
    if (status === "CONFIRMED") {
        return "bg-green-100 text-green-700";
    }

    if (status === "CANCELLED") {
        return "bg-yellow-100 text-yellow-800";
    }

    return "bg-slate-200 text-slate-700";
}

function AdminBookingDetailsPage() {
    const { bookingId } = useParams<{ bookingId: string }>();

    const [booking, setBooking] = useState<AdminBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadBooking() {
            if (!bookingId) {
                setError("Missing booking ID");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError("");

                const data = await getAdminBookingById(bookingId);
                setBooking(data.booking);
            } catch (error) {
                if (error instanceof Error) {
                    setError(error.message);
                } else {
                    setError("Failed to load booking details");
                }
            } finally {
                setIsLoading(false);
            }
        }

        loadBooking();
    }, [bookingId]);

    if (isLoading) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl bg-white/95 p-5 shadow-md">
                    <p className="text-sm text-slate-600">Loading booking details...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl bg-white/95 p-5 shadow-md">
                    <p className="text-sm text-red-600">{error}</p>
                </div>
            </section>
        );
    }

    if (!booking) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl bg-white/95 p-5 shadow-md">
                    <p className="text-sm text-slate-600">Booking not found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <Link
                        to="/admin"
                        className="inline-flex rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                    >
                        Back to Admin
                    </Link>

                    <h1 className="mt-4 text-2xl font-semibold text-blue-900">
                        Booking Details
                    </h1>

                    <p className="mt-1 text-sm text-slate-600 break-all">
                        Booking ID: {booking.id}
                    </p>
                </div>

                <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                        booking.status
                    )}`}
                >
                    {booking.status}
                </span>
            </div>

            <div className="rounded-xl bg-white/95 p-5 shadow-md">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Basic Info
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Email
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-900">
                                    {booking.email}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Client User ID
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-900">
                                    {booking.clientUserId || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Created At
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {formatDateTime(booking.createdAt)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Refunded At
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {booking.refundedAt ? formatDateTime(booking.refundedAt) : "—"}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Refund Reason
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {booking.refundReason || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Slot Info
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Slot ID
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-900">
                                    {booking.slotId}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Start
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {formatDateTime(booking.slot.startAt)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    End
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {formatDateTime(booking.slot.endAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Totals
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Total Tickets
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {booking.qtyTotal}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Total Amount
                                </p>
                                <p className="mt-1 text-sm text-slate-900">
                                    {formatPrice(booking.amountTotalCents)}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
                                <p className="text-xs font-medium uppercase text-slate-500">
                                    Stripe Session ID
                                </p>
                                <p className="mt-1 break-all text-sm text-slate-900">
                                    {booking.stripeSessionId || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                            Items
                        </h2>

                        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                                            Ticket Type
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-200 bg-white">
                                    {booking.items.map((item, index) => (
                                        <tr key={`${item.ticketTypeId}-${index}`}>
                                            <td className="px-4 py-3 text-slate-700">
                                                {item.ticketTypeId}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {item.qty}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {formatPrice(item.unitPriceCents)}
                                            </td>
                                            <td className="px-4 py-3 text-slate-700">
                                                {formatPrice(item.qty * item.unitPriceCents)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default AdminBookingDetailsPage;