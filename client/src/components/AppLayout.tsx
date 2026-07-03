import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useAdminAuth } from '../context/AdminAuthContext';
import { useClientAuth } from '../context/ClientAuthContext';

const activeLinkClass = "relative text-[#D4AF37] after:content-[''] after:absolute after:-bottom-2 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:bg-[#D4AF37] after:rounded-full";

function AppLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const { 
        isAuthenticated: isAdminAuthenticated, 
        isInitializing: isAdminLoading,
        logout : adminLogout,
    } = useAdminAuth();

    const {
        isAuthenticated: isClientAuthenticated,
        isLoading: isClientLoading,
        logout: clientLogout,
    } = useClientAuth();

    const isAuthResolved = !isClientLoading && !isAdminLoading;

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
        <div className="relative min-h-screen text-white">
            <div
                className="fixed inset-0 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/stamford-bridge-dusk.jpg')",
                }}
            />

            <div className="fixed inset-0 bg-[rgba(5,12,28,0.22)] backdrop-blur-[1px]" />

            <div className="relative z-10">
                <header className="h-14 border-b border-white/10 bg-[rgba(255,255,255,0.06)] backdrop-blur-2xl">
                    <div className="flex h-full items-center justify-between px-6">
                        <Link to="/" className="flex items-center gap-2 text-[22px] font-bold tracking-[0.15em] transition-colors duration-200 hover:text-white" style={{ color: '#003399' }}>
                            BridgeTour
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-gold-pulse rounded-full opacity-75" style={{ backgroundColor: '#D4AF37' }} />
                                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#D4AF37' }} />
                            </span>
                        </Link>

                        <nav className="flex items-center gap-5 text-sm">
                            <Link to="/" className={`transition-colors hover:text-white ${location.pathname === '/' ? activeLinkClass : ''}`} style={{ color: location.pathname === '/' ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                Home
                            </Link>

                            <Link to="/book" className={`transition-colors hover:text-white ${location.pathname === '/book' ? activeLinkClass : ''}`} style={{ color: location.pathname === '/book' ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                Book
                            </Link>

                            {isAuthResolved ? (
                                <>
                                    {isClientAuthenticated && !isAdminAuthenticated ? (
                                        <Link to="/my-bookings" className={`transition-colors hover:text-white ${location.pathname.startsWith('/my-bookings') ? activeLinkClass : ''}`} style={{ color: location.pathname.startsWith('/my-bookings') ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                            My Bookings
                                        </Link>
                                    ) : null}

                                    {isAdminAuthenticated && !isClientAuthenticated ? (
                                        <Link to="/admin" className={`transition-colors hover:text-white ${location.pathname.startsWith('/admin') ? activeLinkClass : ''}`} style={{ color: location.pathname.startsWith('/admin') ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                            Admin
                                        </Link>
                                    ) : null}

                                    {!isAdminAuthenticated && !isClientAuthenticated ? (
                                        <>
                                            <Link to="/login" className={`transition-colors hover:text-white ${location.pathname === '/login' ? activeLinkClass : ''}`} style={{ color: location.pathname === '/login' ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                                Login
                                            </Link>
                                            <Link to="/register" className={`transition-colors hover:text-white ${location.pathname === '/register' ? activeLinkClass : ''}`} style={{ color: location.pathname === '/register' ? '#D4AF37' : 'rgba(255,255,255,0.85)' }}>
                                                Register
                                            </Link>
                                        </>
                                    ) : null}

                                    {(isAdminAuthenticated || isClientAuthenticated) ? (
                                        <button
                                            onClick={handleLogout}
                                            className="transition-colors hover:text-white" style={{ color: '#4DA3FF' }}
                                        >
                                            Logout
                                        </button>
                                    ) : null}
                                </>
                            ) : null}
                        </nav>
                    </div>
                </header>

                <main
                    className={`mx-auto px-4 py-8 ${
                        isAuthPage ? "flex min-h-[calc(100vh-88px)] max-w-[1100px] items-center justify-center" : "max-w-[1100px]"
                    }`}
                >
                    <div
                        className={`w-full rounded-[20px] glass-card p-6 ${
                            isAuthPage ? "max-w-md" : ""
                        }`}
                    >
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}

export default AppLayout;