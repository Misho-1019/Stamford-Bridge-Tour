export type AdminBookingStatus = 'CONFIRMED' | 'CANCELLED' | 'REFUNDED';

export type AdminBookingItem = {
    qty: number;
    ticketTypeId: string;
    unitPriceCents: number;
    ticketName?: string;
}

export type AdminBookingSlot = {
    id: string;
    startAt: string;
    endAt: string;
    capacityTotal: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
};

export type AdminBooking = {
    id: string;
    slotId: string;
    email: string;
    clientUserId: string | null;
    items: AdminBookingItem[];
    qtyTotal: number;
    amountTotalCents: number;
    status: AdminBookingStatus;
    stripeSessionId: string | null;
    stripePaymentIntentId: string | null;
    stripeRefundId: string | null;
    refundedAt: string | null;
    refundReason: string | null;
    createdAt: string;
    updatedAt: string;
    slot: AdminBookingSlot;
};

export type GetAdminBookingsResponse = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    bookings: AdminBooking[];
};