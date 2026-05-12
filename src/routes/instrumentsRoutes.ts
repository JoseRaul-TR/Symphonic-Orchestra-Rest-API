// src/routes/instrumentsRoutes.ts
import { Router } from "express";
import * as ctrl from "../controllers/instrumentsController.ts";
import { validateId } from "../middleware/validateId.ts";
import { apiKeyAuth } from "../middleware/auth.ts";

const router = Router();

// Public read-only routes
router.get("/", ctrl.getInstruments);
router.get("/inventory", ctrl.getInventoryWithOwners);

// Protected write routes
router.post("/", apiKeyAuth, ctrl.createInstrument);

// ID-validated routes
router.get("/:id", validateId, ctrl.getInstrumentById);
router.put("/:id", validateId, apiKeyAuth, ctrl.updateInstrument);
router.patch("/:id", validateId, apiKeyAuth, ctrl.updateInstrument);
router.delete("/:id", validateId, apiKeyAuth, ctrl.deleteInstrument);

export default router;
