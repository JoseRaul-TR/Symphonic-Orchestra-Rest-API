// src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

/**
 * Guards mutating endpoints (POST / PUT / PATCH / DELETE) with a static API key.
 * Clients must include the header: X-API-Key: <value of API_KEY in .env>
 *
 * Two separate checks give distinct error messages to help debugging:
 *   - Missing header → 401 "saknas"
 *   - Wrong value    → 401 "Ogiltig"
 */
export const apiKeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const key = req.headers["x-api-key"];

  if (!key) {
    return next(
      new AppError("API-nyckel saknas. Ange x-api-key i headern.", 401),
    );
  }
  if (key !== process.env.API_KEY) {
    return next(new AppError("Ogiltig API-nyckel.", 401));
  }
  next();
};
