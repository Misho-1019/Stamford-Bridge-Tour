import { Router } from "express";
import { prisma } from "../db";

const ticketController = Router();

ticketController.get('/', async (req, res) => {
    try {
        const types = await prisma.ticketType.findMany({
            where: { isActive: true },
            orderBy: { priceCents: 'asc' },
        })
    
        res.json(types)
    } catch (error) {
        console.error('Failed to fetch ticket types:', error);
        res.status(500).json({ error: 'Failed to fetch ticket types' });
    }
})

export default ticketController;