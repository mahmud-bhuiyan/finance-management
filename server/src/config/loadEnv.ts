import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  isTestRuntime,
  rewriteDatabaseUrlForTests,
} from "./testDatabaseUrl.js";

const fromHere = (relative: string) =>
  fileURLToPath(new URL(relative, import.meta.url));

const envLocal = fromHere("../../.env.local");
const envTest = fromHere("../../.env.test");

config({ path: envLocal });
config({ path: path.resolve(process.cwd(), ".env.local") });

if (isTestRuntime()) {
  process.env.NODE_ENV = "test";
  config({ path: envTest, override: true });
  config({ path: path.resolve(process.cwd(), ".env.test"), override: true });
  if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("fms_test")) {
    process.env.DATABASE_URL = rewriteDatabaseUrlForTests(
      process.env.DATABASE_URL,
    );
  }
  process.env.UPLOAD_DIR = process.env.UPLOAD_DIR_TEST ?? "./uploads-test";
}
