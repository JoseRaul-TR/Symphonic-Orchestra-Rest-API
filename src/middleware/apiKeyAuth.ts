// src/middleware/apiKeyAuth.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

/**
 * Protects mutating endpoints (POST / PUT / PATCH / DELETE).
 * Clients must send the header: X-API-Key: <value of API_KEY in .env>
 */
export const apiKeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const provided = req.headers["x-api-key"];
  const expected = process.env.API_KEY;

  if (!provided || provided !== expected) {
    return next(new AppError("Ogiltg eller saknad API-nyckel.", 401));
  }
  next();
};
