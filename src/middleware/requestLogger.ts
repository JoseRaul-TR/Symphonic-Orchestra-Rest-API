// src/middleware/requestLogger.ts
import type { Request, Response, NextFunction } from "express";
import { logAccess } from "../utils/logger.ts";
import { getClientIp } from "../utils/requestUtils.ts";

// Methods that modify server state — their logs always include the client IP
const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Express middleware that logs every HTTP request to access.log.
 *
 * IP is included only when it adds security value:
 *   - All mutation methods (POST / PUT / PATCH / DELETE)
 *   - Any response with status >= 400 (client or server errors)
 * Successful GET requests are logged without IP to reduce noise
 * and avoid unnecessary data collection.
 *
 * Uses the "finish" event which fires after the response is fully flushed,
 * so res.statusCode is guaranteed to be its final value.
 */
export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();
  const ip = getClientIp(req); // captured at request time before any async work

  res.on("finish", () => {
    const status = res.statusCode;
    const includeIp = MUTATION_METHODS.has(req.method) || status >= 400;

    logAccess(
      req.method,
      req.originalUrl,
      status,
      Date.now() - start,
      includeIp ? ip : undefined,
    );
  });

  next();
};
