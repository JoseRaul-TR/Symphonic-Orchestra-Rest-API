// src/middleware/errorHandler.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { logError } from "../utils/logger.ts";
import { getClientIp } from "../utils/requestUtils.ts";
import { terminal } from "../utils/terminalColors.ts";
import { config } from "../config/env.ts";

/**
 * Determines the error message sent to the client based on error type and environment.
 *
 * Safety rules:
 *   - AppError messages are intentionally written for clients — always safe to expose.
 *   - In development, unknown errors expose their raw message to ease debugging.
 *   - In production, unknown errors return a generic string — no internals are leaked.
 *
 * @param err - The error after MySQL code mapping (may be an AppError)
 * @returns     Client-safe message string
 */
const getErrorMessage = (err: any): string => {
  if (err instanceof AppError) return err.message;
  return config.isDev ? (err?.message ?? "Okänt fel.") : "Internt serverfel.";
};

/**
 * Maps MySQL error codes to [clientMessage, httpStatus] tuples.
 * Using a lookup object instead of chained if-statements keeps the handler DRY
 * and makes it trivial to add new MySQL error mappings.
 */

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
 * Central Express error-handling middleware — must be the last middleware in app.ts.
 *
 * Flow:
 *   1. Log the original error (with client IP) to error.log before any transformation.
 *   2. Map known MySQL error codes to user-friendly AppErrors with correct HTTP status.
 *   3. Print unexpected server errors to the terminal:
 *        development → full stack trace for debugging.
 *        production  → message only to avoid leaking internals.
 *   4. Send a safe JSON response to the client.
 */
export const errorHandler = async (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error: any = err;
  const ip = getClientIp(req);

  // Try to persist the original error before any transformation.
  // Logging failures must never break the response flow.
  try {
    await logError(err, ip);
  } catch {
    terminal.warning("Kunde inte skriva till error.log.");
  }

  // Map MySQL-specific error codes to AppError
  if (err.code && err.code in MYSQL_ERRORS) {
    const [message, status] = MYSQL_ERRORS[err.code]!;
    error = new AppError(message, status);
  }

  const statusCode: number = error.statusCode ?? 500;
  const message: string = getErrorMessage(error);

  // Print unexpected server errors (not AppError) to the terminal
  const isUnexpected = !(error instanceof AppError) || statusCode >= 500;

  if (isUnexpected) {
    if (config.isDev) {
      terminal.error(
        `[${statusCode}] ${err?.message ?? err}\n${err?.stack ?? ""}`,
      );
    } else {
      terminal.error(`[${statusCode}] ${err?.message ?? "Internt serverfel"}`);
    }
  }

  res.status(statusCode).json({ error: message });
};
