import type { NextFunction, Request, Response } from "express"
import { UnauthorizedError } from "../utils/error.js";
import { verifyAccessToken } from "../utils/jwt.js";
import authRepository from "../modules/auth/auth.repository.js";


export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authheader = req.headers.authorization;
        if (!authheader) {
            throw new UnauthorizedError("No authorization header provided");
        }
        if (!authheader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Invalid authorization header");
        }
        const token = authheader.split(" ")[1];
        const decodedToken = verifyAccessToken(token);
        const user = await authRepository.findUserById(decodedToken.userId)
        if (!user) {
            throw new UnauthorizedError("User not found")
        }
        if (!user.isActive) {
            throw new UnauthorizedError("User accounnt is inactive")


        }
        req.user = {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            organizationId: user.organizationId,
            role: user.role.name,
            emailVerified: user.emailVerified,
        }
        next();
    } catch (error) {
        next(error)
    }
}