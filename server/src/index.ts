import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

app.get('/health', (req, res) => {
    res.json({ ok: true, services: 'bridge-tour-api' })
})

const PORT = process.env.PORT ? Number(process.env.PORT) : '3030';

app.listen(PORT, () => console.log(`Server is listening on: http://localhost:${PORT}`))