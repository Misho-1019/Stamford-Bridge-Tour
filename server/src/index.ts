import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./db";

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

const PORT = process.env.PORT ? Number(process.env.PORT) : '3030';

app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`))