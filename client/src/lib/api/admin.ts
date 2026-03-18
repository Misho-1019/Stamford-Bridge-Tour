
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