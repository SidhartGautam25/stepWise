import { PrismaClient } from "@prisma/client";

/**
 * Singleton Prisma client for the entire application.
 *
 * In development, tsx/ts-node hot-reloads modules which would naively create
 * a new PrismaClient on every reload, quickly exhausting the Postgres connection
 * pool. We attach the instance to `globalThis` so it survives module reloads.
 *
 * In production (a single long-lived process), `globalThis.__prisma` is simply
 * undefined and we create a fresh client once.
 */

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.__prisma = prisma;
}
