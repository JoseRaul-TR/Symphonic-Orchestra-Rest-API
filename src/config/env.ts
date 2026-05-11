// src/config/env.ts
import { terminal } from "../utils/terminalColors.ts";

const REQUIRED_VARS = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
  "API_KEY",
] as const;

export const validateEnv = (): void => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Saknade miljövariabler: ${missing.join(", ")}`);
  }
  terminal.success("Alla miljövariabler finns.");
};
