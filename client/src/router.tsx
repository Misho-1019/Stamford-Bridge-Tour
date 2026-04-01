import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";
import BookingPage from "./pages/BookingPage";
import CheckoutSuccessPage from "./pages/CheckoutSuccessPage";
import CheckoutCancelPage from "./pages/CheckoutCancelPage";

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
                element: <AdminPage />,
            },
            {
                path: 'login',
                element: <LoginPage />,
            },
        ]
    }
])