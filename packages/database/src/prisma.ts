import { PrismaClient } from "./generated/prisma/index.js";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"]
});

export { prisma };
export * from "./generated/prisma/index.js";
