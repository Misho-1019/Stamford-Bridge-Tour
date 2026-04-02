import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { loginAdmin, logoutAdmin, type AdminLoginInput, type AdminUser } from "../api/adminAuth"

type AdminAuthContextValue = {
    admin: AdminUser | null;
    isAuthenticated: boolean;
    login: (input: AdminLoginInput) => Promise<void>;
    logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

type AdminAuthProviderProps = {
    children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
    const [admin, setAdmin] = useState<AdminUser | null>(null);

    async function login(input: AdminLoginInput) {
        const data = await loginAdmin(input);
        setAdmin(data.admin);
    }

    async function logout() {
        await logoutAdmin();
        setAdmin(null);
    }

    const value = useMemo(() => ({
        admin,
        isAuthenticated: admin !== null,
        login,
        logout,
    }), [admin])

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