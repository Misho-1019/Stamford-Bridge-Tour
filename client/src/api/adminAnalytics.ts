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

export function getAdminBookingStats() {
    return apiFetch<AdminBookingStats>('/admin/bookings/stats')
}

export function getAdminRevenueSeries() {
    return apiFetch<{ data: AdminRevenueSeriesItem[] }>('/admin/bookings/revenue-series')
}

export function getAdminTicketTypeStats() {
    return apiFetch<{ data: AdminTicketTypeStat[] }>('/admin/bookings/ticket-type-stats')
}

export function getAdminSlotStats() {
    return apiFetch<{ data: AdminSlotStat[] }>('/admin/bookings/slot-stats')
}