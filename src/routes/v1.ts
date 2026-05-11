// src/routes/v1.ts
import { Router } from "express";
import musicianRoutes from "./musiciansRoutes.ts";
import instrumentsRoutes from "./instrumentsRoutes.ts";

const v1Router = Router();

v1Router.use("/musicians", musicianRoutes);
v1Router.use("/instruments", instrumentsRoutes);

export default v1Router;