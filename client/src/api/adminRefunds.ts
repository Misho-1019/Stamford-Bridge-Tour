import { apiFetch } from "./client";

type RefundBookingInput = {
    bookingId: string;
    reason: string;
}

type RefundBookingResponse = {
    message: string;
    booking: {
        id: string;
        status: string;
        refundedAt: string | null;
        refundReason: string | null;
    }
}

export function refundBooking(input: RefundBookingInput) {
    return apiFetch<RefundBookingResponse>(`/admin/bookings/${input.bookingId}/refund`, {
        method: 'POST',
        body: JSON.stringify({
            reason: input.reason,
        })
    })
}