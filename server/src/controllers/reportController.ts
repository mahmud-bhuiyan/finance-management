import type { RequestHandler } from "express";
import {
  buildReportCsv,
  buildReportExcel,
  buildReportPdf,
  getReportSummary,
} from "../services/reportService.js";
import {
  reportExportQuerySchema,
  reportSummaryQuerySchema,
} from "../validators/reportValidators.js";

export const summary: RequestHandler = async (req, res, next) => {
  try {
    const query = reportSummaryQuerySchema.parse(req.query);
    const result = await getReportSummary(req.user!.tenantId!, query);
    res.status(200).json({ ok: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const exportCsv: RequestHandler = async (req, res, next) => {
  try {
    const query = reportExportQuerySchema.parse(req.query);
    const { csv, filename } = await buildReportCsv(
      req.user!.tenantId!,
      req.user!.role,
      query,
    );

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, "")}"`,
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportExcel: RequestHandler = async (req, res, next) => {
  try {
    const query = reportExportQuerySchema.parse(req.query);
    const { buffer, filename } = await buildReportExcel(
      req.user!.tenantId!,
      req.user!.role,
      query,
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, "")}"`,
    );
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const exportPdf: RequestHandler = async (req, res, next) => {
  try {
    const query = reportExportQuerySchema.parse(req.query);
    const { buffer, filename } = await buildReportPdf(
      req.user!.tenantId!,
      req.user!.role,
      query,
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename.replace(/"/g, "")}"`,
    );
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};
