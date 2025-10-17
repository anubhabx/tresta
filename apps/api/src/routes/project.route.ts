import {
  createProject,
  listProjects,
  getProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.ts";
import { Router } from "express";

const router: Router = Router();

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:slug", getProjectBySlug);
router.put("/:slug", updateProject);
router.delete("/:slug", deleteProject);

export { router as projectRouter };
