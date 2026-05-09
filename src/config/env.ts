// src/config/env.ts
const REQUIRED_VARS = [
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_NAME",
] as const;

export const validateEnv = () => {
  const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
  if (missing.length > 0) {
    throw new Error(`Saknade miljövariabler: ${missing.join(", ")}`);
  }
  return console.log("Alla miljövariabler finns.");
};
