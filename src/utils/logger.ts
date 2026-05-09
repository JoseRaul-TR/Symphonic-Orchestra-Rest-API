// src/utils/logger.ts
import fs from "node:fs/promises";
import path from "node:path";

const LOG_FILE = path.join(process.cwd(), "app.log");

const writeToLog = async (message: string): Promise<void> => {
  try {
    await fs.appendFile(LOG_FILE, message, "utf-8");
  } catch {
    console.error("Kunde inte skriva till loggfilen.");
  }
};

/**
 * Logs every HTTP request.
 * IP is included for mutations and errors; omitted for successful GETs.
 */
export const logRequest = async (
  method: string,
  url: string,
  status: number,
  durationMs: number,
  ip?: string,
): Promise<void> => {
  const timestamp = new Date().toISOString();
  const ipPart = ip ? ` | IP: ${ip}` : "";
  const line = `[${timestamp}] ${method.padEnd(6)} ${status} ${String(durationMs).padStart(5)}ms ${url}${ipPart}\n`;

  console.log(line.trimEnd()); // also visible in terminal during dotenv
  await writeToLog(line);
};

/** Logs errors with timestamp, status, code, IP and stack trace */
export const logError = async (err: any, ip?: string): Promise<void> => {
  const timestamp = new Date().toISOString();
  const ipPart = ip ? ` | IP: ${ip}` : "";
  const message =
    `[${timestamp}] ERROR | STATUS: ${err.statusCode ?? 500} | CODE: ${err.code ?? "N/a"}${ipPart} | ${err.message}\n]` +
    `STACK: ${err.stack}\n${"-".repeat(60)}\n`;

  await writeToLog(message);
};
