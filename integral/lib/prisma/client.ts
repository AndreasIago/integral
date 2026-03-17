// Prisma 7 requires a driver adapter. This is set up when DATABASE_URL is available.
// For Phase 1 (mock data), this module exists but PrismaClient won't be instantiated
// without a real database connection.
//
// To connect: add @prisma/adapter-pg and update this file per Prisma 7 docs.
// See: https://www.prisma.io/docs/orm/more/help-and-troubleshooting/prisma-v7-migration-guide

export type { PrismaClient } from "@/app/generated/prisma/client";
