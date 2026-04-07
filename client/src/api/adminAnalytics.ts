import { apiFetch } from "./client";

export type AdminBookingStats = {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    refundedBookings: number;
    confirmedRevenueCents: number;
    refundedRevenueCents: number;
}

export function getAdminBookingStats() {
    return apiFetch<AdminBookingStats>('/admin/bookings/stats')
}