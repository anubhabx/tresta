import {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getModerationQueue,
  bulkModerationAction,
  updateModerationStatus
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

// Moderation routes
router.get("/moderation/queue", attachUser, getModerationQueue);
router.post("/moderation/bulk", attachUser, bulkModerationAction);
router.put("/:id/moderation", attachUser, updateModerationStatus);

export { router as testimonialRouter };
