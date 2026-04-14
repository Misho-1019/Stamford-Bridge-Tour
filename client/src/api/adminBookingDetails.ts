import type { AdminBooking } from "../types/adminBooking"
import { apiFetch } from "./client";

type GetAdminBookingByIdResponse = {
    booking: AdminBooking;
}

export async function getAdminBookingById(id: string): Promise<GetAdminBookingByIdResponse> {
    return apiFetch<GetAdminBookingByIdResponse>(`/admin/bookings/${id}`)
}