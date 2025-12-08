import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export // Fix for Next.js app running from root but DB being in prisma/ directory:
    // Actually, standardizing on root ./dev.db is better.
    const prismaClientSingleton = () => {
        return new PrismaClient({
            datasourceUrl: process.env.DATABASE_URL,
        });
    };

export const prisma = globalForPrisma.prisma || prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
