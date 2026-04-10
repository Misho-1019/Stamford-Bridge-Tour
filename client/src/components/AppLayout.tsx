import { Link, Outlet, useNavigate } from 'react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useClientAuth } from '../context/ClientAuthContext';

function AppLayout() {
    const navigate = useNavigate();
    const { 
        isAuthenticated: isAdminAuthenticated, 
        logout : adminLogout,
    } = useAdminAuth();

    const {
        isAuthenticated: isClientAuthenticated,
        logout: clientLogout,
    } = useClientAuth();

    async function handleLogout() {
        if (isAdminAuthenticated) {
            await adminLogout();
            navigate('/login');
            return;
        }

        if (isClientAuthenticated) {
            await clientLogout();
            navigate('/login');
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

            <div className="relative z-10">
                <header className="border-b border-white/20 bg-white/70 backdrop-blur-sm">
                    <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
                        <Link to="/" className="text-lg font-semibold text-blue-900">
                            BridgeTour
                        </Link>

                        <nav className="flex items-center gap-4 text-sm">
                            <Link to="/" className="text-slate-800 hover:underline">
                                Home
                            </Link>

                            <Link to="/book" className="text-slate-800 hover:underline">
                                Book
                            </Link>

                            {isClientAuthenticated && !isAdminAuthenticated ? (
                                <Link to="/my-bookings" className="text-slate-800 hover:underline">
                                    My Bookings
                                </Link>
                            ) : null}

                            {isAdminAuthenticated && !isClientAuthenticated ? (
                                <Link to="/admin" className="text-slate-800 hover:underline">
                                    Admin
                                </Link>
                            ) : null}

                            {!isAdminAuthenticated && !isClientAuthenticated ? (
                                <>
                                    <Link to="/login" className="text-slate-800 hover:underline">
                                        Login
                                    </Link>
                                    <Link to="/register" className="text-slate-800 hover:underline">
                                        Register
                                    </Link>
                                </>
                            ) : null}

                            {(isAdminAuthenticated || isClientAuthenticated) ? (
                                <button
                                    onClick={handleLogout}
                                    className="text-red-600 hover:underline"
                                >
                                    Logout
                                </button>
                            ) : null}
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