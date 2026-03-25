import { Router } from "express";
import { prisma } from "../db";
import { comparePassword, hashPassword } from "../lib/password";
import { hashToken, signAccessToken, signRefreshToken } from "../lib/auth";
import { setAuthCookies } from "../lib/cookies";

const adminAuthController = Router();

adminAuthController.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        }

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required",
            })
        }

        const normalizedEmail = email.trim().toLowerCase();

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long",
            })
        }

        const existingAdmin = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
        })

        if (existingAdmin) {
            return res.status(409).json({
                error: "Admin with this email already exists",
            });
        }

        const passwordHash = await hashPassword(password)

        const admin = await prisma.adminUser.create({
            data: {
                email: normalizedEmail,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                createdAt: true,
            },
        })

        return res.status(201).json({
            admin
        })
    } catch (error) {
        console.error("Admin register error:", error);
        return res.status(500).json({
            error: "Failed to register admin",
        });
    }
})

adminAuthController.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        }

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required", })
        }

        const normalizedEmail = email.trim().toLowerCase();

        const admin = await prisma.adminUser.findUnique({
            where: { email: normalizedEmail },
        })

        if (!admin) {
            return res.status(401).json({ error: "Invalid email or password", })
        }

        const isPasswordValid = await comparePassword(password, admin.passwordHash);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid email or password", })
        }

        const accessToken = signAccessToken({
            sub: admin.id,
            email: admin.email,
            userType: 'ADMIN',
        })

        const refreshToken = signRefreshToken({
            sub: admin.id,
            userType: 'ADMIN',
        })

        const refreshTokenHash = hashToken(refreshToken);
        const refreshTokenExpiresAt = new Date(
            Date.now() + Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7) * 24 * 60 * 60 * 1000,
        )

        await prisma.refreshToken.create({
            data: {
                tokenHash: refreshToken,
                userType: 'ADMIN',
                adminUserId: admin.id,
                expiresAt: refreshTokenExpiresAt,
            }
        })

        setAuthCookies(res, accessToken, refreshToken)

        return res.status(200).json({
            admin: {
                id: admin.id,
                email: admin.email,
            }
        })
    } catch (error) {
        console.error("Admin login error:", error);
        return res.status(500).json({
            error: "Failed to login admin",
        });
    }
})

adminAuthController.post("/refresh", async (req, res) => {
    return res.status(501).json({ message: "Admin refresh not implemented yet" });
});

adminAuthController.post("/logout", async (req, res) => {
    return res.status(501).json({ message: "Admin logout not implemented yet" });
});

export default adminAuthController;