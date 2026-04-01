import { Link, Outlet } from 'react-router';

function AppLayout() {
    return (
        <div className="min-h-screen bg-white text-slate-900">
            <header className="border-b border-slate-200">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                    <Link to="/" className="text-lg font-semibold">
                        BridgeTour
                    </Link>

                    <nav className="flex items-center gap-4 text-sm">
                        <Link to="/" className="hover:underline">
                            Home
                        </Link>
                        <Link to="/admin" className="hover:underline">
                            Admin
                        </Link>
                        <Link to="/login" className="hover:underline">
                            Login
                        </Link>
                    </nav>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}

export default AppLayout;