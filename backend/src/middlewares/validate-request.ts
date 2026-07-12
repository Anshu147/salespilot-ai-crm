import { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";

type Schema = ZodType;

export const validateRequest = (schema: Schema) => {
    return async (
        req: Request,
        _res: Response,
        next: NextFunction
    ) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        } catch (error) {
            next(error);
        }
    };
};