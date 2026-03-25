import { Router } from "express";
import { prisma } from "../db";
import { hashPassword } from "../lib/password";

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
    return res.status(501).json({ message: 'Admin login not implement yet' })
})

adminAuthController.post("/refresh", async (req, res) => {
    return res.status(501).json({ message: "Admin refresh not implemented yet" });
});

adminAuthController.post("/logout", async (req, res) => {
    return res.status(501).json({ message: "Admin logout not implemented yet" });
});

export default adminAuthController;