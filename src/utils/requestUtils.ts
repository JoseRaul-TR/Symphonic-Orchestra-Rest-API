// src/utils/requestUtils.ts
import type { Request } from "express";

/**
 * Extracts the client IP address from an Express request.
 *
 * Resolution order:
 *   1. req.ip        – Express property; respects the 'trust proxy' setting,
 *                      so it correctly unwraps X-Forwarded-For when behind a proxy.
 *   2. remoteAddress – Raw socket address, used as a last resort when req.ip
 *                      is unavailable (e.g. in certain test environments).
 *   3. "Unknown"     – Fallback string if neither source yields a value.
 *
 * @param req - Express Request object
 * @returns     IP address string
 */
export const getClientIp = (req: Request): string =>
  req.ip ?? req.socket.remoteAddress ?? "Unknown";
