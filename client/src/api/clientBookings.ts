
const API_BASE_URL = 'http://localhost:8080';

export type ClientBookingItem = {
    qty: number;
    ticketName: string;
    unitPriceCents: number;
}

export type ClientBooking = {
    id: string;
    email: string;
    status: string;
    qtyTotal: number;
    amountTotalCents: number;
    createdAt: string;
    refundedAt?: string | null;
    refundReason?: string | null;
    slot: {
        id: string;
        startAt: string;
        endAt: string;
    };
    items: ClientBookingItem[];
}

async function readErrorMessage(response: Response): Promise<string> {
    try {
        const data = await response.json();

        return data.message || 'Request failed';
    } catch {
        return 'Request failed';
    }
}

export async function getMyBookings(): Promise<{ bookings: ClientBooking[] }> {
    const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
        method: 'GET',
        credentials: 'include',
    })

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}

export async function cancelMyBooking(bookingId: string): Promise<{ message: string }> {
    const response = await fetch(
        `${API_BASE_URL}/bookings/my-bookings/${bookingId}/cancel`,
        {
            method: 'POST',
            credentials: 'include',
        }
    );

    if (!response.ok) {
        throw new Error(await readErrorMessage(response))
    }

    return response.json();
}

export async function getMyBookingById(bookingId: string): Promise<{ booking: ClientBooking }> {
    const response = await fetch(
        `${API_BASE_URL}/bookings/my-bookings/${bookingId}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        throw new Error(await readErrorMessage(response));
    }

    return response.json();
}