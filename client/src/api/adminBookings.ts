import type { GetAdminBookingsResponse } from "../types/adminBooking";
import { apiFetch } from "./client";

export function getAdminBookings(page = 1, limit = 10) {
    return apiFetch<GetAdminBookingsResponse>(
        `/admin/bookings?page=${page}&limit=${limit}`
    )
}