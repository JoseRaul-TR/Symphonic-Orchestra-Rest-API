// src/controllers/instrumentsController.ts
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { AppError } from "../utils/AppError.ts";
import { instrumentsService } from "../services/instrumentsService.ts";
import { validateInstrumentRules } from "../middleware/validateInstruments.ts";

/** Gets all instruments by applying filters and sorting */
export const getInstruments = asyncHandler(async (req, res) => {
  const data = await instrumentsService.getAll(req.query as any);
  res.json({ count: data.length, data });
});

/** Gets a specific instrument using the ID validated in the middleware */
export const getInstrumentById = asyncHandler(async (_req, res) => {
  const instrument = await instrumentsService.getByID(res.locals.id);
  if (!instrument) throw new AppError("Instrumentet hittades inte.", 404);
  res.json(instrument);
});

/** Create an instrument by first validating the business rules (CHECK constraints) */
export const createInstrument = asyncHandler(async (req, res) => {
  const body = req.body;
  if (!body.type || !body.owner_type) {
    throw new AppError("Fälten 'type' och 'owner_type' är obligatoriska.", 400);
  }

  validateInstrumentRules(body);
  const newInstrument = await instrumentsService.create(body);
  res.status(201).json(newInstrument);
});

/** Partially updates an instrument by mixing the current state with the patch */
export const updateInstrument = asyncHandler(async (req, res) => {
  const id = res.locals.id;
  const current = await instrumentsService.getByID(id);
  if (!current) throw new AppError("Instrumentet hittades inte.", 404);

  const merged = { ...current, ...req.body };
  validateInstrumentRules(merged);

  const updated = await instrumentsService.update(id, req.body);
  res.json(updated);
});

/** Remove an instrument from the inventory */
export const deleteInstrument = asyncHandler(async (_req, res) => {
  const deleted = await instrumentsService.delete(res.locals.id);
  if (!deleted) throw new AppError("Instrumentet hittades inte.", 404);
  res.status(204).send();
});

/** Gets the complete inventory including data of the musician owners (JOIN) */
export const getInventoryWithOwners = asyncHandler(async (_req, res) => {
  const data = await instrumentsService.getInventoryWithOwners();
  res.json({ count: data.length, data });
});
