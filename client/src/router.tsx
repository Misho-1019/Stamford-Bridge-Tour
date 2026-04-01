import { createBrowserRouter } from "react-router";
import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import LoginPage from "./pages/LoginPage";
import AppLayout from "./components/AppLayout";

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
                path: '/admin',
                element: <AdminPage />,
            },
            {
                path: '/login',
                element: <LoginPage />,
            },
        ]
    }
])