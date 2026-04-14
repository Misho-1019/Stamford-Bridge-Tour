import { Link, useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useClientAuth } from "../context/ClientAuthContext";
import { useState, type FormEvent } from "react";

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
        <div className="w-full">
            <div className="space-y-2">
                <h1 className="text-2xl font-semibold text-blue-900">
                    Sign In
                </h1>
                <p className="text-sm text-slate-600">
                    {role === "ADMIN"
                        ? "Sign in to access the BridgeTour admin dashboard."
                        : "Sign in to view and manage your BridgeTour bookings."}
                </p>
            </div>
    
            <div className="mt-6 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
                <button
                    type="button"
                    onClick={() => setRole("CLIENT")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                        role === "CLIENT"
                            ? "bg-white text-blue-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    Client
                </button>
    
                <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                        role === "ADMIN"
                            ? "bg-white text-blue-900 shadow-sm"
                            : "text-slate-600 hover:text-slate-900"
                    }`}
                >
                    Admin
                </button>
            </div>
    
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder={
                            role === "ADMIN" ? "admin@test.com" : "client@test.com"
                        }
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-700"
                        required
                    />
                </div>
    
                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter password"
                        className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-700"
                        required
                    />
                </div>
    
                {error ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                ) : null}
    
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
            </form>

            <p className="mt-4 text-sm text-slate-600 text-center">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-700 hover:underline font-medium">
                    Sign up
                </Link>
            </p>
        </div>
    );
}