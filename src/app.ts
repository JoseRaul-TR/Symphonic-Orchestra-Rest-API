// src/app.ts
import express from "express";
import cors from "cors";
import { config } from "./config/env.ts";
import { AppError } from "./utils/AppError.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { requestLogger } from "./middleware/requestLogger.ts";
import v1Router from "./routes/v1.ts";

const app = express();

// In production: only allow requests from the configured frontend origin.
// In development: allow all origins for easy local testing.
app.use(
  cors({
    origin: config.isProd ? config.frontendUrl : "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "X-API-Key"],
  }),
);

app.use(express.json());
app.use(requestLogger);

// Health check – intentionally unversioned so monitoring tools can always reach it
app.get("/health", (_req, res) => {
  res.json({
    status: "OK",
    env: config.env,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Versioned API
app.use("/api/v1", v1Router);

// "404 Page Not Found" (Catch-all)
app.use((req, _res, next) => {
  next(new AppError(`Sidan ${req.originalUrl} hittades inte.`, 404));
});

app.use(errorHandler);

export default app;
