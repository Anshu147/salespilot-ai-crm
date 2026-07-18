import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { successResponse } from "../../utils/response.js";
import { UnauthorizedError } from "../../utils/error.js";

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

export const me = async (req: Request, res: Response) => {
    return successResponse(
        res, req.user, "Current User"
    )
}

export const login = async (req: Request, res: Response) => {
    const result = await authService.login(req.body);

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
        "Login successful",
        200
    );
}

export const refreshToken = async (req: Request, res: Response) => {
    console.log(req.cookies, "cookies")
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken)
    if (!refreshToken) {
        return new UnauthorizedError("refresh Token no found!!!")
    }
    const result = await authService.refreshToken({ refreshToken })
    return successResponse(
        res,
        {

            accessToken: result.accessToken,
            refreshToken: result.refreshToken
        },
        "Registration successful",
        201
    );
}

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    await authService.logout({ refreshToken });
    res.clearCookie("refreshToken");
    return successResponse(
        res,
        {},
        "Logout successful",
        200
    );
}