
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

export async function getAdminBookingStats(params?: DateRangeParams): Promise<AdminBookingStats> {
    const queryString = buildQueryString(params);

    const response = await fetch(`${API_BASE_URL}/admin/bookings/stats${queryString}`, {
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

export async function getAdminRevenueSeries(params?: DateRangeParams): Promise<{
    data: AdminRevenueSeriesItem[];
}> {
    const queryString = buildQueryString(params)

    const response = await fetch(`${API_BASE_URL}/admin/bookings/revenue-series${queryString}`, {
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

export async function getAdminTicketTypeStats(params?: DateRangeParams): Promise<{
    data: AdminTicketTypeStat[];
}> {
    const queryString = buildQueryString(params)
    const response = await fetch(`${API_BASE_URL}/admin/bookings/ticket-type-stats${queryString}`, {
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

export async function getAdminSlotStat(params?: DateRangeParams): Promise<{
    data: AdminSlotStat[];
}> {
    const queryString = buildQueryString(params)

    const response = await fetch(`${API_BASE_URL}/admin/bookings/slot-stats${queryString}`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch slot stats')
    }

    return response.json()
}

type DateRangeParams = {
    fromDate?: string;
    toDate?: string;
}

function buildQueryString(params?: DateRangeParams) {
    const searchParams = new URLSearchParams();

    if (params?.fromDate) {
        searchParams.set('fromDate', params.fromDate)
    }

    if (params?.toDate) {
        searchParams.set('toDate', params.toDate)
    }

    const queryString = searchParams.toString();

    return queryString ? `?${queryString}` : '';
}

export type AdminBooking = {
    id: string;
    email: string;
    status: string;
    qtyTotal: number;
    amountTotalCents: number;
    createdAt: string;
}

export async function getAdminBooking(): Promise<{
    bookings: AdminBooking[];
}> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
        headers: {
            'x-admin-secret': ADMIN_SECRET,
        }
    })

    if (!response.ok) {
        throw new Error('Failed to fetch bookings');
    }

    return response.json();
}