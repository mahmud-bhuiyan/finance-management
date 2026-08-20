import { AppError } from "./AppError.js";

export const assertSameTenant = (
  userTenantId: string | null,
  resourceTenantId: string,
) => {
  if (!userTenantId) {
    throw new AppError("Company membership required", 403, "TENANT_REQUIRED");
  }

  if (userTenantId !== resourceTenantId) {
    throw new AppError("Access denied for this company", 403, "TENANT_FORBIDDEN");
  }
};
