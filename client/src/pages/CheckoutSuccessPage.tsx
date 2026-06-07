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
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl animate-pulse">
                    ⏳
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-blue-900">
                        Confirming Your Booking
                    </h1>
                    <p className="text-slate-600">
                        Please wait while we confirm your payment and create your booking.
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">
                        This should only take a few seconds.
                    </p>
                </div>
            </div>
        );
    }

    if (status === "error") {
        return (
            <div className="space-y-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-2xl">
                    ⚠️
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold text-slate-900">
                        Payment Received
                    </h1>
                    <p className="text-slate-600">
                        Your payment was successful, but we're still confirming your booking.
                    </p>
                    <p className="text-sm text-slate-500">
                        Check your bookings in a few minutes. If it doesn't appear, contact support with your session ID:{" "}
                        <code className="rounded bg-slate-100 px-2 py-0.5 text-xs">{sessionId}</code>
                    </p>
                </div>
                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link
                        to="/my-bookings"
                        className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                    >
                        View My Bookings
                    </Link>
                    <Link
                        to="/book"
                        className="inline-block rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                        Book Another Tour
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
                ✓
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-blue-900">
                    Payment Successful
                </h1>
                <p className="text-slate-600">
                    Your booking has been confirmed successfully.
                </p>
                <p className="text-sm text-slate-500">
                    You can review your booking details in your account.
                </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm text-slate-600">
                    Redirecting to{" "}
                    <span className="font-medium text-slate-900">My Bookings</span> in{" "}
                    <span className="font-semibold text-blue-900">{secondsLeft}</span>{" "}
                    seconds.
                </p>
            </div>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                    to="/my-bookings"
                    className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition hover:bg-blue-800"
                >
                    View My Bookings
                </Link>
                <Link
                    to="/book"
                    className="inline-block rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                    Book Another Tour
                </Link>
            </div>
        </div>
    );
}

export default CheckoutSuccessPage;
