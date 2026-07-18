import type { User } from "@prisma/client";
import type { mapUserToDTO } from "../../utils/user.mapper.js";
export interface RegisterResponse {
    user: ReturnType<typeof mapUserToDTO>;
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    user: ReturnType<typeof mapUserToDTO>;
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenResponse {
    accessToken: String;
    refreshToken: String;
}