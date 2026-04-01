import { Link, Outlet } from 'react-router';

function AppLayout() {
    return (
        <div className="relative min-h-screen text-slate-900">
            {/* Background image */}
            <div
                className="fixed inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/stamford-bridge-image.jpg')",
                }}
            />

            {/* Subtle overlay */}
            <div className="fixed inset-0 bg-blue-900/20" />

            {/* Content layer */}
            <div className="relative z-10">
                <header className="border-b border-white/20 bg-white/70 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                        <Link to="/" className="text-lg font-semibold text-blue-900">
                            BridgeTour
                        </Link>

                        <nav className="flex items-center gap-4 text-sm">
                            <Link to="/" className="hover:underline text-slate-800">
                                Home
                            </Link>
                            <Link to="/book" className="hover:underline text-slate-800">
                                Book
                            </Link>
                            <Link to="/admin" className="hover:underline text-slate-800">
                                Admin
                            </Link>
                            <Link to="/login" className="hover:underline text-slate-800">
                                Login
                            </Link>
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-5xl px-4 py-6">
                    <div className="rounded-xl bg-white/85 p-6 shadow-lg">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;