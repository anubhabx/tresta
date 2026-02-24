import {
  createTestimonial,
  listTestimonials,
  getTestimonialById,
  updateTestimonial,
  deleteTestimonial,
  getModerationQueue,
  bulkModerationAction,
  updateModerationStatus,
} from '../controllers/testimonial.controller.js';
import { Router } from "express";
import { attachUser, requireAuth } from '../middleware/auth.middleware.js';

const router: Router = Router({ mergeParams: true });

// Public route - no auth required for testimonial submission
router.post("/", createTestimonial);

// Protected routes - require authentication
router.get("/", attachUser, requireAuth, listTestimonials);
router.get("/:id", attachUser, requireAuth, getTestimonialById);
router.put("/:id", attachUser, requireAuth, updateTestimonial);
router.delete("/:id", attachUser, requireAuth, deleteTestimonial);

// Moderation routes
router.get("/moderation/queue", attachUser, requireAuth, getModerationQueue);
router.post("/moderation/bulk", attachUser, requireAuth, bulkModerationAction);
router.put("/:id/moderation", attachUser, requireAuth, updateModerationStatus);

export { router as testimonialRouter };
