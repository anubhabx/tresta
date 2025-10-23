import {
  createProject,
  listProjects,
  getProjectBySlug,
  getPublicProjectBySlug,
  updateProject,
  deleteProject,
} from "../controllers/project.controller.ts";
import { Router } from "express";
import { testimonialRouter } from "./testimonial.route.ts";

const router: Router = Router();

router.post("/", createProject);
router.get("/", listProjects);
router.get("/:slug", getProjectBySlug);
router.put("/:slug", updateProject);
router.delete("/:slug", deleteProject);

// Nest testimonial routes under /:slug/testimonials
router.use("/:slug/testimonials", testimonialRouter);

export { router as projectRouter };
