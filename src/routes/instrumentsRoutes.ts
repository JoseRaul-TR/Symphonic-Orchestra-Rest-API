// src/routes/instrumentsRoutes.ts
import { Router } from "express";
import * as instrumentsController from "../controllers/instrumentsController.ts";

const router = Router();

router.get("/", instrumentsController.getInstruments);
router.get("/inventory", instrumentsController.getInventory);

export default router;
