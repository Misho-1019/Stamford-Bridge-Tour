import { Link, useNavigate } from "react-router";
import { useClientAuth } from "../context/ClientAuthContext";
import { useState, type FormEvent, useEffect } from "react";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useClientAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await register({ email, password })
            navigate('/my-bookings');
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div
            className="w-full max-w-[440px] mx-auto transition-all duration-[0.6s]"
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)'
            }}
        >
            <div className="glass-card p-12 flex flex-col gap-6 shadow-2xl relative overflow-hidden">
                {/* Gold left accent shimmer */}
                <div className="absolute left-0 top-0 h-full w-1 animate-gold-pulse" style={{ backgroundColor: '#D4AF37' }} />

                {/* Title */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Create Account
                    </h1>
                    <p className="text-base" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Register to manage your BridgeTour bookings.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Email
                        </label>
                        <div className="relative group">
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                placeholder="name@example.com"
                                className="w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgba(255,255,255,0.90)',
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            Password
                        </label>
                        <div className="relative group">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border px-4 py-3 text-sm transition-all duration-200 outline-none focus:ring-2"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgba(255,255,255,0.90)',
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error ? (
                        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#EF4444' }}>
                            {error}
                        </div>
                    ) : null}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="group relative w-full overflow-hidden rounded-xl px-4 py-4 font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                        style={{
                            border: '1px solid rgba(212,175,55,0.35)',
                            background: 'rgba(212,175,55,0.12)',
                            backdropFilter: 'blur(12px)',
                            color: '#D4AF37'
                        }}
                    >
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
                        <span className="relative z-10 inline-flex items-center gap-2">
                            {isSubmitting ? "Creating account..." : "Register"}
                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </button>
                </form>

                {/* Footer */}
                <p className="pt-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    Already have an account?{" "}
                    <Link to="/login" className="font-semibold transition-all hover:brightness-125" style={{ color: '#4DA3FF' }}>
                        Sign in
                    </Link>
                </p>
            </div>

            {/* Trust Indicators */}
            <div className="mt-6 flex justify-center gap-6 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span>Secure Registration</span>
                </div>
                <div className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="#D4AF37" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                    </svg>
                    <span>Official Tour Partner</span>
                </div>
            </div>
        </div>
    );
}
