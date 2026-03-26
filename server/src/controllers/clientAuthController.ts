import { Router } from "express";
import { prisma } from "../db";
import { comparePassword, hashPassword } from "../lib/password";
import { hashToken, signAccessToken, signRefreshToken } from "../lib/auth";
import { setAuthCookies } from "../lib/cookies";

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
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        }

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required", });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const client = await prisma.clientUser.findUnique({
            where: { email: normalizedEmail },
        })

        if (!client) {
            return res.status(401).json({ error: "Invalid email or password", });
        }

        const isPasswordValid = await comparePassword(password, client.passwordHash)

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password", });
        }

        const accessToken = signAccessToken({
            sub: client.id,
            email: client.email,
            userType: 'CLIENT',
        })

        const refreshToken = signRefreshToken({
            sub: client.id,
            userType: 'CLIENT',
        })

        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenExpiresAt = new Date(
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
        )
        
        await prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                userType: 'CLIENT',
                clientUserId: client.id,
                expiresAt: refreshTokenExpiresAt,
            },
        })

        setAuthCookies(res, accessToken, refreshToken);

        return res.status(200).json({
            client: {
                id: client.id,
                email: client.email,
            },
        });
    } catch (error) {
        console.error("Client login error:", error);
        return res.status(500).json({
            error: "Failed to login client",
        });
    }
});

clientAuthController.post("/refresh", async (req, res) => {
  return res.status(501).json({ message: "Client refresh not implemented yet" });
});

clientAuthController.post("/logout", async (req, res) => {
  return res.status(501).json({ message: "Client logout not implemented yet" });
});

export default clientAuthController;