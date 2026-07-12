import slugify from "slugify";
import crypto from "crypto";

export const generateOrganizationSlug = (name: string) => {
    const baseSlug = slugify(name, {
        lower: true,
        strict: true,
        trim: true,
    });

    const randomSuffix = crypto.randomBytes(3).toString("hex");

    return `${baseSlug}-${randomSuffix}`;
};