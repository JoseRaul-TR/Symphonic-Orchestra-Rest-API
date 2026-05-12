// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { logError } from "../utils/logger.ts";
import { getClientIp } from "../utils/requestUtils.ts";
import { terminal } from "../utils/terminalColors.ts";
import { config } from "../config/env.ts";

/**
 * Determines the error message sent to the client.
 *
 * - AppError messages are always safe to expose (intentionally written for clients).
 * - In development, unknown errors expose their raw message to ease debugging.
 * - In production, unknown errors return a generic string — no internals leaked.
 *
 * @param err - The (possibly transformed) error object
 * @returns     Client-safe message string
 */
const getErrorMessage = (err: any): string => {
  if (err instanceof AppError) return err.message;
  if (config.isDev) return err.message ?? "unknown error";
  return "Internt serverfel.";
};

const MYSQL_ERRORS: Record<string, [string, number]> = {
  ER_DUP_ENTRY: ["Posten finns redan.", 409],
  ER_DATA_TOO_LONG: ["Ett eller flera fält är för långa.", 400],
  ER_BAD_NULL_ERROR: ["Ett obligatoriskt fält saknar värde.", 400],
  ER_NO_REFERENCED_ROW_2: ["Refererat id finns inte i databasen.", 400],
  ER_CHECK_CONSTRAINT_VIOLATED: [
    "Datakontroll misslyckades: fälten är inkonsistenta.",
    400,
  ],
};

/**
 * Central Express error-handling middleware — must be last in app.ts.
 *
 * Flow:
 *   1. Log the original error (with IP) before any transformation.
 *   2. Map known MySQL codes to AppErrors with appropriate HTTP status.
 *   3. Print critical (500) errors to the terminal in development.
 *   4. Send a safe JSON response to the client.
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: any = err;
  const ip = getClientIp(req);

  logError(err, ip); // always log the raw original error

  // Map MySQL error codes -> AppError
  if (err.code && err.code in MYSQL_ERRORS) {
    const [message, status] = MYSQL_ERRORS[err.code]!;
    error = new AppError(message, status);
  }

  const statusCode: number = error.statusCode ?? 500;
  const message: string = getErrorMessage(error);

  // Print unexpected server errors to the terminal (dev + prod)
  // but show full stack only in development
  if (!(error instanceof AppError)) {
    config.isDev
      ? terminal.error(`[${statusCode}] ${err.message}\n${err.stack}`)
      : terminal.error(`[${statusCode}] ${err.message}`);
  }

  res.status(statusCode).json({ error: message });
};
