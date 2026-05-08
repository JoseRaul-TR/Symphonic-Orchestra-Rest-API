// src/routes/instrumentsRoutes.ts
import { Router } from "express";
import * as ctrl from "../controllers/instrumentsController.ts";
import { validateId } from "../middleware/validateId.ts";

const router = Router();

router.get("/", ctrl.getInstruments);
router.post("/", ctrl.createInstrument);
router.get("/inventory", ctrl.getInventoryWithOwners);

router.get("/:id", validateId, ctrl.getInstrumentById);
router.put("/:id", validateId, ctrl.updateInstrument);
router.patch("/:id", validateId, ctrl.updateInstrument);
router.delete("/:id", validateId, ctrl.deleteInstrument);

export default router;
