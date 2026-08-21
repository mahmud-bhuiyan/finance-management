import type { RequestHandler } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import {
  createAttachment,
  deleteAttachment,
  listAttachments,
  openAttachmentDownload,
} from "../services/attachmentService.js";
import { AppError } from "../utils/AppError.js";
import {
  attachmentIdParamSchema,
  expenseIdParamSchema,
} from "../validators/expenseValidators.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.UPLOAD_MAX_BYTES, files: 1 },
});

export const uploadMiddleware: RequestHandler = (req, res, next) => {
  upload.single("file")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        next(
          new AppError(
            `File must be at most ${env.UPLOAD_MAX_BYTES} bytes`,
            400,
            "ATTACHMENT_TOO_LARGE",
          ),
        );
        return;
      }
      next(new AppError(error.message, 400, "UPLOAD_ERROR"));
      return;
    }

    next(error);
  });
};

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { id } = expenseIdParamSchema.parse(req.params);
    const result = await listAttachments(req.user!.tenantId!, id);
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const create: RequestHandler = async (req, res, next) => {
  try {
    const { id } = expenseIdParamSchema.parse(req.params);
    const file = req.file;
    if (!file) {
      throw new AppError("file is required", 400, "FILE_REQUIRED");
    }

    const result = await createAttachment(
      req.user!.tenantId!,
      id,
      {
        originalName: file.originalname || "receipt",
        mimeType: file.mimetype,
        sizeBytes: file.size,
        buffer: file.buffer,
      },
      req.user!.id,
    );
    res.status(201).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const { id, attachmentId } = attachmentIdParamSchema.parse(req.params);
    await deleteAttachment(
      req.user!.tenantId!,
      id,
      attachmentId,
      req.user!.id,
    );
    res.status(200).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

export const download: RequestHandler = async (req, res, next) => {
  try {
    const { id, attachmentId } = attachmentIdParamSchema.parse(req.params);
    const { attachment, stream } = await openAttachmentDownload(
      req.user!.tenantId!,
      id,
      attachmentId,
    );

    res.setHeader("Content-Type", attachment.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${attachment.originalName.replace(/"/g, "")}"`,
    );
    res.setHeader("Content-Length", String(attachment.sizeBytes));
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};
