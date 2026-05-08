// src/routes/musiciansRoutes.ts
import { Router } from "express";
import * as musiciansController from "../controllers/musiciansController.ts";

const router = Router();

router.get("/", musiciansController.getMusicians);
router.get("/:id", musiciansController.getMusicianById);
router.post("/", musiciansController.createMusician);
router.put("/:id", musiciansController.updateMusician);
router.patch("/:id", musiciansController.updateMusician); // same handler than PUT for partial update
router.delete("/:id", musiciansController.deleteMusician);

export default router;
