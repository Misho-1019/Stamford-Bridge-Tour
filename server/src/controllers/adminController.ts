import { Router } from "express";
import { generateSlots } from "../lib/slotGenerator";
import { requireAdmin } from "../middleware/admin";
import { DatasetFixtureProvider } from "../providers/datasetFixtureProvider";
import { syncBlackouts } from "../lib/syncBlackouts";

const adminController = Router();

adminController.post('/slots/generate', requireAdmin, async (req, res) => {
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

adminController.post('/blackouts/sync', requireAdmin, async (req, res) => {
    try {
        const rawDaysAhead = req.query.daysAhead;
        const daysAhead = rawDaysAhead ? Number(rawDaysAhead) : 180;

        if (!Number.isInteger(daysAhead) || daysAhead <= 0) {
            return res.status(400).json({ error: 'daysAhead must be a positive integer' })
        }

        const provider = new DatasetFixtureProvider();
        const result = await syncBlackouts(provider, daysAhead);

        return res.json({
            provider: 'dataset',
            ...result,
        })
    } catch (error) {
        console.error("Sync blackouts error:", error);
        return res.status(500).json({ error: "Failed to sync blackouts" });
    }
})

export default adminController;