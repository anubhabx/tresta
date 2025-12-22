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

const getPrismaOptions = () => {
  const log = (process.env.NODE_ENV === 'development' 
    ? ['query', 'info', 'warn', 'error'] 
    : ['error']) as any[];

  const options: any = { log };

  // In production, Digital Ocean's connection pool (PgBouncer) requires pgbouncer=true
  // to disable prepared statements, otherwise we get "prepared statement already exists" errors
  if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
      // Check if URL is valid and append param if missing
      const url = new URL(process.env.DATABASE_URL);
      if (!url.searchParams.has('pgbouncer')) {
        url.searchParams.set('pgbouncer', 'true');
        options.datasources = {
          db: {
            url: url.toString(),
          },
        };
        console.log('Applied pgbouncer=true to DATABASE_URL for handling connection pooling');
      }
    } catch (error) {
       console.warn('Failed to parse DATABASE_URL to append pgbouncer param:', error);
    }
  }

  return options;
};

export const prisma = global.prisma || new PrismaClient(getPrismaOptions());

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
