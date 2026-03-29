import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../lib/auth";

export function requireClientAuth(req: Request, res: Response, next: NextFunction) {
    try {
        const accessToken = req.cookies?.accessToken as string | undefined;

        if (!accessToken) {
            return res.status(401).json({ error: "Missing access token", });
        }

        const decoded = verifyAccessToken(accessToken);

        if (decoded.userType !== 'CLIENT') {
            return res.status(403).json({ error: "Forbidden", });
        }

        req.client = {
            id: decoded.sub,
            email: decoded.email,
        }

        req.admin = undefined;

        next();
    } catch (error) {
        return res.status(401).json({ error: "Invalid or expired access token", });
    }
}