// src/middleware/requestLogger.ts
import type { Request, Response, NextFunction } from "express";
import { logRequest } from "../utils/logger.ts";

const MUTATION_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const start = Date.now();
  // Capture IP at request time (req.ip respects the 'trust proxy' setting)
  const ip = req.ip ?? req.socket.remoteAddress ?? "Unknown";

  // "finish" fires after the response is fully sent
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    const includeIp = MUTATION_METHODS.has(req.method) || res.statusCode >= 400;

    logRequest(
      req.method,
      req.originalUrl,
      res.statusCode,
      durationMs,
      includeIp ? ip : undefined,
    );
  });
  next();
};
