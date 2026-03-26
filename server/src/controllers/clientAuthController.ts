import { Router } from "express";
import { prisma } from "../db";
import { comparePassword, hashPassword } from "../lib/password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/auth";
import { clearAuthCookies, setAuthCookies } from "../lib/cookies";

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
    try {
        const refreshToken = req.cookies?.refreshToken as string | undefined;

        if (!refreshToken) {
            return res.status(401).json({ error: "Missing refresh token", });
        }

        const decoded = verifyRefreshToken(refreshToken);

        if (decoded.userType !== 'CLIENT') {
            return res.status(401).json({ error: "Invalid refresh token", });
        }

        const currentTokenHash = hashToken(refreshToken);

        const existingToken = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: currentTokenHash,
            },
            include: {
                clientUser: true,
            }
        })

        if (!existingToken) {
            return res.status(401).json({ error: "Refresh token not found", });
        }

        if (existingToken.userType !== 'CLIENT' || !existingToken.clientUser) {
            return res.status(401).json({ error: "Invalid refresh token", });
        }

        if (existingToken.revokedAt) {
            return res.status(401).json({ error: "Refresh token has been revoked", });
        }

        if (existingToken.expiresAt <= new Date()) {
            return res.status(401).json({ error: "Refresh token has expired", });
        }

        const client = existingToken.clientUser;

        const newAccessToken = signAccessToken({
            sub: client.id,
            email: client.email,
            userType: 'CLIENT',
        })
        
        const newRefreshToken = signRefreshToken({
            sub: client.id,
            userType: 'CLIENT',
        })

        const newRefreshTokenHash = hashToken(newRefreshToken);
        const newRefreshTokenExpiresAt = new Date(
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
        )

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { tokenHash: currentTokenHash },
                data: {
                    revokedAt: new Date(),
                    replacedByTokenHash: newRefreshTokenHash,
                }
            }),
            prisma.refreshToken.create({
                data: {
                    tokenHash: newRefreshTokenHash,
                    userType: 'CLIENT',
                    clientUserId: client.id,
                    expiresAt: newRefreshTokenExpiresAt,
                }
            })
        ]);

        setAuthCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({
            client: {
                id: client.id,
                email: client.email,
            },
        });
    } catch (error) {
        console.error("Client refresh error:", error);
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

clientAuthController.post("/logout", async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken as string | undefined;

        if (refreshToken) {
            const tokenHash = hashToken(refreshToken);

            await prisma.refreshToken.updateMany({
                where: {
                    tokenHash,
                    revokedAt: null,
                },
                data: {
                    revokedAt: new Date(),
                }
            })
        }

        clearAuthCookies(res);

        return res.status(200).json({ message: "Logged out successfully", });
    } catch (error) {
        console.error("Client logout error:", error);

        clearAuthCookies(res);
    
        return res.status(200).json({
            message: "Logged out",
        });
    }
});

export default clientAuthController;