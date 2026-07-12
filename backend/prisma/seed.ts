import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env.js";
const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
    const roles = [
        {
            name: "Owner",
            description: "Organization owner",
        },
        {
            name: "Admin",
            description: "Administrator",
        },
        {
            name: "Manager",
            description: "Manager",
        },
        {
            name: "Sales Executive",
            description: "Sales Executive",
        },
    ];

    for (const role of roles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }

    console.log("✅ Roles seeded");
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });