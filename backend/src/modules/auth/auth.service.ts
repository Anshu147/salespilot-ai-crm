import authRepository, { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RefreshTokenInput, RegisterInput } from "./auth.validator.js";
import type { LoginResponse, RefreshTokenResponse, RegisterResponse } from "./auth.types.js";
import { transaction } from "../../lib/db.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/error.js";
import { generateOrganizationSlug } from "../../utils/slug.js";
import { comparePassword, hashPassword, hashToken } from "../../utils/password.js";
import { verifyRefreshToken } from "../../utils/jwt.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { mapUserToDTO } from "../../utils/user.mapper.js";
import bcrypt from "bcrypt";
import { createAuthenticatedSession } from "../../utils/create.authenticate.session.js";
export class AuthService {
    constructor(private authRepository: AuthRepository) {

    }
    async register(input: RegisterInput): Promise<RegisterResponse> {
        try {
            return await transaction(async (tx) => {
                const slug = generateOrganizationSlug(input.organization.name);
                const organization =
                    await authRepository.createOrganization(tx, {
                        name: input.organization.name,
                        slug
                    });
                const ownerRole =
                    await authRepository.findRoleByName(SYSTEM_ROLES.OWNER);

                if (!ownerRole) {
                    throw new NotFoundError("Owner role not found");
                }
                const hashedPassword =
                    await hashPassword(input.user.password);
                const user =
                    await authRepository.createUser(tx, {
                        firstName: input.user.firstName,
                        lastName: input.user.lastName,
                        email: input.user.email,
                        password: hashedPassword,

                        organization: {
                            connect: {
                                id: organization.id
                            }
                        },

                        role: {
                            connect: {
                                id: ownerRole.id
                            }
                        }
                    });
                const { accessToken, refreshToken } = await createAuthenticatedSession(tx, user);

                return {
                    user: mapUserToDTO(user),
                    accessToken,
                    refreshToken,
                };
            });
        } catch (error) {
            console.log(error)
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError("Email already exists");
            }

            throw error;
        }
    }

    // async login(input: LoginInput): Promise<LoginResponse> {


    //     return transaction(async (tx) => {
    //         const existingUser = await authRepository.findUserByEmail(input.email)
    //         if (!existingUser) {
    //             throw new UnauthorizedError("Invalid credentials");
    //         }
    //         const isPasswordValid = await comparePassword(
    //             input.password,
    //             existingUser.password
    //         );
    //         if (!isPasswordValid) {
    //             throw new UnauthorizedError("Invalid credentials");
    //         }
    //         if (!existingUser.isActive) {
    //             throw new UnauthorizedError("Your account is inactive");
    //         }

    //         const accessToken = generateAccessToken({
    //             userId: existingUser.id,
    //             organizationId: existingUser.organizationId,
    //             role: existingUser.role.name,
    //         });

    //         const refreshToken = generateRefreshToken({
    //             userId: existingUser.id,
    //         });
    //         const hashedRefreshToken = await hashToken(refreshToken);
    //         await authRepository.createSession(tx, {
    //             tokenHash: hashedRefreshToken,

    //             expiresAt: new Date(
    //                 Date.now() + REFRESH_TOKEN_EXPIRY_MS
    //             ),

    //             user: {
    //                 connect: {
    //                     id: existingUser.id,
    //                 },
    //             },
    //         });

    //         return {
    //             user: mapUserToDTO(existingUser),
    //             accessToken,
    //             refreshToken,
    //         };

    //     })

    // }
    async login(input: LoginInput): Promise<LoginResponse> {
        console.time("login-total");

        const result = await transaction(async (tx) => {
            console.time("find-user");
            const existingUser = await authRepository.findUserByEmail(input.email);
            console.timeEnd("find-user");

            if (!existingUser) {
                throw new UnauthorizedError("Invalid credentials");
            }

            console.time("compare-password");
            const isPasswordValid = await comparePassword(
                input.password,
                existingUser.password
            );
            console.timeEnd("compare-password");

            if (!isPasswordValid) {
                throw new UnauthorizedError("Invalid credentials");
            }

            if (!existingUser.isActive) {
                throw new UnauthorizedError("Your account is inactive");
            }

            const { accessToken, refreshToken, user } = await createAuthenticatedSession(tx, existingUser);

            return {
                user,
                accessToken,
                refreshToken,
            };
        });

        console.timeEnd("login-total");

        return result;
    }

    async logout(input: RefreshTokenInput) {
        const decodedRefreshToken = verifyRefreshToken(input.refreshToken);
        const sessions = await this.authRepository.findSessionsByUserId(
            decodedRefreshToken.userId
        );

        const session = sessions.find((s) =>
            bcrypt.compareSync(input.refreshToken, s.tokenHash)
        );

        if (!session) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        await authRepository.deleteSession(session.id);
    }

    async refreshToken(input: RefreshTokenInput): Promise<RefreshTokenResponse> {
        console.log("IN SERVICE");

        // 1. Verify JWT outside transaction
        const decodedRefreshToken = verifyRefreshToken(input.refreshToken);
        console.log(decodedRefreshToken, "Decode Refresh Token");

        // 2. Find user's sessions outside transaction
        const sessions = await this.authRepository.findSessionsByUserId(
            decodedRefreshToken.userId
        );

        // 3. Compare refresh token with stored hashes
        const session = sessions.find((s) =>
            bcrypt.compareSync(input.refreshToken, s.tokenHash)
        );

        console.debug(session, "session");

        if (!session) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        // 4. Get user outside transaction
        const user = await this.authRepository.findUserById(
            decodedRefreshToken.userId
        );

        if (!user || !user.isActive) {
            throw new UnauthorizedError("Invalid refresh token");
        }

        const result = await transaction(async (tx) => {
            await this.authRepository.deleteSession(session.id);
            const { accessToken, refreshToken } = await createAuthenticatedSession(tx, user);
            return {
                accessToken,
                refreshToken,
            };
        });

        return result;

    }
}

export default new AuthService(authRepository);