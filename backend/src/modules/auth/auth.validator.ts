import { z } from "zod";

export const registerSchema = z.object({
    organization: z.object({
        name: z
            .string()
            .min(3, "Organization name must be at least 3 characters"),
    }),

    user: z.object({
        firstName: z
            .string()
            .min(2, "First name must be at least 2 characters"),

        lastName: z
            .string()
            .min(2, "Last name must be at least 2 characters"),

        email: z.email(),

        password: z
            .string()
            .min(8)
            .regex(/[A-Z]/, "Must contain one uppercase letter")
            .regex(/[a-z]/, "Must contain one lowercase letter")
            .regex(/[0-9]/, "Must contain one number")
            .regex(
                /[!@#$%^&*(),.?":{}|<>]/,
                "Must contain one special character"
            ),
    }),
});

export const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;