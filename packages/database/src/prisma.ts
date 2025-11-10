import { PrismaClient } from "./generated/prisma/index.js";

/**
 * Shared Prisma client - prevents connection storms
 * Especially important for serverless/edge environments
 * 
 * Uses global caching in development to prevent hot-reload issues
 */
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

/**
 * Graceful shutdown - call this on SIGTERM
 * Disconnects from the database and cleans up resources
 */
export async function disconnectPrisma(): Promise<void> {
  console.log('Disconnecting Prisma...');
  await prisma.$disconnect();
  console.log('Prisma disconnected');
}

export * from "./generated/prisma/index.js";
