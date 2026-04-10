import { Link, useNavigate } from "react-router";
import { useClientAuth } from "../context/ClientAuthContext";
import { useState, type FormEvent } from "react";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useClientAuth();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        <div className="relative min-h-screen text-slate-900">
            <div
                className="fixed inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/stamford-bridge-image.jpg')",
                }}
            />

            <div className="fixed inset-0 bg-blue-900/20" />

            <div className="relative z-10 flex min-h-screen items-center justify-center px-4">
                <div className="w-full max-w-md rounded-xl bg-white/95 p-6 shadow-md">
                    <div className="space-y-2">
                        <h1 className="text-2xl font-semibold text-blue-900">
                            Create Account
                        </h1>
                        <p className="text-sm text-slate-600">
                            Register to manage your BridgeTour bookings.
                        </p>
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
                                placeholder="your@email.com"
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
                                placeholder="Create a password"
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
                            {isSubmitting ? "Creating account..." : "Register"}
                        </button>
                    </form>

                    <p className="mt-4 text-sm text-slate-600">
                        Already have an account?{" "}
                        <Link to="/login" className="text-blue-700 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}