import { apiFetch } from "./client";

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

export async function clientRegister(input: ClientRegisterInput): Promise<ClientAuthResponse> {
    return apiFetch<ClientAuthResponse>("/auth/client/register", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function clientLogin(input: ClientLoginInput): Promise<ClientAuthResponse> {
    return apiFetch<ClientAuthResponse>("/auth/client/login", {
        method: "POST",
        body: JSON.stringify(input),
    })
}

export async function clientRefresh(): Promise<ClientAuthResponse> {
    return apiFetch<ClientAuthResponse>("/auth/client/refresh", {
        method: "POST",
    })
}

export async function clientLogout(): Promise<{ message: string }> {
    return apiFetch<{ message: string }>("/auth/client/logout", {
        method: "POST",
    })
}