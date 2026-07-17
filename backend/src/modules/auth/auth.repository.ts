import { Prisma, type Role, type User } from "@prisma/client";
import prisma from "../../lib/prisma.js";

export class AuthRepository {
    async findUserByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }, include: {
                role: true,
            },
        });
    }

    async findRoleByName(name: string): Promise<Role | null> {
        return prisma.role.findUnique({
            where: { name },
        });
    }

    async createRole(
        tx: Prisma.TransactionClient,
        data: Prisma.RoleCreateInput
    ) {
        return tx.role.create({
            data,
        });
    }

    async createOrganization(
        tx: Prisma.TransactionClient,
        data: Prisma.OrganizationCreateInput
    ) {
        return tx.organization.create({
            data,
        });
    }

    async createUser(
        tx: Prisma.TransactionClient,
        data: Prisma.UserCreateInput
    ) {
        return tx.user.create({
            data,
        });
    }

    async createSession(
        tx: Prisma.TransactionClient,
        data: Prisma.SessionCreateInput
    ) {
        return tx.session.create({
            data,
        });
    }
}

export default new AuthRepository();