// src/controllers/instrumentsController.ts
import { asyncHandler } from "../utils/asyncHandler.ts";
import { AppError } from "../utils/AppError.ts";
import { instrumentsService } from "../services/instrumentsService.ts";
import { validateInstrumentRules } from "../middleware/validateInstrument.ts";
import { parsePaginationParam } from "../utils/pagination.ts";
import type { InstrumentFilters } from "../types/instruments.ts";

export const getInstruments = asyncHandler(async (req, res) => {
  const { page: pageStr, limit: limitStr, ...filterQuery } = req.query;
  const page = Math.max(1, parsePaginationParam(pageStr, 1));
  const limit = Math.min(100, Math.max(1, parsePaginationParam(limitStr, 20)));

  res.json(
    await instrumentsService.getAll(
      filterQuery as InstrumentFilters,
      page,
      limit,
    ),
  );
});

export const getInstrumentById = asyncHandler(async (_req, res) => {
  const instrument = await instrumentsService.getByID(res.locals.id);
  if (!instrument) throw new AppError("Instrumentet hittades inte.", 404);
  res.json(instrument);
});

export const createInstrument = asyncHandler(async (req, res) => {
  if (!req.body.type || !req.body.owner_type) {
    throw new AppError("Fälten 'type' och 'owner_type' är obligatoriska.", 400);
  }
  validateInstrumentRules(req.body);
  res.status(201).json(await instrumentsService.create(req.body));
});

export const updateInstrument = asyncHandler(async (req, res) => {
  const id = res.locals.id;
  const current = await instrumentsService.getByID(id);
  if (!current) throw new AppError("Instrumentet hittades inte.", 404);
  validateInstrumentRules({ ...current, ...req.body });
  res.json(await instrumentsService.update(id, req.body));
});

export const deleteInstrument = asyncHandler(async (_req, res) => {
  const deleted = await instrumentsService.delete(res.locals.id);
  if (!deleted) throw new AppError("Instrumentet hittades inte.", 404);
  res.status(204).send();
});

export const getInventoryWithOwners = asyncHandler(async (req, res) => {
  const data = await instrumentsService.getInventoryWithOwners(
    req.query as InstrumentFilters,
  );
  res.json({ count: data.length, data });
});
