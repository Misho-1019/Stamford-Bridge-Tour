import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { getBookingBySession } from "../api/clientBookings";

const POLL_INTERVAL = 2000;
const POLL_TIMEOUT = 30000;

function CheckoutSuccessPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    const [status, setStatus] = useState<"polling" | "confirmed" | "error">(
        sessionId ? "polling" : "error"
    );
    const [secondsLeft, setSecondsLeft] = useState(5);
    const pollingRef = useRef(true);

    useEffect(() => {
        if (!sessionId) {
            setStatus("error");
            return;
        }

        const startedAt = Date.now();

        const interval = setInterval(async () => {
            if (!pollingRef.current) return;

            try {
                const data = await getBookingBySession(sessionId);

                if (data.status === "CONFIRMED") {
                    pollingRef.current = false;
                    clearInterval(interval);
                    setStatus("confirmed");
                    return;
                }

                if (["CANCELLED", "REFUNDED"].includes(data.status)) {
                    pollingRef.current = false;
                    clearInterval(interval);
                    setStatus("error");
                    return;
                }

                if (Date.now() - startedAt > POLL_TIMEOUT) {
                    pollingRef.current = false;
                    clearInterval(interval);
                    setStatus("error");
                }
            } catch {
                if (Date.now() - startedAt > POLL_TIMEOUT) {
                    pollingRef.current = false;
                    clearInterval(interval);
                    setStatus("error");
                }
            }
        }, POLL_INTERVAL);

        return () => {
            pollingRef.current = false;
            clearInterval(interval);
        };
    }, [sessionId]);

    useEffect(() => {
        if (status !== "confirmed") return;

        const redirectTimer = setTimeout(() => {
            navigate("/my-bookings");
        }, 5000);

        const countdownTimer = setInterval(() => {
            setSecondsLeft((prev) => (prev <= 1 ? 0 : prev - 1));
        }, 1000);

        return () => {
            clearTimeout(redirectTimer);
            clearInterval(countdownTimer);
        };
    }, [status, navigate]);

    if (status === "polling") {
        return (
            <div className="mx-auto w-full max-w-[500px]">
                <div className="glass-card p-12 shadow-2xl text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ border: '1.5px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)' }}>
                        <svg className="h-10 w-10 animate-gold-pulse" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Confirming Your Booking
                    </h1>
                    <p className="mt-2" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Please wait while we confirm your payment and create your booking.
                    </p>
                    <p className="mt-6 text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        This should only take a few seconds.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="mx-auto w-full max-w-[500px]">
                <div className="glass-card p-12 shadow-2xl text-center">
                    <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ border: '1.5px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.08)' }}>
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Payment Received
                    </h1>
                    <p className="mt-2" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Your payment was successful, but we're still confirming your booking.
                    </p>
                    <p className="mt-4 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Check your bookings in a few minutes. If it doesn't appear, contact support with your session ID:{" "}
                        <code className="rounded px-2 py-0.5 text-xs font-mono" style={{ background: 'rgba(255,255,255,0.06)', color: '#D4AF37' }}>{sessionId}</code>
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <Link
                            to="/my-bookings"
                            className="group inline-flex items-center gap-2 rounded-xl border px-6 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                            style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', color: '#D4AF37' }}
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-3v.75m0-3v.75m0-3v.75m0-3V6M6 18h12a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6a2.25 2.25 0 00-2.25 2.25v9A2.25 2.25 0 006 18z" />
                            </svg>
                            View My Bookings
                        </Link>
                        <Link
                            to="/book"
                            className="inline-flex items-center justify-center rounded-xl border px-6 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                            style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                        >
                            Book Another Tour
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[500px]">
            <div className="glass-card p-12 shadow-2xl flex flex-col items-center text-center">
                <div className="group relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-full" style={{ border: '1.5px solid #D4AF37', background: 'rgba(212,175,55,0.08)' }}>
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'rgba(212,175,55,0.1)' }} />
                    <svg className="relative h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                    Payment Successful
                </h1>
                <p className="mt-2 max-w-[280px]" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    Your booking has been confirmed successfully.
                </p>

                <div className="mb-6 mt-6 flex items-center gap-3 rounded-xl px-6 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Redirecting to My Bookings in{" "}
                        <span className="font-bold font-mono-custom" style={{ color: '#D4AF37' }}>{secondsLeft}</span>{" "}
                        seconds
                    </p>
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                </div>

                <div className="flex w-full flex-col gap-3">
                    <Link
                        to="/my-bookings"
                        className="group flex w-full items-center justify-center gap-2 rounded-xl border px-6 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                        style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', color: '#D4AF37' }}
                    >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-6.75-3v.75m0-3v.75m0-3v.75m0-3V6M6 18h12a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0018 4.5H6a2.25 2.25 0 00-2.25 2.25v9A2.25 2.25 0 006 18z" />
                        </svg>
                        View My Bookings
                    </Link>
                    <Link
                        to="/book"
                        className="flex w-full items-center justify-center rounded-xl border px-6 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10 active:translate-y-0"
                        style={{ borderColor: 'rgba(255,255,255,0.10)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.65)' }}
                    >
                        Book Another Tour
                    </Link>
                </div>
            </div>

            <div className="mt-8 text-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.4em]" style={{ color: 'rgba(255,255,255,0.20)' }}>
                    Stamford Bridge Tours &bull; Prestige
                </span>
            </div>
        </div>
    );
}

export default CheckoutSuccessPage;
