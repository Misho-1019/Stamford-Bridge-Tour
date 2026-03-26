import 'express';

declare global {
    namespace Express {
        interface Request {
            admin?: {
                id: string;
                email: string;
            };
            client?: {
                id: string;
                email: string;
            }
        }
    }
}

export {};