import { prisma } from "../db";
import { hashToken } from "./auth";
import { getRefreshTokenExpiresAt } from "./authDates";

type UserType = 'ADMIN' | 'CLIENT';

export async function rotateRefreshToken(params: {
    currentToken: string;
    newToken: string;
    userType: UserType;
    adminUserId?: string;
    clientUserId?: string;
}) {
    const currentTokenHash = hashToken(params.currentToken);
    const newTokenHash = hashToken(params.newToken);

    if (params.userType === 'ADMIN') {
        if (!params.adminUserId) {
            throw new Error("adminUserId is required for ADMIN refresh tokens");
        }

        await prisma.$transaction([
            prisma.refreshToken.update({
                where: { tokenHash: currentTokenHash },
                data: {
                    revokedAt: new Date(),
                    replacedByTokenHash: newTokenHash,
                }
            }),
            prisma.refreshToken.create({
                data: {
                    tokenHash: newTokenHash,
                    userType: 'ADMIN',
                    adminUserId: params.adminUserId,
                    expiresAt: getRefreshTokenExpiresAt(),
                }
            })
        ])

        return;
    }

    if (!params.clientUserId) {
        throw new Error("clientUserId is required for CLIENT refresh tokens");
    }

    await prisma.$transaction([
        prisma.refreshToken.update({
            where: { tokenHash: currentTokenHash },
            data: {
                revokedAt: new Date(),
                replacedByTokenHash: newTokenHash,
            }
        }),
        prisma.refreshToken.create({
            data: {
                tokenHash: newTokenHash,
                userType: 'CLIENT',
                clientUserId: params.clientUserId,
                expiresAt: getRefreshTokenExpiresAt(),
            }
        })
    ])
}