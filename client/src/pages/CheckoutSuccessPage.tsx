import { useEffect } from "react";
import { Link, useNavigate } from "react-router";

function CheckoutSuccessPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        const timer = setTimeout(() => {
            navigate('/my-bookings');
        }, 10000);

        return () => clearTimeout(timer);
    }, [navigate])

    return (
        <div className="text-center space-y-4">
            <h1 className="text-2xl font-semibold text-blue-900">
                Payment Successful 🎉
            </h1>
        
            <p className="text-slate-600">
                Your booking has been confirmed.
            </p>
        
            <p className="text-sm text-slate-500">
                You will be redirected to your bookings shortly.
            </p>
        
            <div className="pt-4">
                <Link
                    to="/my-bookings"
                    className="inline-block rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white hover:bg-blue-800"
                >
                    View My Bookings
                </Link>
            </div>
        </div>
    );
}

export default CheckoutSuccessPage;