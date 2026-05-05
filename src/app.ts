// src/app.js
import express from "express";
import { AppError } from "./utils/AppError.ts";
import { errorHandler } from "./middleware/errorHandler.ts";
import instrumentsRoutes from "./routes/instrumentsRoutes.ts";

const app = express();
app.use(express.json());

// TODO -> app.use("api/musicians", musiciansRoutes)
app.use("/api/instruments", instrumentsRoutes)

// "404 Page Not Found" (Catch-all)
app.use((req, res, next) => {
  // Use next() with AppError so the central errorHandler manages it
  next(new AppError(`Sidan ${req.originalUrl} hittades inte.`, 404));
});

// Error Middleware (Always at the end)
app.use(errorHandler);

export default app;
