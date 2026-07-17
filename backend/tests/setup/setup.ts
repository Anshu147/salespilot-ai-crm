import { beforeEach } from "vitest";
import prisma from "../../src/lib/prisma.js";

beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
});