import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/AdminLoginPage";
import AppLayout from "./components/AppLayout";
import BookingPage from "./pages/BookingPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedClientRoute from "./components/ProtectedClientRoute";
import ClientLoginPage from "./pages/ClientLoginPage";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'book',
                element: <BookingPage />,
            },
            {
                path: 'checkout/success',
                element: <CheckoutSuccessPage />,
            },
            {
                path: 'checkout/cancel',
                element: <CheckoutCancelPage />,
            },
            {
                path: 'admin',
                element: (
                    <ProtectedAdminRoute>
                        <AdminPage />
                    </ProtectedAdminRoute>
                ),
            },
            {
                path: 'my-bookings',
                element: (
                    <ProtectedClientRoute>
                        <div>My Bookings</div>
                    </ProtectedClientRoute>
                )
            },
            {
                path: 'login',
                element: <ClientLoginPage />,
            },
            {
                path: 'admin/login',
                element: <LoginPage />,
            },
        ]
    }
])