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

    return prisma.refreshToken.create({
        data: {
            tokenHash,
            userType: params.userType,
            adminUserId: params.adminUserId,
            clientUserId: params.adminUserId,
            expiresAt: getRefreshTokenExpiresAt(),
        }
    })
}