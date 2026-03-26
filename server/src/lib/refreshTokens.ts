import { prisma } from "../db";
import { hashToken } from "./auth";
import { getRefreshTokenExpiresAt } from "./authDates";

type UserType = 'ADMIN' | 'CLIENT';

export async function createRefreshToken(params: {
    token: string;
    userType: UserType;
    adminUserId?: string;
    clientUserId?: string;
}) {
    const tokenHash = hashToken(params.token);

    if (params.userType === 'ADMIN') {
        if (!params.adminUserId) {
            throw new Error("adminUserId is required for ADMIN refresh tokens");
        }

        return prisma.refreshToken.create({
            data: {
                tokenHash,
                userType: 'ADMIN',
                adminUserId: params.adminUserId,
                expiresAt: getRefreshTokenExpiresAt(),
            }
        })
    }

    if (!params.clientUserId) {
        throw new Error("clientUserId is required for CLIENT refresh tokens");
    }

    return prisma.refreshToken.create({
        data: {
            tokenHash,
            userType: 'CLIENT',
            clientUserId: params.clientUserId,
            expiresAt: getRefreshTokenExpiresAt(),
        }
    })
}