// src/middleware/validateId.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return next(
      new AppError("Ogiltigt ID. ID måste vara ett positivt heltal.", 400),
    );
  }
  // Save the already validated ID in res.locals to be consumed in controllers
  res.locals.id = id;
  next();
};
