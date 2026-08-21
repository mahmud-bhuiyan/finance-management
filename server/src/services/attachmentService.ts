import type { ExpenseAttachment } from "@prisma/client";
import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { writeAuditLog } from "./auditService.js";
import {
  buildStorageKey,
  deleteUploadBytes,
  openUploadStream,
  saveUploadBytes,
} from "./storage/localStorage.js";

const ENTITY_TYPE = "ExpenseAttachment";

export const ALLOWED_ATTACHMENT_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export type UploadedFileInput = {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
};

const toPublicAttachment = (row: ExpenseAttachment) => ({
  id: row.id,
  tenantId: row.tenantId,
  transactionId: row.transactionId,
  originalName: row.originalName,
  mimeType: row.mimeType,
  sizeBytes: row.sizeBytes,
  createdById: row.createdById,
  createdAt: row.createdAt.toISOString(),
});

const getExpenseRow = async (tenantId: string, expenseId: string) => {
  const expense = await prisma.financialTransaction.findUnique({
    where: { id: expenseId },
  });

  if (
    !expense ||
    expense.tenantId !== tenantId ||
    expense.type !== "EXPENSE" ||
    expense.deletedAt
  ) {
    throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
  }

  return expense;
};

const getAttachmentForExpense = async (
  tenantId: string,
  expenseId: string,
  attachmentId: string,
) => {
  const attachment = await prisma.expenseAttachment.findUnique({
    where: { id: attachmentId },
  });

  if (
    !attachment ||
    attachment.tenantId !== tenantId ||
    attachment.transactionId !== expenseId ||
    attachment.deletedAt
  ) {
    throw new AppError("Attachment not found", 404, "ATTACHMENT_NOT_FOUND");
  }

  return attachment;
};

export const listAttachments = async (tenantId: string, expenseId: string) => {
  await getExpenseRow(tenantId, expenseId);

  const rows = await prisma.expenseAttachment.findMany({
    where: {
      tenantId,
      transactionId: expenseId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  return { attachments: rows.map(toPublicAttachment) };
};

export const createAttachment = async (
  tenantId: string,
  expenseId: string,
  file: UploadedFileInput,
  actorId: string,
) => {
  await getExpenseRow(tenantId, expenseId);

  if (!ALLOWED_ATTACHMENT_MIME.has(file.mimeType)) {
    throw new AppError(
      "Only JPEG, PNG, WebP, or PDF files are allowed",
      400,
      "ATTACHMENT_TYPE_INVALID",
    );
  }

  if (file.sizeBytes <= 0 || file.sizeBytes > env.UPLOAD_MAX_BYTES) {
    throw new AppError(
      `File must be between 1 byte and ${env.UPLOAD_MAX_BYTES} bytes`,
      400,
      "ATTACHMENT_TOO_LARGE",
    );
  }

  const activeCount = await prisma.expenseAttachment.count({
    where: {
      tenantId,
      transactionId: expenseId,
      deletedAt: null,
    },
  });

  if (activeCount >= env.UPLOAD_MAX_PER_EXPENSE) {
    throw new AppError(
      `At most ${env.UPLOAD_MAX_PER_EXPENSE} attachments per expense`,
      400,
      "ATTACHMENT_LIMIT",
    );
  }

  const fileToken = randomUUID();
  const storageKey = buildStorageKey(
    tenantId,
    expenseId,
    fileToken,
    file.originalName,
  );

  await saveUploadBytes(storageKey, file.buffer);

  let attachment;
  try {
    attachment = await prisma.expenseAttachment.create({
      data: {
        tenantId,
        transactionId: expenseId,
        originalName: file.originalName.slice(0, 200),
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        storageKey,
        createdById: actorId,
      },
    });
  } catch (error) {
    await deleteUploadBytes(storageKey);
    throw error;
  }

  const publicAttachment = toPublicAttachment(attachment);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "CREATE",
    entityType: ENTITY_TYPE,
    entityId: attachment.id,
    tenantId,
    newValues: publicAttachment,
  });

  return { attachment: publicAttachment };
};

export const deleteAttachment = async (
  tenantId: string,
  expenseId: string,
  attachmentId: string,
  actorId: string,
) => {
  const existing = await getAttachmentForExpense(
    tenantId,
    expenseId,
    attachmentId,
  );

  await prisma.expenseAttachment.update({
    where: { id: attachmentId },
    data: { deletedAt: new Date() },
  });

  await deleteUploadBytes(existing.storageKey);

  await writeAuditLog({
    actor: { id: actorId, tenantId },
    action: "DELETE",
    entityType: ENTITY_TYPE,
    entityId: existing.id,
    tenantId,
    oldValues: toPublicAttachment(existing),
  });
};

export const openAttachmentDownload = async (
  tenantId: string,
  expenseId: string,
  attachmentId: string,
) => {
  const attachment = await getAttachmentForExpense(
    tenantId,
    expenseId,
    attachmentId,
  );
  const stream = await openUploadStream(attachment.storageKey);
  return { attachment: toPublicAttachment(attachment), stream };
};
