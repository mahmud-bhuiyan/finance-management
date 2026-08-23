const REMEMBERED_LOGIN_KEY = "fms-remembered-login";
const LEGACY_REMEMBERED_EMAIL_KEY = "fms-remembered-email";

export type RememberedLogin = {
  email: string;
  password: string;
};

export const readRememberedLogin = (): RememberedLogin | null => {
  try {
    const raw = localStorage.getItem(REMEMBERED_LOGIN_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<RememberedLogin>;
      if (parsed.email && parsed.password) {
        return {
          email: parsed.email.trim().toLowerCase(),
          password: parsed.password,
        };
      }
    }

    const legacyEmail = localStorage.getItem(LEGACY_REMEMBERED_EMAIL_KEY)?.trim();
    if (legacyEmail) {
      return { email: legacyEmail.toLowerCase(), password: "" };
    }

    return null;
  } catch {
    return null;
  }
};

export const persistRememberedLogin = (email: string, password: string) => {
  try {
    localStorage.setItem(
      REMEMBERED_LOGIN_KEY,
      JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
      }),
    );
    localStorage.removeItem(LEGACY_REMEMBERED_EMAIL_KEY);
  } catch {
    // Ignore quota errors and private browsing.
  }
};

export const clearRememberedLogin = () => {
  try {
    localStorage.removeItem(REMEMBERED_LOGIN_KEY);
    localStorage.removeItem(LEGACY_REMEMBERED_EMAIL_KEY);
  } catch {
    // Ignore private browsing.
  }
};
