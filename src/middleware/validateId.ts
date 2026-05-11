// src/middleware/validateId.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";

/**
 * Express middleware that validates the :id route parameter.
 *
 * Rejects the request with 400 if the value is not a positive integer,
 * protecting all downstream handlers and services from invalid DB queries.
 * Stores the parsed integer in res.locals.id so controllers don't repeat
 * the conversion and can trust the value is already validated.
 *
 * Place before any controller that uses res.locals.id:
 *   router.get("/:id", validateId, ctrl.getById);
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    next(new AppError("Ogiltigt ID. ID måste vara ett positivt heltal.", 400));
  }
  res.locals.id = id;
  next();
};
