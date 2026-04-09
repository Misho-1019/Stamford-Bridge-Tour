import { Navigate } from "react-router";
import { useClientAuth } from "../context/ClientAuthContext";
import type { ReactNode } from "react";

type ProtectedClientRouteProps = {
    children: ReactNode;
}

export default function ProtectedClientRoute(
    { children }: ProtectedClientRouteProps
) {
    const { isAuthenticated, isLoading } = useClientAuth();

    if (isLoading) {
        return <div className="p-4">Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to='/login' replace />
    }

    return <>{children}</>
}