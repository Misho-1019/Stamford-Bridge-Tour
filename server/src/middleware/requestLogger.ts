import { Request, Response, NextFunction } from "express";

export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on('finish', () => {
        const durationMs = Date.now() - startedAt;

        console.log(
            `${req.method} ${req.originalUrl} ${req.statusCode} - ${durationMs}ms`
        );  
    })

    next();
}