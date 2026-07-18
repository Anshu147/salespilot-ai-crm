import { REFRESH_TOKEN_EXPIRY_MS } from "../constants/expire.js";
import authRepository from "../modules/auth/auth.repository.js";
import { generateAccessToken, generateRefreshToken } from "./jwt.js";
import { hashToken } from "./password.js";
import { mapUserToDTO } from "./user.mapper.js";
import { type User } from "@prisma/client";
import { Prisma } from "@prisma/client";

export const createAuthenticatedSession = async (tx: Prisma.TransactionClient, user: User) => {
    const accessToken = generateAccessToken({
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role?.name
    });

    const refreshToken = generateRefreshToken({
        userId: user.id,
    });
    const hashedRefreshToken = await hashToken(refreshToken);
    await authRepository.createSession(tx, {
        tokenHash: hashedRefreshToken,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
        user: {
            connect: {
                id: user.id,
            },
        },
    });

    return {
        user: mapUserToDTO(user),
        accessToken,
        refreshToken,
    };
}