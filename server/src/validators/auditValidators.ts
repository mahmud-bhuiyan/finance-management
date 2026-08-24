import { z } from "zod";

export const listAuditLogsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(25),
  action: z.enum(["CREATE", "UPDATE", "DELETE"]).optional(),
  entityType: z.string().min(1).optional(),
  entityId: z.string().min(1).optional(),
  tenantId: z.string().min(1).optional(),
});

export type ListAuditLogsInput = z.infer<typeof listAuditLogsSchema>;
