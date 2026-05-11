// src/middleware/apiKeyAuth.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

/**
 * Express middleware that guards mutating endpoints (POST / PUT / PATCH / DELETE)
 * with a static API key passed via the X-API-Key request header.
 *
 * The expected key is read from the API_KEY environment variable at request time
 * (not at module load), so changes to the env are picked up without restart.
 *
 * Usage in routes:
 *   router.post("/", apiKeyAuth, ctrl.createMusician);
 *
 * curl usage:
 *   curl -X POST ... -H "X-API-Key: your_key_here"
 */
export const apiKeyAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const provided = req.headers["x-api-key"];
  const expected = process.env.API_KEY;

  if (!provided || provided !== expected) {
    return next(new AppError("Ogiltig eller saknad API-nyckel.", 401));
  }
  next();
};
