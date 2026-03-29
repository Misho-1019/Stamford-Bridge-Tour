import { prisma } from "../db";

type UserType = 'ADMIN' | 'CLIENT';

export async function revokeUserRefreshTokens(params: {
    userType: UserType;
    adminUserId?: string;
    clientUserId?: string;
}) {
    if (params.userType === 'ADMIN') {
        if (!params.adminUserId) {
            throw new Error("adminUserId is required for ADMIN token revocation");
        }

        await prisma.refreshToken.updateMany({
            where: {
                userType: 'ADMIN',
                adminUserId: params.adminUserId,
                revokedAt: null,
            },
            data: {
                revokedAt: new Date(),
            }
        })

        return;
    }

    if (!params.clientUserId) {
        throw new Error("clientUserId is required for CLIENT token revocation");
    }

    await prisma.refreshToken.updateMany({
        where: {
            userType: 'CLIENT',
            clientUserId: params.clientUserId,
            revokedAt: null,
        },
        data: {
            revokedAt: new Date(),
        }
    })
}