import { z } from "zod";

export const bookingSessionParamsSchema = z.object({
    sessionId: z.string().min(1, "sessionId is required"),
});

export const clientBookingsQuerySchema = z.object({
    type: z.enum(['upcoming', 'past']).optional(),
})