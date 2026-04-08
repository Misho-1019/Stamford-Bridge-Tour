const API_BASE_URL = 'http://localhost:8080';

export type Client = {
    id: string;
    email: string;
}

export type ClientAuthResponse = {
    client: Client;
}

export type ClientLoginInput = {
    email: string;
    password: string;
}

export type ClientRegisterInput = {
    email: string;
    password: string;
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();

        return data.error || 'Request failed';
    } catch (error) {
        return 'Request failed';
    }
}

export async function clientRegister(input: ClientRegisterInput): Promise<ClientAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/client/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}

export async function clientLogin(input: ClientLoginInput): Promise<ClientAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/client/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(input),
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}

export async function clientRefresh(): Promise<ClientAuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/client/refresh`, {
        method: 'POST',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}

export async function clientLogout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/client/logout`, {
        method: 'POST',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}