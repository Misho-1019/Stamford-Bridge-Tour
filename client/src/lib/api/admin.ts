
const API_BASE_URL = 'http://localhost:8080';
const ADMIN_SECRET = import.meta.env.VITE_ADMIN_SECRET;

export type AdminBookingStats = {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    refundedBookings: number;
    confirmedRevenueCents: number;
    refundedRevenueCents: number;
}

export async function getAdminBookingStats(): Promise<AdminBookingStats> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/stats`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        },
        credentials: 'include',
    });

    if (!response.ok) {
        throw new Error('Failed to fetch admin booking stats')
    }

    return response.json();
}

export type AdminRevenueSeriesItem = {
    date: string;
    revenueCents: number;
    bookings: number;
};

export async function getAdminRevenueSeries(): Promise<{
    data: AdminRevenueSeriesItem[];
}> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/revenue-series`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        },
    })

    if (!response.ok) {
        throw new Error('Failed to fetch admin revenue series')
    }

    return response.json();
}

export type AdminTicketTypeStat = {
    ticketTypeId: string;
    ticketTypeName: string;
    qty: number;
    revenueCents: number;
}

export async function getAdminTicketTypeStats(): Promise<{
    data: AdminTicketTypeStat[];
}> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/ticket-type-stats`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch ticket type stats')
    }

    return response.json();
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

export async function getAdminSlotStat(): Promise<{
    data: AdminSlotStat[];
}> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/slot-stats`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch slot stats')
    }

    return response.json()
}