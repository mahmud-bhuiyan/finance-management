import { afterAll, beforeAll, beforeEach } from "vitest";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";
import { assertTestDatabaseUrl } from "../src/config/testDatabaseUrl.js";
import { resetTestDatabase } from "./helpers.js";

beforeAll(() => {
  assertTestDatabaseUrl(env.DATABASE_URL);
});

beforeEach(async () => {
  await resetTestDatabase();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeAll(() => {
  assertTestDatabaseUrl(env.DATABASE_URL);
});

beforeEach(async () => {
  await resetTestDatabase();
});
