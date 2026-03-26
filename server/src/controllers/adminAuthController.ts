import { Router } from "express";
import { prisma } from "../db";
import { comparePassword, hashPassword } from "../lib/password";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/auth";
import { clearAuthCookies, setAuthCookies } from "../lib/cookies";
import { getRefreshTokenExpiresAt } from "../lib/authDates";

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
        const refreshTokenExpiresAt = getRefreshTokenExpiresAt();

        await prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
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
    try {
        const refreshToken = req.cookies?.refreshToken as string | undefined;

        if (!refreshToken) {
            return res.status(401).json({ error: "Missing refresh token", })
        }

        const decoded = verifyRefreshToken(refreshToken);

        if (decoded.userType !== 'ADMIN') {
            return res.status(401).json({ error: "Invalid refresh token", })
        }

        const currentTokenHash = hashToken(refreshToken);

        const existingToken = await prisma.refreshToken.findUnique({
            where: {
                tokenHash: currentTokenHash,
            },
            include: {
                adminUser: true,
            },
        })

        if (!existingToken) {
            return res.status(401).json({ error: "Refresh token not found" })
        }

        if (existingToken.userType !== 'ADMIN' || !existingToken.adminUser) {
            return res.status(401).json({ error: "Invalid refresh token", })
        }

        if (existingToken.revokedAt) {
            return res.status(401).json({ error: "Refresh token has been revoked", })
        }

        if (existingToken.expiresAt <= new Date()) {
            return res.status(401).json({ error: "Refresh token has expired", })
        }

        const admin = existingToken.adminUser;

        const newAccessToken = signAccessToken({
            sub: admin.id,
            email: admin.email,
            userType: 'ADMIN'
        })

        const newRefreshToken = signRefreshToken({
            sub: admin.id,
            userType: 'ADMIN',
        })

        const newRefreshTokenHash = hashToken(newRefreshToken);
        const newRefreshTokenExpiresAt = getRefreshTokenExpiresAt();

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: {
                    tokenHash: currentTokenHash,
                },
                data: {
                    revokedAt: new Date(),
                    replacedByTokenHash: newRefreshTokenHash,
                }
            }),
            prisma.refreshToken.create({
                data: {
                    tokenHash: newRefreshTokenHash,
                    userType: 'ADMIN',
                    adminUserId: admin.id,
                    expiresAt: newRefreshTokenExpiresAt,
                }
            })
        ]);

        setAuthCookies(res, newAccessToken, newRefreshToken);

        return res.status(200).json({
            admin: {
                id: admin.id,
                email: admin.email,
            }
        })
    } catch (error) {
        console.error("Admin refresh error:", error);
        return res.status(401).json({
            error: "Invalid or expired refresh token",
        });
    }
});

adminAuthController.post("/logout", async (req, res) => {
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

        clearAuthCookies(res)

        return res.status(200).json({ message: "Logged out successfully", })
    } catch (error) {
        console.error("Admin logout error:", error);

        clearAuthCookies(res);
    
        return res.status(200).json({
          message: "Logged out",
        });
    }
});

export default adminAuthController;