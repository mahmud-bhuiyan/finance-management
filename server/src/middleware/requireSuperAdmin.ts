import { requireRoles } from "./requireRoles.js";

export const requireSuperAdmin = requireRoles("SUPER_ADMIN");
