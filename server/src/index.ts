import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes";
import webhookController from "./controllers/webhookController";
import { requestLogger } from "./middleware/requestLogger";
import { env } from "./lib/env";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.set('trust proxy', true);

const allowedOrigins = ['http://localhost:5173', process.env.CLIENT_URL].filter(Boolean);

app.use(cors({ 
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true)
        }

        return callback(new Error('CORS origin not allowed'))
    },
    credentials: true,
}))

app.post(
    '/webhooks/stripe',
    express.raw({ type: 'application/json' }),
    (req, res, next) => {
        next();
    }
)

app.use(requestLogger);

app.use(express.json())

app.use(cookieParser())

app.get('/health', (req, res) => {
    res.json({ ok: true, services: 'bridge-tour-api' })
})

app.use('/webhooks', webhookController)
app.use(routes)

app.use(errorHandler);

const PORT = env.PORT;

app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`))