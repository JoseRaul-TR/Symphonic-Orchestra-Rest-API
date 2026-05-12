// src/config/env.ts
import { apiKeyAuth } from "../middleware/auth.ts";
import { terminal } from "../utils/terminalColors.ts";

const REQUIRED_VARS = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "API_KEY",
] as const;

/**
 * Validates that all required environment variables are set.
 * Throws on missing vars so the server never starts in a broken state.
 */
export const validateEnv = (): void => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Saknade miljövariabler: ${missing.join(", ")}`);
  }
  terminal.success("Alla miljövariabler finns.");
};

/**
 * Typed, centralised config object derived from environment variables.
 *
 * Usage across the app:
 *   import { config } from "../config/env.ts";
 *   config.isDev   → true in development
 *   config.db.port → MySQL port
 */
export const config = {
  // Server
  port: Number(process.env.PORT) || 3000,
  env: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") === "development",
  isProd: process.env.NODE_ENV === "production",

  // CORS – used in app.ts to lock down origin in production
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // MySQL – mirrors the pool config in db.ts
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "",
  },

  // auth
  apiKey: process.env.API_KEY ?? "",
} as const;
