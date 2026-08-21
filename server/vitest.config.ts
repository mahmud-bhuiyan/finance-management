import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
    globalSetup: ["./test/globalSetup.ts"],
    fileParallelism: false,
    maxWorkers: 1,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    teardownTimeout: 20_000,
    env: {
      NODE_ENV: "test",
      JWT_SECRET: "test-jwt-secret-must-be-at-least-32ch",
      SUPER_ADMIN_EMAIL: "superadmin@fms.test",
      SUPER_ADMIN_PASSWORD: "password123",
      SUPER_ADMIN_NAME: "Test Super Admin",
    },
  },
});
