import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

interface AccessTokenPayload {
    userId: string;
    organizationId: string;
    role: string;
}

interface RefreshTokenPayload {
    userId: string;

}

export const generateAccessToken = (
    payload: AccessTokenPayload
) => {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};

export const generateRefreshToken = (
    payload: RefreshTokenPayload
) => {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
};