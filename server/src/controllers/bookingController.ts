import { Router } from "express";
import { prisma } from "../db";

const bookingController = Router();

bookingController.get('/by-session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' })
        }

        const booking = await prisma.booking.findUnique({
            where: {
                stripeSessionId: sessionId,
            },
        })

        if (!booking) {
            return res.json({
                status: 'PENDING',
            })
        }

        return res.json({
            status: 'CONFIRMED',
            booking,
        })
    } catch (error) {
        console.error("Get booking by session error:", error);
        return res.status(500).json({ error: 'Failed to fetch booking status' })
    }
})

export default bookingController;