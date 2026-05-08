// src/controllers/musiciansController.ts
import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler.ts";
import { AppError } from "../utils/AppError.ts";
import { musiciansService } from "../services/musiciansService.ts";
import { validateMusicianRules } from "../middleware/validateMusicians.ts";

export const getMusicians = asyncHandler(async (req, res) => {
  const musicians = await musiciansService.getAll(req.query as any);
  res.json({ count: musicians.length, data: musicians });
});

export const getMusicianById = asyncHandler(async (req, res) => {
  const musician = await musiciansService.getByID(res.locals.id);
  if (!musician) throw new AppError("Musikern hittades inte.", 404);
  res.json(musician);
});

export const createMusician = asyncHandler(async (req, res) => {
  validateMusicianRules(req.body);
  const musician = await musiciansService.create(req.body);
  res.status(201).json(musician);
});

export const updateMusician = asyncHandler(async (req, res) => {
  const id = res.locals.id;
  const current = await musiciansService.getByID(id);
  if (!current) throw new AppError("Musikern hittades inte.", 404);

  const merged = { ...current, ...req.body };
  validateMusicianRules(merged);

  const updated = await musiciansService.update(id, req.body);
  res.json(updated);
});

export const deleteMusician = asyncHandler(async (req, res) => {
  const deleted = await musiciansService.delete(res.locals.id);
  if (!deleted) throw new AppError("Musikern hittades inte.", 404);
  res.status(204).send();
});
