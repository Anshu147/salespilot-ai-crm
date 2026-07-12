import type { User } from "@prisma/client";

export interface RegisterResponse {
    user: Omit<User, "password">;
    accessToken: string;
    refreshToken: string;
}