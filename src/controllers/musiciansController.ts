import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { validateMusicianRules } from "../middleware/validateMusician.ts";
import { musiciansService } from "../services/musiciansService.ts";
import type {
  CreateMusicianDTO,
  Section,
  MainInstrument,
  Role,
} from "../types/musicians.ts";
import type { MusicianFilters } from "../services/musiciansService.ts";

// ── GET /api/musicians/ ──────────────────────────────────────────────────────
export const getMusicians = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      orchestra_member,
      nationality,
      section,
      main_instrument,
      role,
      sortBy,
      order,
    } = req.query;

    const filters: MusicianFilters = {};

    if (orchestra_member !== undefined) {
      if (orchestra_member !== "true" && orchestra_member !== "false") {
        next(
          new AppError(
            "orchestra_member måste vara 'true' eller 'false'.",
            400,
          ),
        );
        return;
      }
      filters.orchestra_member = orchestra_member === "true";
    }

    if (nationality) filters.nationality = nationality as string;
    if (section) filters.section = section as Section;
    if (main_instrument)
      filters.main_instrument = main_instrument as MainInstrument;
    if (role) filters.role = role as Role;
    if (sortBy) filters.sortBy = sortBy as string;
    if (order)
      filters.order = (order as string).toUpperCase() as "ASC" | "DESC";

    const musicians = await musiciansService.getAll(filters);
    res.json({ count: musicians.length, data: musicians });
  } catch (err) {
    next(err);
  }
};

// ── GET /api/musicians/:id ───────────────────────────────────────────────────
export const getMusicianById = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      next(new AppError("Ogiltigt id.", 400));
      return;
    }

    const musician = await musiciansService.getByID(id);
    if (!musician) {
      next(new AppError(`Musikern med id: ${id} hittades inte.`, 404));
      return;
    }

    res.json(musician);
  } catch (err) {
    next(err);
  }
};

// ── POST /api/musicians/ ─────────────────────────────────────────────────────
export const createMusician = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const body = req.body as Partial<CreateMusicianDTO>;
    const { name, surname, birth_date, orchestra_member, nationality } = body;

    // Base required fields
    if (
      !name ||
      !surname ||
      !birth_date ||
      orchestra_member === undefined ||
      !nationality
    ) {
      next(
        new AppError(
          "Obligatoriska fält saknas: name, surname, birth_date, orchestra_member, nationality.",
          400,
        ),
      );
      return;
    }

    // Business rules from CHECK constraints
    validateMusicianRules(body);

    const musician = await musiciansService.create(body as CreateMusicianDTO);
    res.status(201).json(musician);
  } catch (err) {
    next(err);
  }
};

// ── PUT / PATCH /api/musicians/:id ───────────────────────────────────────────
export const updateMusician = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      next(new AppError("Ogiltigt id.", 400));
      return;
    }

    const patch = req.body as Partial<CreateMusicianDTO>;
    if (!patch || Object.keys(patch).length === 0) {
      next(new AppError("Request body får inte vara tomt.", 400));
      return;
    }

    // Fetch current state so we can validate the MERGED result,
    // not just the incoming patch in isolation.
    const current = await musiciansService.getByID(id);
    if (!current) {
      next(new AppError(`Musikern med id: ${id} hittades inte.`, 404));
      return;
    }

    // Merge: current values + incoming patch
    const merged: CreateMusicianDTO = { ...current, ...patch };

    // Validate merged state against all three CHECK constraints
    validateMusicianRules(merged);

    const updated = await musiciansService.update(id, patch);
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// ── DELETE /api/musicians/:id ────────────────────────────────────────────────
export const deleteMusician = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      next(new AppError("Ogiltigt id.", 400));
      return;
    }

    const deleted = await musiciansService.delete(id);
    if (!deleted) {
      next(new AppError(`Musikern med id: ${id} hittades inte.`, 404));
      return;
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
