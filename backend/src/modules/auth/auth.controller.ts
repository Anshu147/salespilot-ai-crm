import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { successResponse } from "../../utils/response.js";

export const register = async (
    req: Request,
    res: Response
) => {
    const result = await authService.register(req.body);

    res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return successResponse(
        res,
        {
            user: result.user,
            accessToken: result.accessToken,
        },
        "Registration successful",
        201
    );
};