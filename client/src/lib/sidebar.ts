export const SIDEBAR_STORAGE_KEY = "fms-sidebar-collapsed";
export const SIDEBAR_USER_STORAGE_KEY = "fms-sidebar-user-id";

export const applySidebarCollapsed = (sidebarCollapsed: boolean) => {
  document.documentElement.dataset.sidebarCollapsed = String(sidebarCollapsed);
};

export const readStoredSidebarCollapsed = (): boolean | null => {
  try {
    const value = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return null;
  } catch {
    return null;
  }
};

export const readStoredSidebarUserId = (): string | null => {
  try {
    return localStorage.getItem(SIDEBAR_USER_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const persistSidebarCollapsed = (
  sidebarCollapsed: boolean,
  userId?: string | null,
) => {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarCollapsed));
    if (userId) {
      localStorage.setItem(SIDEBAR_USER_STORAGE_KEY, userId);
    } else {
      localStorage.removeItem(SIDEBAR_USER_STORAGE_KEY);
    }
  } catch {
    // Ignore quota errors and private browsing.
  }
  applySidebarCollapsed(sidebarCollapsed);
};
