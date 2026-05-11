// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { logError } from "../utils/logger.ts";
import { getClientIp } from "../utils/requestUtils.ts";

/**
 * Central Express error-handling middleware.
 * Must be registered last in app.ts (after all routes).
 *
 * Responsibilities:
 *   1. Log the original error with IP before any message transformation.
 *   2. Map known MySQL error codes to user-friendly AppErrors.
 *   3. Return a safe JSON response — 500 messages never leak internal details.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error = { ...err, message: err.message };
  const ip = getClientIp(req);

  logError(err, ip); // log original error before transforming

  if (err.code === "ER_DUP_ENTRY") {
    error = new AppError("Posten finns redan.", 409);
  }
  if (err.code === "ER_DATA_TOO_LONG") {
    error = new AppError("Ett eller flera fält är för långa.", 400);
  }
  if (err.code === "ER_BAD_NULL_ERROR") {
    error = new AppError("Ett obligatoriskt fält saknar värde.", 400);
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    error = new AppError("Refererat id finns inte i databasen.", 400);
  }
  if (err.code === "ER_CHECK_CONSTRAINT_VIOLATED")
    error = new AppError(
      "Datakontroll misslyckades: fälten är inkonsistenta.",
      400,
    );

  const statusCode: number = error.statusCode ?? 500;
  const message: string =
    statusCode === 500 ? "Internt serverfel." : error.message;

  if (statusCode === 500) console.error("KRITISKT FEL:", err);

  res.status(statusCode).json({ error: message });
};
