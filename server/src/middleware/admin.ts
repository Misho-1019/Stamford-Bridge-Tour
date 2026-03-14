import { Request, Response, NextFunction } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    const adminSecret = process.env.ADMIN_SECRET;
    const providedSecret = req.headers['x-admin-secret']

    if (!adminSecret) {
        return res.status(500).json({ error: 'ADMIN_SECRET is not configured' })
    }

    if (!providedSecret || providedSecret !== adminSecret) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    next();
}