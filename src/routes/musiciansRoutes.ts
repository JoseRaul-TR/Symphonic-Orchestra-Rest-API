// src/routes/musiciansRoutes.ts
import { Router } from "express";
import * as ctrl from "../controllers/musiciansController.ts";
import { validateId } from "../middleware/validateId.ts";
import { apiKeyAuth } from "../middleware/apiKeyAuth.ts";

const router = Router();

// Public read-only routes
router.get("/", ctrl.getMusicians);
router.get("/stats", ctrl.getMusicianStats);

// Protected write routes
router.post("/", apiKeyAuth, ctrl.createMusician);

// ID-validated routes
router.get("/:id", validateId, ctrl.getMusicianById);
router.put("/:id", validateId, apiKeyAuth, ctrl.updateMusician);
router.patch("/:id", validateId, apiKeyAuth, ctrl.updateMusician); // same handler than PUT for partial update
router.delete("/:id", validateId, apiKeyAuth, ctrl.deleteMusician);

export default router;
