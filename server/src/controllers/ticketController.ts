import { Router } from "express";
import { prisma } from "../db";

const ticketController = Router();

ticketController.get('/', async (req, res) => {
    const types = await prisma.ticketType.findMany({
        where: { isActive: true },
        orderBy: { priceCents: 'asc' },
    })

    res.json(types)
})

export default ticketController;