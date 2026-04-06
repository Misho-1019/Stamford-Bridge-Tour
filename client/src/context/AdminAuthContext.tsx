import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { loginAdmin, logoutAdmin, refreshAdminSession, type AdminLoginInput, type AdminUser } from "../api/adminAuth"

type AdminAuthContextValue = {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (input: AdminLoginInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

type AdminAuthProviderProps = {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    async function login(input: AdminLoginInput) {
        const data = await loginAdmin(input);
        setAdmin(data.admin);
    }

    useEffect(() => {
        async function init() {
            try {
                const data = await refreshAdminSession();

                setAdmin(data.admin);
            } catch {
                setAdmin(null);
            } finally {
                setIsInitializing(false);
            }
        }

        init();
    }, [])

    async function logout() {
        await logoutAdmin();
        setAdmin(null);
    }

    const value = useMemo(() => ({
        admin,
        isAuthenticated: admin !== null,
        isInitializing,
        login,
        logout,
    }), [admin, isInitializing])

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdminAuth() {
    const context = useContext(AdminAuthContext);

    if (!context) {
        throw new Error("useAdminAuth must be used within an AdminAuthProvider");
    }

    return context;
}