import { apiFetch } from "./client";

export type AdminBookingStats = {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    refundedBookings: number;
    confirmedRevenueCents: number;
    refundedRevenueCents: number;
}

export type AdminRevenueSeriesItem = {
    date: string;
    revenueCents: number;
    bookings: number;
}

export type AdminTicketTypeStat = {
    ticketTypeId: string;
    ticketTypeName: string;
    qty: number;
    revenueCents: number;
}

export type AdminSlotStat = {
    slotId: string;
    startAt: string;
    endAt: string;
    capacityTotal: number;
    bookingsCount: number;
    ticketsSold: number;
    revenueCents: number;
    usagePercent: number;
};

function toQueryString(params: Record<string, string | undefined>): string {
    const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== '');
    if (entries.length === 0) return '';
    return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v!)}`).join('&');
}

export function getAdminBookingStats(fromDate?: string, toDate?: string) {
    const qs = toQueryString({ fromDate, toDate });
    return apiFetch<AdminBookingStats>(`/admin/bookings/stats${qs}`)
}

export function getAdminRevenueSeries(fromDate?: string, toDate?: string) {
    const qs = toQueryString({ fromDate, toDate });
    return apiFetch<{ data: AdminRevenueSeriesItem[] }>(`/admin/bookings/revenue-series${qs}`)
}

export function getAdminTicketTypeStats(fromDate?: string, toDate?: string) {
    const qs = toQueryString({ fromDate, toDate });
    return apiFetch<{ data: AdminTicketTypeStat[] }>(`/admin/bookings/ticket-type-stats${qs}`)
}

export function getAdminSlotStats(fromDate?: string, toDate?: string) {
    const qs = toQueryString({ fromDate, toDate });
    return apiFetch<{ data: AdminSlotStat[] }>(`/admin/bookings/slot-stats${qs}`)
}
