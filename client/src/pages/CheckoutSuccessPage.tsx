import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

function CheckoutSuccessPage() {
    const navigate = useNavigate();
    const [secondsLeft, setSecondsLeft] = useState(5);
    
    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            navigate('/my-bookings');
        }, 5000);

        const countdownTimer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    return 0;
                }

                return prev - 1;
            })
        }, 1000)

        return () => {
            clearTimeout(redirectTimer);
            clearInterval(countdownTimer);
        };
    }, [navigate])

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
                    Redirecting to <span className="font-medium text-slate-900">My Bookings</span> in{" "}
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