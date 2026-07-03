import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getAdminBookingById } from "../api/adminBookingDetails";
import type { AdminBooking } from "../types/adminBooking";
import { formatDateTime, formatPrice } from "../lib/format";
import { updateAdminBookingStatus } from "../api/adminBookingStatus";
import { refundBooking } from "../api/adminRefunds";
import QRCode from "../components/QRCode";

function getStatusClasses(status: AdminBooking["status"]) {
    if (status === "CONFIRMED") {
        return "bg-green-950/40 text-green-300";
    }

    if (status === "CANCELLED") {
        return "bg-yellow-950/40 text-yellow-300";
    }

    return "bg-slate-800/40 text-slate-300";
}

function AdminBookingDetailsPage() {
    const { bookingId } = useParams<{ bookingId: string }>();

    const [booking, setBooking] = useState<AdminBooking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const [isCancelling, setIsCancelling] = useState(false);
    const [isRefunding, setIsRefunding] = useState(false);
    const [isRefundFormOpen, setIsRefundFormOpen] = useState(false);
    const [refundReason, setRefundReason] = useState("");
    const [refundFieldError, setRefundFieldError] = useState("");

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

    useEffect(() => {
        loadBooking();
    }, [bookingId]);

    async function handleCancelBooking() {
        if (!booking) return;

        try {
            setIsCancelling(true);
            setError('');

            await updateAdminBookingStatus({
                bookingId: booking.id,
                status: 'CANCELLED',
            })

            setIsRefundFormOpen(false);
            setRefundReason('');
            setRefundFieldError('');

            await loadBooking();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message);

                return;
            }

            setError("Failed to cancel booking");
        } finally {
            setIsCancelling(false);
        }
    }

    async function handleRefund() {
        if (!booking) return;

        if (!refundReason.trim()) {
            setRefundFieldError('Please enter a refund reason');
            return;
        }
        
        try {
            setIsRefunding(true);
            setError('');

            await refundBooking({
                bookingId: booking.id,
                reason: refundReason.trim(),
            })

            setIsRefundFormOpen(false);
            setRefundReason('');
            setRefundFieldError('');

            await loadBooking();
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
                return
            }

            setError('Failed to refund booking');
        } finally {
            setIsRefunding(false)
        }
    }

    if (isLoading) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-sm text-white/80">Loading booking details...</p>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-sm text-red-300">{error}</p>
                </div>
            </section>
        );
    }

    if (!booking) {
        return (
            <section className="space-y-4">
                <Link
                    to="/admin"
                    className="inline-flex rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-sm transition-all hover:bg-white/20"
                >
                    Back to Admin
                </Link>

                <div className="rounded-xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                    <p className="text-sm text-white/80">Booking not found.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="glass-card p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <Link
                            to="/admin"
                            className="inline-flex items-center gap-1 rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
                            style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                        >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
                            </svg>
                            Back to Admin
                        </Link>
            
                        <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                            Booking Details
                        </h1>
            
                        <p className="mt-1 break-all text-sm font-mono-custom" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {booking.id}
                        </p>
                    </div>
            
                    <div className="flex flex-col items-start gap-3 lg:items-end">
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(booking.status)}`}
                            style={{
                                background: booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.1)' : booking.status === "CANCELLED" ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${
                                    booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.25)' : booking.status === "CANCELLED" ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.1)'
                                }`
                            }}
                        >
                            {booking.status}
                        </span>
            
                        {booking.status === "CONFIRMED" && (
                            <div className="flex flex-wrap gap-2 lg:justify-end">
                                <button
                                    type="button"
                                    onClick={() => window.open(
                                        `${import.meta.env.VITE_API_BASE_URL}/bookings/my-bookings/${booking.id}/pdf`
                                    )}
                                    className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10"
                                    style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                                >
                                    Download PDF
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelBooking}
                                    disabled={isCancelling || isRefunding}
                                    className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                                    style={{ borderColor: 'rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}
                                >
                                    {isCancelling ? "Cancelling..." : "Cancel Booking"}
                                </button>
            
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRefundFormOpen(true);
                                        setRefundFieldError("");
                                        setError("");
                                    }}
                                    disabled={isCancelling || isRefunding}
                                    className="rounded-lg px-4 py-2 text-sm font-medium transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                                    style={{
                                        border: '1px solid rgba(212,175,55,0.35)',
                                        background: 'rgba(212,175,55,0.12)',
                                        backdropFilter: 'blur(12px)',
                                        color: '#D4AF37'
                                    }}
                                >
                                    {isRefundFormOpen ? "Refund Form Open" : "Refund Booking"}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isRefundFormOpen && booking.status === "CONFIRMED" && (
                <div className="glass-card p-5">
                    <h2 className="text-base font-semibold" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Refund Booking
                    </h2>
            
                    <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        Enter a reason for the refund.
                    </p>
            
                    <div className="mt-4">
                        <label
                            htmlFor="refundReason"
                            className="mb-2 block text-sm font-medium"
                            style={{ color: 'rgba(255,255,255,0.65)' }}
                        >
                            Refund reason
                        </label>
            
                        <input
                            id="refundReason"
                            type="text"
                            value={refundReason}
                            onChange={(event) => {
                                setRefundReason(event.target.value);
                                setRefundFieldError("");
                            }}
                            placeholder="Enter refund reason"
                            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
                            style={{
                                borderColor: refundFieldError ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.10)',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(8px)',
                                color: 'rgba(255,255,255,0.85)'
                            }}
                        />
            
                        {refundFieldError && (
                            <p className="mt-2 text-sm" style={{ color: '#EF4444' }}>
                                {refundFieldError}
                            </p>
                        )}
                    </div>
            
                    <div className="mt-4 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={handleRefund}
                            disabled={isRefunding}
                            className="rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                            style={{
                                border: '1px solid rgba(212,175,55,0.35)',
                                background: 'rgba(212,175,55,0.12)',
                                backdropFilter: 'blur(12px)',
                                color: '#D4AF37'
                            }}
                        >
                            {isRefunding ? "Refunding..." : "Confirm Refund"}
                        </button>
            
                        <button
                            type="button"
                            onClick={() => {
                                setIsRefundFormOpen(false);
                                setRefundReason("");
                                setRefundFieldError("");
                                setError("");
                            }}
                            disabled={isRefunding}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.60)' }}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="glass-card p-5">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                            Basic Info
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Email
                                </p>
                                <p className="mt-1 break-all text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.email}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Client User ID
                                </p>
                                <p className="mt-1 break-all text-sm font-mono-custom" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.clientUserId || "—"}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Created At
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {formatDateTime(booking.createdAt)}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Refunded At
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.refundedAt ? formatDateTime(booking.refundedAt) : "—"}
                                </p>
                            </div>

                            <div className="rounded-xl p-4 md:col-span-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Refund Reason
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.refundReason || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center py-4">
                        <div className="text-center">
                            <p className="mb-2 text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                Entry Code
                            </p>
                            <QRCode
                                data={`STAMFORD-BRIDGE:${booking.id}:${booking.email}`}
                                size={120}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                            Slot Info
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Slot ID
                                </p>
                                <p className="mt-1 break-all text-sm font-mono-custom" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.slotId}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Start
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {formatDateTime(booking.slot.startAt)}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    End
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {formatDateTime(booking.slot.endAt)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                            Totals
                        </h2>

                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Total Tickets
                                </p>
                                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.qtyTotal}
                                </p>
                            </div>

                            <div className="rounded-xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Total Amount
                                </p>
                                <p className="mt-1 text-sm font-mono-custom" style={{ color: '#D4AF37' }}>
                                    {formatPrice(booking.amountTotalCents)}
                                </p>
                            </div>

                            <div className="rounded-xl p-4 md:col-span-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                                <p className="text-xs font-medium uppercase" style={{ color: 'rgba(255,255,255,0.40)' }}>
                                    Stripe Session ID
                                </p>
                                <p className="mt-1 break-all text-sm font-mono-custom" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    {booking.stripeSessionId || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.40)' }}>
                            Items
                        </h2>

                        <div className="mt-3 overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                            <table className="min-w-full divide-y text-sm" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.03)' }}>
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            Ticket Type
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            Unit Price
                                        </th>
                                        <th className="px-4 py-3 text-left font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                            Subtotal
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                                    {booking.items.map((item, index) => (
                                        <tr key={`${item.ticketTypeId}-${index}`}>
                                            <td className="px-4 py-3 font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                                {item.ticketName || item.ticketTypeId}
                                            </td>
                                            <td className="px-4 py-3" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                                {item.qty}
                                            </td>
                                            <td className="px-4 py-3 font-mono-custom" style={{ color: 'rgba(255,255,255,0.65)' }}>
                                                {formatPrice(item.unitPriceCents)}
                                            </td>
                                            <td className="px-4 py-3 font-semibold font-mono-custom" style={{ color: '#D4AF37' }}>
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