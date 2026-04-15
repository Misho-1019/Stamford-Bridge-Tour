import { apiFetch } from "./client";

export type ClientBookingItem = {
    qty: number;
    ticketName?: string;
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

export async function getMyBookings(): Promise<{ bookings: ClientBooking[] }> {
    return apiFetch<{ bookings: ClientBooking[] }>("/bookings/my-bookings");
}

export async function cancelMyBooking(bookingId: string): Promise<{ message: string }> {
    return apiFetch<{ message: string }>(`/bookings/my-bookings/${bookingId}/cancel`, {
        method: "POST",
    });
}

export async function getMyBookingById(bookingId: string): Promise<{ booking: ClientBooking }> {
    return apiFetch<{ booking: ClientBooking }>(`/bookings/my-bookings/${bookingId}`);
}