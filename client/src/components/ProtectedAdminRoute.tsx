import type { ReactNode } from "react"
import { useAdminAuth } from "../context/AdminAuthContext";
import { Navigate, useLocation } from "react-router";

type ProtectedAdminRouteProps = {
    children: ReactNode;
}

export default function ProtectedAdminRoute({
    children,
}: ProtectedAdminRouteProps) {
    const { isAuthenticated } = useAdminAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to='/login' replace state={{ from: location }}/>
    }

    return <>{children}</>
}