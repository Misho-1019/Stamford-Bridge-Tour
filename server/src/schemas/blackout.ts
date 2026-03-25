import { z } from "zod";

export const createBlackoutSchema = z.object({
    date: z.string().min(1, "date is required"),
    reason: z.string().optional(),
});

export type CreateBlackoutInput = z.infer<typeof createBlackoutSchema>;