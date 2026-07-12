import prisma from "./prisma.js";


export const transaction = prisma.$transaction.bind(prisma);