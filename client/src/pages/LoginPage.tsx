import { Link, useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useClientAuth } from "../context/ClientAuthContext";
import { useState, type FormEvent, useEffect } from "react";

type LoginRole = 'CLIENT' | 'ADMIN';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { login: adminLogin, logout: adminLogout } = useAdminAuth();
    const { login: clientLogin } = useClientAuth();
    
    const [role, setRole] = useState<LoginRole>("CLIENT");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 100);
        return () => clearTimeout(timer);
    }, []);

    function getRedirectPath() {
        const requestedPath = location.state?.from?.pathname;

        if (role === 'ADMIN') {
            if (requestedPath && requestedPath.startsWith('/admin')) {
                return requestedPath;
            }
            return '/admin';
        }

        if (requestedPath && !requestedPath.startsWith('/admin')) {
            return requestedPath;
        }
        return '/my-bookings';
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (role === 'ADMIN') {
                await adminLogin({ email, password });
            } else {
                await adminLogout();
                await clientLogin({ email, password })
            }
            navigate(getRedirectPath(), { replace: true })
        } catch (err) {
            const message = err instanceof Error ? err.message : role === 'ADMIN' ? 'Admin login failed' : 'Client login failed';
            setError(message)
        } finally {
            setIsSubmitting(false);
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
            <div className="glass-card p-12 flex flex-col gap-6 shadow-2xl">
                {/* Title */}
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold tracking-[-0.02em]" style={{ color: 'rgba(255,255,255,0.90)' }}>
                        Sign In
                    </h1>
                    <p className="text-base" style={{ color: 'rgba(255,255,255,0.60)' }}>
                        Sign in to view and manage your BridgeTour bookings.
                    </p>
                </div>

                {/* Role Toggle */}
                <div className="flex rounded-full border p-1" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                    <button
                        type="button"
                        onClick={() => setRole("CLIENT")}
                        className={`flex-1 rounded-full py-2 text-sm font-medium font-mono-custom transition-all duration-300 ${
                            role === "CLIENT" ? "border shadow-sm" : "hover:text-white"
                        }`}
                        style={role === "CLIENT" ? { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' } : { color: 'rgba(255,255,255,0.50)' }}
                    >
                        Client
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole("ADMIN")}
                        className={`flex-1 rounded-full py-2 text-sm font-medium font-mono-custom transition-all duration-300 ${
                            role === "ADMIN" ? "border shadow-sm" : "hover:text-white"
                        }`}
                        style={role === "ADMIN" ? { background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.25)', color: '#D4AF37' } : { color: 'rgba(255,255,255,0.50)' }}
                    >
                        Admin
                    </button>
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
                                placeholder={role === "ADMIN" ? "admin@test.com" : "client@test.com"}
                                className="w-full rounded-xl border px-4 py-3 pr-10 text-sm transition-all duration-200 outline-none focus:ring-2"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgba(255,255,255,0.90)',
                                }}
                                required
                            />
                            <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
                                Password
                            </label>
                            <span className="text-xs transition-colors hover:underline" style={{ color: '#D4AF37' }}>Forgot?</span>
                        </div>
                        <div className="relative group">
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-xl border px-4 py-3 pr-10 text-sm transition-all duration-200 outline-none focus:ring-2"
                                style={{
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    background: 'rgba(255,255,255,0.06)',
                                    backdropFilter: 'blur(8px)',
                                    color: 'rgba(255,255,255,0.90)',
                                }}
                                required
                            />
                            <svg className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors duration-200 group-focus-within:text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="rgba(255,255,255,0.35)" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                            </svg>
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
                        <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 gold-shimmer" />
                        <span className="relative z-10 inline-flex items-center gap-2">
                            {isSubmitting ? "Signing in..." : "Sign In"}
                            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </span>
                    </button>
                </form>

                {/* Footer */}
                <p className="pt-2 text-center text-sm" style={{ color: 'rgba(255,255,255,0.50)' }}>
                    Don't have an account?{" "}
                    <Link to="/register" className="font-semibold transition-all hover:brightness-125" style={{ color: '#4DA3FF' }}>
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}
