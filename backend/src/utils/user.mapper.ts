import type { User } from "@prisma/client";

export const mapUserToDTO = (user: User) => {
    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
    };
}