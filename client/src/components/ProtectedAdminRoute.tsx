import type { ReactNode } from "react"
import { useAdminAuth } from "../context/AdminAuthContext";
import { Navigate, useLocation } from "react-router";

type ProtectedAdminRouteProps = {
    children: ReactNode;
}

export default function ProtectedAdminRoute({
    children,
}: ProtectedAdminRouteProps) {
    const { isAuthenticated, isInitializing } = useAdminAuth();
    const location = useLocation();

    if (isInitializing) {
        return (
            <div className="p-6 text-sm text-slate-600">
                Loading...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to='/admin/login' replace state={{ from: location }}/>
    }

    return <>{children}</>
}