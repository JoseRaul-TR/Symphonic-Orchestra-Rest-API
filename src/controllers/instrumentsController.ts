// src/controllers/instrumentsController.ts
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.ts";
import { instrumentsService } from "../services/instrumentsService.ts";

export const getInstruments = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { type } = req.query;
    const instruments = await instrumentsService.getAll(type as string);
    res.json(instruments);
  } catch (error) {
    next(error);
  }
};

export const getInventory = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await instrumentsService.getInventoryWithOwners();
    res.json({
      count: data.length,
      timestamp: new Date(),
      data,
    });
  } catch (error) {
    next(error);
  }
};
