// src/app.ts
import express from "express";
import cors from "cors";
import { AppError } from "./utils/AppError.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import { requestLogger } from "./middleware/requestLogger.ts";
import v1Router from "./routes/v1.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// health check – not versioned, always available
app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

// Versioned API
app.use("/api/v1", v1Router);

// "404 Page Not Found" (Catch-all)
app.use((req, res, next) => {
  next(new AppError(`Sidan ${req.originalUrl} hittades inte.`, 404));
});

app.use(errorHandler);

export default app;
