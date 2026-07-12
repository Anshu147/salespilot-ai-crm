export const SYSTEM_ROLES = {
    OWNER: "Owner",
    ADMIN: "Admin",
    MANAGER: "Manager",
    SALES_EXECUTIVE: "Sales Executive",
} as const;

export type SystemRole =
    (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];