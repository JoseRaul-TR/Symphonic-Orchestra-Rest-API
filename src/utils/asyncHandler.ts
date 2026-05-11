// src/utils/asyncHandler.ts
import type { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async Express handler so that any rejected promise or thrown error
 * is automatically forwarded to the central error middleware via `next(err)`.
 *
 * Without this wrapper every async controller would need its own try/catch.
 * With it, controllers can throw AppError (or let DB errors bubble up) freely.
 *
 * @param fn - Async Express RequestHandler to wrap
 * @returns    Synchronous RequestHandler safe for use in Express route definitions
 *
 * @example
 *   router.get("/", asyncHandler(async (req, res) => {
 *     const data = await someService.getAll();
 *     res.json(data);
 *   }));
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
