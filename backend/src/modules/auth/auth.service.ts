import authRepository from "./auth.repository.js";
import type { RegisterInput } from "./auth.validator.js";
import type { RegisterResponse } from "./auth.types.js";
import { transaction } from "../../lib/db.js";
import { ConflictError, NotFoundError } from "../../utils/error.js";
import { generateOrganizationSlug } from "../../utils/slug.js";
import { hashPassword } from "../../utils/password.js";
export class AuthService {
    async register(input: RegisterInput): Promise<RegisterResponse> {
        const existingUser = await authRepository.findUserByEmail(input.user.email);

        if (existingUser) {
            throw new ConflictError("Email already exists");
        }
        return transaction(async (tx) => {
            const slug = generateOrganizationSlug(input.organization.name);
            const organization =
                await authRepository.createOrganization(tx, {
                    name: input.organization.name,
                    slug
                });
            const ownerRole =
                await authRepository.findRoleByName("Owner");

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
        });
    }

    async login() { }

    async logout() { }

    async refreshToken() { }
}

export default new AuthService();