// Zod schemas live in dedicated files (e.g. authValidators.ts).
export { loginSchema, registerSchema } from "./authValidators.js";
export {
  createCompanyAdminSchema,
  createTenantSchema,
  updateTenantSchema,
} from "./tenantValidators.js";
