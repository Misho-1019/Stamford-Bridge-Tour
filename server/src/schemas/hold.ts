import z from "zod";

export const createHoldSchema = z.object({
    slotId: z.string().uuid("slotId must be a valid UUID"),
    email: z.email('Invalid email address'),
    items: z.array(
        z.object({
            ticketTypeId: z.string().uuid("ticketTypeId must be a valid UUID"),
            qty: z.number().int().positive("qty must be a positive integer"),
        })
    )
    .min(1, "At least one item is required"),
})

export type CreateHoldInput = z.infer<typeof createHoldSchema>