// src/utils/logger.ts
import fs from "node:fs/promises";
import path from "node:path";

const LOG_FILE = path.join(process.cwd(), "app.log");

/**
 * Register an error in the file app.log with timestamps.
 */
export const logError = async (err: any) => {
  const timestamp = new Date().toISOString();
  const errorCode = err.code ?? "N/A";
  const status = err.statusCode ?? 500;

  const logMessage =
    `[${timestamp} STATUS: ${status} | CODE: ${errorCode} | MESSAGE: ${err.message}\n]` +
    `STACK: ${err.stack}\n${"-".repeat(50)}\n`;

  try {
    await fs.appendFile(LOG_FILE, logMessage, "utf-8");
  } catch (loggingError) {
    console.error("Kunde inte skriva till loggfilen:", loggingError);
  }
};
