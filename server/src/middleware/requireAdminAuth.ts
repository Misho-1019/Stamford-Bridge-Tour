import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/auth";

export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = req.cookies?.accessToken as string | undefined;

        if (!accessToken) {
            return res.status(401).json({ error: "Missing access token", });
        }

        const decoded = verifyAccessToken(accessToken);

        if (decoded.userType !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden", });
        }

        req.admin = {
            id: decoded.sub,
            email: decoded.email,
        };

        req.client = undefined;

        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired access token", });
    }
}