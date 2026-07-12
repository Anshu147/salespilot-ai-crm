import type { Request, Response } from "express";
import authService from "./auth.service.js";
import { successResponse } from "../../utils/response.js";

export const register = async (
    req: Request,
    res: Response
) => {
    const result = await authService.register(req.body);

    return successResponse(
        res,
        result,
        "User registered successfully",
        201
    );
};