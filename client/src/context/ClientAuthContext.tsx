import { createContext, useCallback, useContext, useEffect, useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import { clientLogin, clientLogout, clientRefresh, clientRegister, type Client, type ClientLoginInput, type ClientRegisterInput } from "../api/clientAuth"

type ClientAuthContextValue = {
    client: Client | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (input: ClientLoginInput) => Promise<void>;
    register: (input: ClientRegisterInput) => Promise<void>;
    logout: () => Promise<void>;
    setClient: Dispatch<SetStateAction<Client | null>>;
}

const ClientAuthContext = createContext<ClientAuthContextValue | undefined>(undefined);

export function ClientAuthProvider({children}: { children: ReactNode }) {
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const restoreSession = useCallback(async () => {
        try {
            const data = await clientRefresh();

            setClient(data.client)
        } catch {
            setClient(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        restoreSession();
    }, [restoreSession])

    const login = useCallback(async (input: ClientLoginInput) => {
        const data = await clientLogin(input);

        setClient(data.client)
    }, [])

    const register = useCallback(async (input: ClientRegisterInput) => {
        const data = await clientRegister(input);

        setClient(data.client)
    }, [])

    const logout = useCallback(async () => {
        try {
            await clientLogout();
        } finally {
            setClient(null)
        }
    }, [])

    const value = useMemo(() => ({
        client,
        isAuthenticated: !!client,
        isLoading,
        login,
        register,
        logout,
        setClient,
    }), [client, isLoading, login, register, logout])

    return (
        <ClientAuthContext.Provider value={value}>
            {children}
        </ClientAuthContext.Provider>
    )
}

export function useClientAuth() {
    const context = useContext(ClientAuthContext);

    if (!context) {
        throw new Error('useClientAuth must be used within ClientAuthProvider')
    }

    return context;
}