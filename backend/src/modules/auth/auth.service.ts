import authRepository, { AuthRepository } from "./auth.repository.js";
import type { LoginInput, RegisterInput } from "./auth.validator.js";
import type { InputResponse, LoginResponse, RegisterResponse } from "./auth.types.js";
import { transaction } from "../../lib/db.js";
import { ConflictError, NotFoundError, UnauthorizedError } from "../../utils/error.js";
import { generateOrganizationSlug } from "../../utils/slug.js";
import { comparePassword, hashPassword, hashToken } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { REFRESH_TOKEN_EXPIRY_MS } from "../../constants/expire.js";
import { mapUserToDTO } from "../../utils/user.mapper.js";
export class AuthService {
    constructor(private authRepository: AuthRepository) {

    }
    async register(input: RegisterInput): Promise<RegisterResponse> {
        try {
            return transaction(async (tx) => {
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
                const accessToken = generateAccessToken({
                    userId: user.id,
                    organizationId: organization.id,
                    role: ownerRole.name,
                });

                const refreshToken = generateRefreshToken({
                    userId: user.id,
                });
                const hashedRefreshToken = await hashToken(refreshToken);
                await authRepository.createSession(tx, {
                    tokenHash: hashedRefreshToken,

                    expiresAt: new Date(
                        Date.now() + REFRESH_TOKEN_EXPIRY_MS
                    ),

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
            });
        } catch (error) {
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code === "P2002"
            ) {
                throw new ConflictError("Email already exists");
            }

            throw error;
        }
    }

    async login(input: LoginInput): Promise<LoginResponse> {


        const existingUser = await authRepository.findUserByEmail(input.email)
        if (!existingUser) {
            throw new UnauthorizedError("Invalid credentials");
        }
        const isPasswordValid = await comparePassword(
            input.password,
            existingUser.password
        );
        if (!isPasswordValid) {
            throw new UnauthorizedError("Invalid credentials");
        }
        if (!existingUser.isActive) {
            throw new UnauthorizedError("Your account is inactive");
        }

        const accessToken = generateAccessToken({
            userId: existingUser.id,
            organizationId: existingUser.organizationId,
            role: existingUser.role.name,
        });

        const refreshToken = generateRefreshToken({
            userId: existingUser.id,
        });
        const hashedRefreshToken = await hashToken(refreshToken);
        await authRepository.createSession(tx, {
            tokenHash: hashedRefreshToken,

            expiresAt: new Date(
                Date.now() + REFRESH_TOKEN_EXPIRY_MS
            ),

            user: {
                connect: {
                    id: existingUser.id,
                },
            },
        });

        return {
            user: mapUserToDTO(existingUser),
            accessToken,
            refreshToken,
        };


    }

    async logout() { }

    async refreshToken() { }
}

export default new AuthService(authRepository);