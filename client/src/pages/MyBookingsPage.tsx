import { useEffect, useState } from "react";
import { cancelMyBooking, type ClientBooking, getMyBookings } from "../api/clientBookings";
import { Link } from "react-router";
import ConfirmModal from "../components/ConfirmModal";
import Toast from "../components/Toast";
import { SkeletonCard } from "../components/Skeleton";
import EmptyState from "../components/EmptyState";

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
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>My Bookings</h1>
                <div className="space-y-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="space-y-4">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>My Bookings</h1>
                <EmptyState
                    title="No bookings yet"
                    message="You haven't booked any tours yet. Start exploring available slots and book your Stamford Bridge experience."
                    actionLabel="Book a Tour"
                    actionTo="/book"
                />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <header className="mb-2">
                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                    My Bookings
                </h1>
                <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Manage your upcoming Stamford Bridge experiences.
                </p>
            </header>

            {bookings.filter(Boolean).map((booking) => (
                <Link
                    key={booking.id}
                    to={`/my-bookings/${booking.id}`}
                    className="block glass-card p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[rgba(212,175,55,0.15)]"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-xs font-mono-custom uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                ID: STB-{booking.id.slice(0, 4)}...
                            </div>
                        </div>

                        <div
                            className="px-3 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                            style={{
                                background: booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.1)' : booking.status === "CANCELLED" ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                border: `1px solid ${
                                    booking.status === "CONFIRMED" ? 'rgba(34,197,94,0.25)' : booking.status === "CANCELLED" ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.1)'
                                }`,
                                color: booking.status === "CONFIRMED" ? '#22C55E' : booking.status === "CANCELLED" ? '#EF4444' : 'rgba(255,255,255,0.50)'
                            }}
                        >
                            {booking.status}
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-4 text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {new Date(booking.slot.startAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                            })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(booking.slot.startAt).toLocaleTimeString("en-US", {
                                hour: "numeric",
                                minute: "2-digit",
                            })}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            {booking.qtyTotal} {booking.qtyTotal === 1 ? "Ticket" : "Tickets"}
                        </div>
                    </div>

                    <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.70)' }}>
                                Items
                            </span>
                            <span className="font-mono-custom text-lg font-bold" style={{ color: '#D4AF37' }}>£{(booking.amountTotalCents / 100).toFixed(2)}</span>
                        </div>
                        <div className="mt-2 space-y-1 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                            {booking.items.map((item, index) => (
                                <div key={index} className="flex justify-between">
                                    <span>{item.ticketName} × {item.qty}</span>
                                    <span className="font-mono-custom">£{(item.unitPriceCents / 100).toFixed(2)}</span>
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
                                className="rounded-lg border px-4 py-2 text-sm font-medium transition-all hover:bg-white/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    borderColor: 'rgba(239,68,68,0.25)',
                                    background: 'rgba(239,68,68,0.08)',
                                    color: '#EF4444'
                                }}
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

            {/* Footer */}
            <footer className="mt-6 border-t pb-2 pt-4" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
                    <span className="text-xs font-bold tracking-wider" style={{ color: '#003399', fontFamily: 'JetBrains Mono, monospace' }}>CHELSEA FC</span>
                    <div className="flex gap-4">
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.30)' }}>Privacy Policy</span>
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.30)' }}>Terms of Service</span>
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.30)' }}>Contact Us</span>
                        <span className="text-xs transition-colors hover:opacity-80" style={{ color: 'rgba(255,255,255,0.30)' }}>Support</span>
                    </div>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.20)' }}>&copy; 2026 CHELSEA FC. ALL RIGHTS RESERVED.</span>
                </div>
            </footer>
        </div>
    );
}