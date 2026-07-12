import authRepository, { AuthRepository } from "./auth.repository.js";
import type { RegisterInput } from "./auth.validator.js";
import type { RegisterResponse } from "./auth.types.js";
import { transaction } from "../../lib/db.js";
import { ConflictError, NotFoundError } from "../../utils/error.js";
import { generateOrganizationSlug } from "../../utils/slug.js";
import { hashPassword, hashToken } from "../../utils/password.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/jwt.js";
import { SYSTEM_ROLES } from "../../constants/roles.js";
import { Prisma } from "../../../generated/prisma/client.js";
import { REFRESH_TOKEN_EXPIRY_MS } from "../../constants/expire.js";
export class AuthService {
    constructor(private authRepository: AuthRepository) {
        this.authRepository = authRepository;
    }
    async register(input: RegisterInput): Promise<RegisterResponse> {
        try {
            return transaction(async (tx) => {
                const slug = generateOrganizationSlug(input.organization.name);
                const organization =
                    await this.authRepository.createOrganization(tx, {
                        name: input.organization.name,
                        slug
                    });
                const ownerRole =
                    await this.authRepository.findRoleByName(SYSTEM_ROLES.OWNER);

                if (!ownerRole) {
                    throw new NotFoundError("Owner role not found");
                }
                const hashedPassword =
                    await hashPassword(input.user.password);
                const user =
                    await this.authRepository.createUser(tx, {
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
                await this.authRepository.saveRefreshToken(tx, {
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
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
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

    async login() { }

    async logout() { }

    async refreshToken() { }
}

export default new AuthService(authRepository);