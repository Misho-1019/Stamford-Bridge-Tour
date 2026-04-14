import type { GetAdminBookingsResponse } from "../types/adminBooking";
import { apiFetch } from "./client";

export function getAdminBookings(page = 1, limit = 10, filters?: { status?: string; email?: string; from?: string; to?: string;}) {
    const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });
    
    if (filters?.status && filters.status !== "ALL") {
        params.append("status", filters.status);
    }
    
    if (filters?.email) {
        params.append("email", filters.email);
    }
    
    if (filters?.from) {
        params.append("from", filters.from);
    }
    
    if (filters?.to) {
        params.append("to", filters.to);
    }
    
    return apiFetch<GetAdminBookingsResponse>(
        `/admin/bookings?${params.toString()}`
    )
}