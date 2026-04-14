import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import AppLayout from "./components/AppLayout";
import BookingPage from "./pages/BookingPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import ProtectedClientRoute from "./components/ProtectedClientRoute";
import ClientLoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import MyBookingDetailsPage from "./pages/MyBookingDetailsPage";
import AdminBookingDetailsPage from "./pages/AdminBookingDetailsPage";

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
                        <MyBookingsPage />
                    </ProtectedClientRoute>
                )
            },
            {
                path: 'login',
                element: <ClientLoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />
            },
            {
                path: 'my-bookings/:id',
                element: (
                    <ProtectedClientRoute>
                        <MyBookingDetailsPage />
                    </ProtectedClientRoute>
                )
            },
            {
                path: 'admin/bookings/:bookingId',
                element: (
                    <ProtectedAdminRoute>
                        <AdminBookingDetailsPage />
                    </ProtectedAdminRoute>
                )
            },
        ]
    }
])