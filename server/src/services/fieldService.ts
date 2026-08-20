import type { FieldDefinition } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { writeAuditLog } from "./auditService.js";
import { AppError } from "../utils/AppError.js";
import { slugify } from "../utils/slug.js";
import type {
  CreateFieldInput,
  ListFieldsQuery,
  UpdateFieldInput,
} from "../validators/fieldValidators.js";

const fieldKeyFromLabel = (label: string) => {
  const base = slugify(label).replace(/-/g, "_");
  return /^[a-z]/.test(base) ? base : `field_${base}`;
};

const toPublicField = (field: FieldDefinition) => ({
  id: field.id,
  tenantId: field.tenantId,
  target: field.target,
  key: field.key,
  label: field.label,
  fieldType: field.fieldType,
  required: field.required,
  enabled: field.enabled,
  sortOrder: field.sortOrder,
  options: field.options,
  showInReports: field.showInReports,
  visibleToNormalUser: field.visibleToNormalUser,
  defaultValue: field.defaultValue,
  createdAt: field.createdAt.toISOString(),
  updatedAt: field.updatedAt.toISOString(),
});

const uniqueFieldKey = async (
  tenantId: string,
  target: CreateFieldInput["target"],
  base: string,
) => {
  let key = base.slice(0, 80);
  let n = 2;

  while (
    await prisma.fieldDefinition.findUnique({
      where: { tenantId_target_key: { tenantId, target, key } },
    })
  ) {
    const suffix = `_${n}`;
    key = `${base.slice(0, Math.max(1, 80 - suffix.length))}${suffix}`;
    n += 1;
  }

  return key;
};

const getFieldForTenant = async (tenantId: string, id: string) => {
  const field = await prisma.fieldDefinition.findUnique({ where: { id } });
  if (!field || field.tenantId !== tenantId) {
    throw new AppError("Field not found", 404, "FIELD_NOT_FOUND");
  }
  return field;
};

export const listFieldDefinitions = async (
  tenantId: string,
  query: ListFieldsQuery,
) => {
  const fields = await prisma.fieldDefinition.findMany({
    where: {
      tenantId,
      ...(query.target ? { target: query.target } : {}),
      ...(query.enabled !== undefined ? { enabled: query.enabled } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return fields.map(toPublicField);
};

export const getFieldDefinition = async (tenantId: string, id: string) =>
  toPublicField(await getFieldForTenant(tenantId, id));

export const createFieldDefinition = async (
  tenantId: string,
  input: CreateFieldInput,
  actorId: string,
) => {
  const baseKey = input.key ?? fieldKeyFromLabel(input.label);
  const key = await uniqueFieldKey(tenantId, input.target, baseKey);

  try {
    const field = await prisma.fieldDefinition.create({
      data: {
        tenantId,
        target: input.target,
        key,
        label: input.label,
        fieldType: input.fieldType,
        required: input.required ?? false,
        enabled: input.enabled ?? true,
        sortOrder: input.sortOrder ?? 0,
        options: input.options ?? Prisma.JsonNull,
        showInReports: input.showInReports ?? true,
        visibleToNormalUser: input.visibleToNormalUser ?? false,
        defaultValue:
          input.defaultValue === undefined
            ? Prisma.JsonNull
            : (input.defaultValue as Prisma.InputJsonValue),
      },
    });

    const publicField = toPublicField(field);

    await writeAuditLog({
      actor: { id: actorId, tenantId },
      action: "CREATE",
      entityType: "FieldDefinition",
      entityId: field.id,
      tenantId,
      newValues: publicField,
    });

    return publicField;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new AppError("Field key already exists", 409, "FIELD_KEY_TAKEN");
    }
    throw error;
  }
};

export const updateFieldDefinition = async (
  tenantId: string,
  id: string,
  input: UpdateFieldInput,
  actorId: string,
) => {
  const existing = await getFieldForTenant(tenantId, id);

  const field = await prisma.fieldDefinition.update({
    where: { id },
    data: {
      ...(input.label !== undefined ? { label: input.label } : {}),
      ...(input.fieldType !== undefined ? { fieldType: input.fieldType } : {}),
      ...(input.required !== undefined ? { required: input.required } : {}),
      ...(input.enabled !== undefined ? { enabled: input.enabled } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.options !== undefined
        ? {
            options:
              input.options === null
                ? Prisma.JsonNull
                : (input.options as Prisma.InputJsonValue),
          }
        : {}),
      ...(input.showInReports !== undefined
        ? { showInReports: input.showInReports }
        : {}),
      ...(input.visibleToNormalUser !== undefined
        ? { visibleToNormalUser: input.visibleToNormalUser }
        : {}),
      ...(input.defaultValue !== undefined
        ? {
            defaultValue:
              input.defaultValue === null
                ? Prisma.JsonNull
                : (input.defaultValue as Prisma.InputJsonValue),
          }
        : {}),
    },
  });

  const publicField = toPublicField(field);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "UPDATE",
    entityType: "FieldDefinition",
    entityId: field.id,
    tenantId,
    oldValues: toPublicField(existing),
    newValues: publicField,
  });

  return publicField;
};

export const deleteFieldDefinition = async (
  tenantId: string,
  id: string,
  actorId: string,
) => {
  const existing = await getFieldForTenant(tenantId, id);
  await prisma.fieldDefinition.delete({ where: { id } });

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "DELETE",
    entityType: "FieldDefinition",
    entityId: existing.id,
    tenantId,
    oldValues: toPublicField(existing),
  });
};
