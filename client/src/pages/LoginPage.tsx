import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import { useAdminAuth } from "../context/AdminAuthContext";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAdminAuth()
    const location = useLocation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = location.state?.from?.pathname || '/admin';

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await login({ email, password })

            navigate(from, { replace: true });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Admin login failed';

            setError(message);
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <div className="mx-auto flex min-h-screen max-w-md items-center justify-center px-6">
                <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl">
                    <h1 className="text-3xl font-bold text-blue-400">
                        Admin Login
                    </h1>

                    <p className="mt-2 text-sm text-slate-300">
                        Sign in to access the BridgeTour admin dashboard.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                placeholder="admin@test.com"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-slate-200"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                                placeholder="Enter password"
                                required
                            />
                        </div>

                        {error ? (
                            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </div>
                        ) : null}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;