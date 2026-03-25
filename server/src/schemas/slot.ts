import { z } from "zod";

export const getSlotsQuerySchema = z.object({
    date: z.string().min(1, "date query is required"),
});

export type GetSlotsQueryInput = z.infer<typeof getSlotsQuerySchema>;