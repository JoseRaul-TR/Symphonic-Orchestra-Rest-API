// src/utils/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an asynchronous function to automatically catch errors
 * and pass them to the global error middleware (next).
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
