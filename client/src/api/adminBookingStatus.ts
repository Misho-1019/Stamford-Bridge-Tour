import type { AdminBooking } from "../types/adminBooking";
import { apiFetch } from "./client";

type UpdateAdminBookingStatusInput = {
    bookingId: string;
    status: 'CANCELLED';
}

type UpdateAdminBookingStatusResponse = {
    booking: AdminBooking;
}

export function updateAdminBookingStatus(
    input: UpdateAdminBookingStatusInput
) {
    return apiFetch<UpdateAdminBookingStatusResponse>(`/admin/bookings/${input.bookingId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
            status: input.status,
        })
    })
}