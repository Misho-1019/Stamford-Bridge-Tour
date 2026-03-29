import { BookingStatus } from "@prisma/client";
import { z } from "zod";

export const generateSlotsQuerySchema = z.object({
    days: z.coerce.number().int().positive().default(60),
});

export const syncBlackoutsQuerySchema = z.object({
    daysAhead: z.coerce.number().int().positive().default(180),
});

export const getAdminBookingsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    status: z.nativeEnum(BookingStatus).optional(),
    email: z.string().trim().optional(),
    slotId: z.string().uuid("slotId must be a valid UUID").optional(),
});

export const adminDateRangeQuerySchema = z.object({
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
});

export const bookingIdParamsSchema = z.object({
    id: z.string().uuid("id must be a valid UUID"),
});

export const updateBookingStatusSchema = z.object({
    status: z.nativeEnum(BookingStatus),
    reason: z.string().optional(),
    amountCents: z.number().int().nonnegative().optional(),
});

export const refundBookingSchema = z.object({
    reason: z.string().trim().min(1).max(500).optional(),
})