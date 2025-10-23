import { Router } from "express";
import { getPublicProjectBySlug } from "../controllers/project.controller.ts";

const router: Router = Router();

// Public project endpoint - no authentication required
router.get("/projects/:slug", getPublicProjectBySlug);

export { router as publicRouter };
