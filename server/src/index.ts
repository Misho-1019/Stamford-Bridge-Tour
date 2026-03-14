import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";
import { requireAdmin } from "./middleware/admin";
import { generateSlots } from "./lib/slotGenerator";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ ok: true, services: 'bridge-tour-api' })
})

app.get('/ticket-types', async (req, res) => {
    const types = await prisma.ticketType.findMany({
        where: { isActive: true },
        orderBy: { priceCents: 'asc' },
    })

    res.json(types)
})

app.post('/admin/slots/generate', requireAdmin, async (req, res) => {
    const rawDays = req.query.days;
    const days = rawDays ? Number(rawDays) : 60;

    if (!Number.isInteger(days) || days <= 0) {
        return res.status(400).json({ error: 'days must be a positive integer' });
    }

    try {
        const result = await generateSlots(days)

        res.json(result);
    } catch (error) {
        console.error('Error generating slots:', error);
        res.status(500).json({ error: 'Failed to generate slots' });
    }
})

const PORT = process.env.PORT ? Number(process.env.PORT) : '3030';

app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`))