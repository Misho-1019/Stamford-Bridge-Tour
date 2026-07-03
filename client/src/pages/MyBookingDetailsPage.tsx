import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { cancelMyBooking, getMyBookingById, type ClientBooking } from "../api/clientBookings";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import QRCode from "../components/QRCode";

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
        return <div className="text-white/80">Loading booking...</div>;
    }

    if (!booking) {
        return (
            <div className="text-white/80">
                Booking not found.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Link
                to="/my-bookings"
                className="inline-flex items-center gap-1 text-sm font-medium transition-colors hover:underline"
                style={{ color: '#4DA3FF' }}
            >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
                Back to My Bookings
            </Link>

            <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                Booking Details
            </h1>

            <div className="glass-card p-6 space-y-4 relative overflow-hidden">
                {/* Gold pulsing left accent */}
                <div className="absolute left-0 top-0 h-full w-1 animate-gold-pulse" style={{ backgroundColor: '#D4AF37' }} />

                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-xs font-mono-custom uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            BOOKING REFERENCE
                        </div>
                        <div className="font-medium font-mono-custom text-sm" style={{ color: 'rgba(255,255,255,0.90)' }}>
                            STB-{booking.id.slice(0, 6)}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{
                        background: booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.1)' : booking.status === "CANCELLED" ? 'rgba(239,68,68,0.1)' : booking.status === "REFUNDED" ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${
                            booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.25)' : booking.status === "CANCELLED" ? 'rgba(239,68,68,0.25)' : booking.status === "REFUNDED" ? 'rgba(234,179,8,0.25)' : 'rgba(255,255,255,0.1)'
                        }`
                    }}>
                        {booking.status === "CONFIRMED" && (
                            <span className="h-1.5 w-1.5 rounded-full animate-gold-pulse" style={{ backgroundColor: '#D4AF37' }} />
                        )}
                        <span className="text-xs font-semibold font-mono-custom tracking-wider" style={{
                            color: booking.status === "CONFIRMED" ? '#22C55E' : booking.status === "CANCELLED" ? '#EF4444' : booking.status === "REFUNDED" ? '#EAB308' : 'rgba(255,255,255,0.50)'
                        }}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                <div className="flex justify-center py-2">
                    <QRCode
                        data={`STAMFORD-BRIDGE:${booking.id}:${booking.email}`}
                        size={120}
                    />
                </div>

                <div className="text-sm space-y-1" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    <div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                            Booking date:
                        </span>{" "}
                        {new Date(booking.createdAt).toLocaleString()}
                    </div>

                    <div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                            Tour date:
                        </span>{" "}
                        {new Date(booking.slot.startAt).toLocaleString()}
                    </div>

                    <div>
                        <span className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                            Email:
                        </span>{" "}
                        {booking.email}
                    </div>
                </div>

                <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="text-sm font-medium mb-2" style={{ color: 'rgba(255,255,255,0.80)' }}>
                        Tickets
                    </div>

                    <div className="space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        {booking.items.map((item, index) => (
                            <div key={index} className="flex justify-between">
                                <span>{item.ticketName} × {item.qty}</span>
                                <span className="font-mono-custom" style={{ color: 'rgba(255,255,255,0.80)' }}>£{(item.unitPriceCents / 100).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.80)' }}>Total Amount Paid</span>
                    <span className="text-xl font-bold font-mono-custom" style={{ color: '#D4AF37' }}>£{(booking.amountTotalCents / 100).toFixed(2)}</span>
                </div>

                {/* Cancellation Policy */}
                <div className="rounded-lg p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.40)' }}>
                        <svg className="mr-1 inline-block h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        Cancellation Policy: Full refund available if cancelled at least 24 hours prior to tour start time. Transaction fees are non-refundable.
                    </p>
                </div>

                {booking.status === "REFUNDED" && (
                    <div className="pt-4 text-sm space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.60)' }}>
                        <div>
                            <span className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                Refunded at:
                            </span>{" "}
                            {booking.refundedAt
                                ? new Date(booking.refundedAt).toLocaleString()
                                : "-"}
                        </div>

                        {booking.refundReason && (
                            <div>
                                <span className="font-medium" style={{ color: 'rgba(255,255,255,0.80)' }}>
                                    Refund reason:
                                </span>{" "}
                                {booking.refundReason}
                            </div>
                        )}
                    </div>
                )}

                {booking.status === "CONFIRMED" && (
                    <div className="pt-4 flex flex-wrap justify-end gap-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <button
                            type="button"
                            onClick={() => window.open(
                                `${import.meta.env.VITE_API_BASE_URL}/bookings/my-bookings/${booking.id}/pdf`
                            )}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95"
                            style={{ borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.70)' }}
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={isCancelling}
                            className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                            style={{
                                borderColor: 'rgba(239,68,68,0.25)',
                                background: 'rgba(239,68,68,0.08)',
                                color: '#EF4444'
                            }}
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