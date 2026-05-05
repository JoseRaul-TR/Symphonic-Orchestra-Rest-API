// src/middleware/errorHandler.js
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  let error = { ...err };
  error.message = err.message;

  // MySQL Specific Errors
  if (err.code === "ER_DUP_ENTRY") {
    error = new AppError("Fordonet finns redan.", 400);
  }
  if (err.code === "ER_DATA_TOO_LONG") {
    error = new AppError("Ett eller flera fält är för långa.", 400);
  }

  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? "Internt serverfel." : error.message;

  if (statusCode === 500) console.error("Critical error:", err);

  res.status(statusCode).json({ error: message });
};
