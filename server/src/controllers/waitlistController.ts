import { Router } from "express";
import { prisma } from "../db";
import { z } from "zod";
import { getZodErrorResponse } from "../lib/zod";

const waitlistController = Router();

const joinWaitlistSchema = z.object({
    email: z.string().email("Invalid email address"),
});

waitlistController.post("/:slotId", async (req, res) => {
    try {
        const { slotId } = req.params;

        if (!slotId) {
            return res.status(400).json({ error: "Slot ID is required" });
        }

        const parsedBody = joinWaitlistSchema.safeParse(req.body);

        if (!parsedBody.success) {
            return res.status(400).json(getZodErrorResponse(parsedBody.error));
        }

        const { email } = parsedBody.data;
        const normalizedEmail = email.trim().toLowerCase();

        const slot = await prisma.tourSlot.findUnique({
            where: { id: slotId },
        });

        if (!slot || !slot.isActive) {
            return res.status(404).json({ error: "Slot not found" });
        }

        const existingEntry = await prisma.waitlistEntry.findUnique({
            where: {
                slotId_email: { slotId, email: normalizedEmail },
            },
        });

        if (existingEntry) {
            return res.status(200).json({
                message: "You are already on the waitlist for this slot.",
            });
        }

        await prisma.waitlistEntry.create({
            data: {
                slotId,
                email: normalizedEmail,
            },
        });

        return res.status(201).json({
            message: "You have been added to the waitlist. We'll notify you if a spot opens up.",
        });
    } catch (error) {
        console.error("Waitlist error:", error);
        return res.status(500).json({ error: "Failed to join waitlist" });
    }
});

export default waitlistController;
