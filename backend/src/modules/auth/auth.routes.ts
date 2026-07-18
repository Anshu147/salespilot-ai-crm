import { Router } from "express";
import { login, me, refreshToken, register } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { loginSchema, refreshTokenSchema, registerSchema } from "./auth.validator.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.get("/me", authenticate, me)

router.post("/login", validateRequest(loginSchema), login)
router.post("/refresh", refreshToken)
export default router;