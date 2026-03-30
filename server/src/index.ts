import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import routes from "./routes";
import webhookController from "./controllers/webhookController";
import { requestLogger } from "./middleware/requestLogger";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }))

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

const PORT = process.env.PORT ? Number(process.env.PORT) : 3030;

app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`))