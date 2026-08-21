export const TEST_DATABASE_NAME = "fms_test";

export const isTestRuntime = () =>
  process.env.NODE_ENV === "test" || Boolean(process.env.VITEST);

export const rewriteDatabaseUrlForTests = (url: string) => {
  const parsed = new URL(url);
  parsed.pathname = `/${TEST_DATABASE_NAME}`;
  return parsed.toString();
};

export const databaseNameFromUrl = (url: string) => {
  const parsed = new URL(url);
  return decodeURIComponent(parsed.pathname.replace(/^\//, "").split("/")[0] ?? "");
};

export const assertTestDatabaseUrl = (url: string) => {
  const name = databaseNameFromUrl(url);
  if (name !== TEST_DATABASE_NAME) {
    throw new Error(
      `Refusing to run tests against database "${name}". Expected ${TEST_DATABASE_NAME}.`,
    );
  }
};
