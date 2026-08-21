import { createReadStream } from "node:fs";
import { access, mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "../../config/env.js";
import { AppError } from "../../utils/AppError.js";

const resolveUploadRoot = () =>
  path.isAbsolute(env.UPLOAD_DIR)
    ? env.UPLOAD_DIR
    : path.resolve(process.cwd(), env.UPLOAD_DIR);

export const buildStorageKey = (
  tenantId: string,
  transactionId: string,
  attachmentId: string,
  originalName: string,
) => {
  const safe = originalName
    .replace(/[^a-zA-Z0-9._-]+/g, "_")
    .slice(0, 80);
  return path.posix.join(tenantId, transactionId, `${attachmentId}-${safe}`);
};

const absolutePathForKey = (storageKey: string) => {
  const root = resolveUploadRoot();
  const absolute = path.resolve(root, storageKey);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    throw new AppError("Invalid storage key", 400, "INVALID_STORAGE_KEY");
  }
  return absolute;
};

export const saveUploadBytes = async (storageKey: string, bytes: Buffer) => {
  const absolute = absolutePathForKey(storageKey);
  await mkdir(path.dirname(absolute), { recursive: true });
  await writeFile(absolute, bytes);
};

export const openUploadStream = async (storageKey: string) => {
  const absolute = absolutePathForKey(storageKey);
  try {
    await access(absolute);
  } catch {
    throw new AppError("Attachment file missing", 404, "ATTACHMENT_FILE_MISSING");
  }
  return createReadStream(absolute);
};

export const deleteUploadBytes = async (storageKey: string) => {
  const absolute = absolutePathForKey(storageKey);
  try {
    await unlink(absolute);
  } catch {
    // Soft-delete still succeeds if the file was already removed.
  }
};
