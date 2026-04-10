import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

function CheckoutSuccessPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/my-bookings');
        }, 3000);

        return () => clearTimeout(timer);
    }, [navigate])

    return (
        <section>
            <h1 className="text-2xl font-semibold">Checkout Success</h1>
            <p className="mt-2 text-sm text-slate-600 text-center">
                You will be redirected to your bookings shortly.
            </p>

            <div className="mt-6 text-center">
                <Link
                    to="/my-bookings"
                    className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                >
                    View My Bookings
                </Link>
            </div>
        </section>
    );
}

export default CheckoutSuccessPage;