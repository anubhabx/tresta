import { createProject } from "../controllers/project.controller.ts";
import { Router } from "express";

const router: Router = Router();

router.post("/", createProject);

export { router as projectRouter };
