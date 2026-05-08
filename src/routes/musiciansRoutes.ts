// src/routes/musiciansRoutes.ts
import { Router } from "express";
import * as ctrl from "../controllers/musiciansController.ts";
import { validateId } from "../middleware/validateId.ts";

const router = Router();

router.get("/", ctrl.getMusicians);
router.post("/", ctrl.createMusician);

// Routes with ID validation
router.get("/:id", validateId, ctrl.getMusicianById);
router.put("/:id", validateId, ctrl.updateMusician);
router.patch("/:id", validateId, ctrl.updateMusician); // same handler than PUT for partial update
router.delete("/:id", validateId, ctrl.deleteMusician);

export default router;
