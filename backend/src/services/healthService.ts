import { prisma } from "../config/prisma.js";

export const checkDatabaseConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: "PostgreSQL reachable",
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Database connection failed";

    return {
      connected: false,
      message,
    };
  }
};
