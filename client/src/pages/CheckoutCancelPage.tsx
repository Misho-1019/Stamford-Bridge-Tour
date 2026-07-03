import { Link } from "react-router";

function CheckoutCancelPage() {
    return (
        <div className="mx-auto w-full max-w-md">
            <div className="glass-card p-12 shadow-2xl flex flex-col items-center text-center">
                {/* Cancel Icon */}
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.2)" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                    Payment Cancelled
                </h1>
                <p className="mt-4 max-w-xs text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
                    Your payment was not completed. No charges have been made to your account.
                </p>

                <Link
                    to="/book"
                    className="group mt-8 inline-flex items-center gap-3 rounded-xl border px-8 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                    style={{ borderColor: 'rgba(212,175,55,0.35)', background: 'rgba(212,175,55,0.1)', backdropFilter: 'blur(12px)', color: '#D4AF37' }}
                >
                    <span className="text-base">Try Again</span>
                    <svg className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                </Link>

                <Link
                    to="/book"
                    className="mt-4 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                    Return to Booking Selection
                </Link>
            </div>
        </div>
    );
}

export default CheckoutCancelPage;
