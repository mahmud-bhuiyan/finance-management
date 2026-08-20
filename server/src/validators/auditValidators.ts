import { z } from "zod";

export const listAuditLogsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  entityType: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;
