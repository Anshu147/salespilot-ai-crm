import { Router } from "express";
import { register } from "./auth.controller.js";
import { validateRequest } from "../../middlewares/validate-request.js";
import { registerSchema } from "./auth.validator.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);

export default router;