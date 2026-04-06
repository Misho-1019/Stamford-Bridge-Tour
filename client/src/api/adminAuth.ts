import { apiFetch } from "./client";

export type AdminLoginInput = {
    email: string;
    password: string;
}

export type AdminUser = {
    id: string;
    email: string;
}

type AdminLoginResponse = {
    admin: AdminUser;
}

type AdminLogoutResponse = {
    message: string;
}

export function loginAdmin(input: AdminLoginInput) {
    return apiFetch<AdminLoginResponse>('/auth/admin/login', {
        method: 'POST',
        body: JSON.stringify(input),
    })
}

export function logoutAdmin() {
    return apiFetch<AdminLogoutResponse>('/auth/admin/logout', {
        method: 'POST',
    })
}

export function refreshAdminSession() {
    return apiFetch<{ admin: AdminUser }>('/auth/admin/refresh', {
        method: 'POST',
    })
}