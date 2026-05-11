// src/utils/logger.ts
import fs from "node:fs/promises";
import path from "node:path";

const ACCESS_LOG = path.join(process.cwd(), "access.log");
const ERROR_LOG = path.join(process.cwd(), "error.log");

/**
 * Appends a raw string message to the log file.
 * Logs a console warning if the write fails — never throws,
 * so a logging failure never crashes the application.
 */
const writeToLog = async (file: string, message: string): Promise<void> => {
  try {
    await fs.appendFile(file, message, "utf-8");
  } catch {
    console.error("Kunde inte skriva till loggfilen.");
  }
};

/**
 * Logs an HTTP request entry to the console and to app.log.
 *
 * The IP address is optional: callers (requestLogger middleware) decide
 * whether to include it based on the HTTP method and response status,
 * keeping GET-success logs lightweight and avoiding unnecessary data collection.
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

  console.log(line.trimEnd()); // visible in terminal during development
  await writeToLog(ACCESS_LOG, line);
};

/**
 * Logs a full error entry to app.log, including the stack trace.
 * Always called with the original error (before message transformation)
 * so the raw MySQL codes and original stack are preserved in the log.
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
