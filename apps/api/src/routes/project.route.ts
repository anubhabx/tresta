import { createProject, listProjects } from "../controllers/project.controller.ts";
import { Router } from "express";

const router: Router = Router();

router.post("/", createProject);
router.get("/", listProjects);

export { router as projectRouter };
