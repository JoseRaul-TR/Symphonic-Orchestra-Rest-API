// src/utils/logger.ts
import fs from "node:fs/promises";
import path from "node:path";

const ACCESS_LOG = path.join(process.cwd(), "access.log");
const ERROR_LOG = path.join(process.cwd(), "error.log");

/**
 * Appends a raw string message to a log file.
 * Never throws — a logging failure must never crash the application.
 */
const writeToLog = async (file: string, message: string): Promise<void> => {
  try {
    await fs.appendFile(file, message, "utf-8");
  } catch {
    console.error("Kunde inte skriva till loggfilen.");
  }
};

/**
 * Logs an HTTP request entry to access.log.
 *
 * The IP address is optional: the requestLogger middleware decides whether
 * to include it based on HTTP method and response status, keeping successful
 * GET logs lightweight and avoiding unnecessary data collection.
 *
 * @param method     - HTTP method (GET, POST, …)
 * @param url        - Full request URL including query string
 * @param status     - HTTP response status code
 * @param durationMs - Time from request receipt to response finish, in milliseconds
 * @param ip         - Client IP; included only for mutations and error responses
 */
export const logAccess = async (
  method: string,
  url: string,
  status: number,
  durationMs: number,
  ip?: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const ipPart = ip ? ` | IP: ${ip}` : "";
  const line = `[${timestamp}] ${method.padEnd(6)} ${status} ${String(durationMs).padStart(5)}ms ${url}${ipPart}\n`;

  await writeToLog(ACCESS_LOG, line);
};

/**
 * Logs a full error entry to error.log, including the stack trace.
 * Always called with the original error (before message transformation)
 * so raw MySQL codes and the original stack trace are preserved.
 *
 * @param err - Any error object (AppError, MySQL error, or generic Error)
 * @param ip  - Client IP address of the request that triggered the error
 */
export const logError = async (err: any, ip?: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const ipPart = ip ? ` | IP: ${ip}` : "";
  const message =
    `[${timestamp}] ERROR | STATUS: ${err.statusCode ?? 500} | CODE: ${err.code ?? "N/a"}${ipPart} | ${err.message}\n` +
    `STACK: ${err.stack}\n${"-".repeat(60)}\n`;

  await writeToLog(ERROR_LOG, message);
};
