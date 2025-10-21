import {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
} from "../controllers/testimonial.controller.ts";
import { Router } from "express";
import { attachUser } from "../middleware/auth.middleware.ts";

const router: Router = Router({ mergeParams: true });

// Public route - no auth required for testimonial submission
router.post("/", createTestimonial);

// Protected routes - require authentication
router.get("/", attachUser, listTestimonials);
router.get("/:id", attachUser, getTestimonialById);
router.put("/:id", attachUser, updateTestimonial);
router.delete("/:id", attachUser, deleteTestimonial);

export { router as testimonialRouter };
