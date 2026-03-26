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
                userType: params.userType,
                adminUserId: params.adminUserId,
                clientUserId: params.clientUserId,
                expiresAt: getRefreshTokenExpiresAt(),
            }
        })
    ])
}