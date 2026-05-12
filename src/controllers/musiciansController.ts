// src/controllers/musiciansController.ts
import { asyncHandler } from "../utils/asyncHandler.ts";
import { AppError } from "../utils/AppError.ts";
import { musiciansService } from "../services/musiciansService.ts";
import { validateMusicianRules } from "../middleware/validateMusician.ts";
import { parsePaginationParam } from "../utils/pagination.ts";
import type { MusicianFilters } from "../types/musicians.ts";

export const getMusicians = asyncHandler(async (req, res) => {
  const {
    page: pageStr,
    limit: limitStr,
    orchestra_member,
    ...rest
  } = req.query;

  const page = Math.max(1, parsePaginationParam(pageStr, 1));
  const limit = Math.min(100, Math.max(1, parsePaginationParam(limitStr, 20)));

  const filters: MusicianFilters = {
    ...rest,
  };

  if (orchestra_member !== undefined) {
    filters.orchestra_member = orchestra_member === "true";
  }
  const result = await musiciansService.getAll(filters, page, limit);

  res.json(result);
});

export const getMusicianStats = asyncHandler(async (_req, res) => {
  const stats = await musiciansService.getStats();
  res.json(stats);
});

export const getMusicianById = asyncHandler(async (_req, res) => {
  const musician = await musiciansService.getByID(res.locals.id);
  if (!musician) throw new AppError("Musikern hittades inte.", 404);
  res.json(musician);
});

export const createMusician = asyncHandler(async (req, res) => {
  validateMusicianRules(req.body);
  res.status(201).json(await musiciansService.create(req.body));
});

export const updateMusician = asyncHandler(async (req, res) => {
  const id = res.locals.id;
  const current = await musiciansService.getByID(id);
  if (!current) throw new AppError("Musikern hittades inte.", 404);

  validateMusicianRules({ ...current, ...req.body });
  res.json(await musiciansService.update(id, req.body));
});

export const deleteMusician = asyncHandler(async (_req, res) => {
  const deleted = await musiciansService.delete(res.locals.id);
  if (!deleted) throw new AppError("Musikern hittades inte.", 404);
  res.status(204).send();
});
