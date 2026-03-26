import { Router } from "express";
import { prisma } from "../db";
import { hashPassword } from "../lib/password";

const clientAuthController = Router();

clientAuthController.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        }

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required", });
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 6) {
            return res.status(400).json({ error: "Password must be at least 6 characters long", });
        }

        const existingClient = await prisma.clientUser.findUnique({
            where: { email: normalizedEmail }
        })

        if (existingClient) {
            return res.status(409).json({ error: "Client with this email already exists", });
        }

        const passwordHash = await hashPassword(password);

        const client = await prisma.clientUser.create({
            data: {
                email: normalizedEmail,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            }
        })

        return res.status(201).json({ client, });
    } catch (error) {
        console.error("Client register error:", error);
        return res.status(500).json({ error: "Failed to register client", });
    }
});

clientAuthController.post("/login", async (req, res) => {
  return res.status(501).json({ message: "Client login not implemented yet" });
});

clientAuthController.post("/refresh", async (req, res) => {
  return res.status(501).json({ message: "Client refresh not implemented yet" });
});

clientAuthController.post("/logout", async (req, res) => {
  return res.status(501).json({ message: "Client logout not implemented yet" });
});

export default clientAuthController;